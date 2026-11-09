/**
 * assistenteService.ts
 * É aqui que o Node EXECUTA o que o Python entendeu.
 *
 * Fluxo de processarMensagem():
 *   1. envia a mensagem ao Python (NLU)         -> recebe intenção, dispositivo e ambiente
 *   2. escolhe a ação conforme a intenção       -> liga, desliga, consulta, lista...
 *   3. monta uma resposta em português para o usuário
 */
import { Dispositivo } from "../entities/Dispositivo";
import { dispositivoService, rotinaService } from "../container";
import { interpretarMensagem, Interpretacao } from "./nluService";

// ---------- Pequenos "dicionários" para deixar as respostas em bom português ----------

const GENERO: Record<string, "a" | "o"> = { luz: "a", ventilador: "o", ar_condicionado: "o", tv: "a" };

const NOME_DO_TIPO: Record<string, string> = {
  luz: "luz", ventilador: "ventilador", ar_condicionado: "ar-condicionado", tv: "TV",
};

const NO_AMBIENTE: Record<string, string> = {
  sala: "na sala", quarto: "no quarto", cozinha: "na cozinha",
  banheiro: "no banheiro", escritorio: "no escritório",
};

/** "Luz da sala" -> "A luz da sala" */
function comArtigo(d: Dispositivo): string {
  const artigo = GENERO[d.tipo] === "o" ? "O" : "A";
  const nome = d.tipo === "tv" ? d.nome : d.nome.charAt(0).toLowerCase() + d.nome.slice(1);
  return `${artigo} ${nome}`;
}

/** Devolve "ligada"/"desligada" (feminino) ou "ligado"/"desligado" (masculino). */
function textoDoEstado(d: Dispositivo, ligado: boolean): string {
  const final = GENERO[d.tipo] === "o" ? "o" : "a";
  return (ligado ? "lig" : "deslig") + "ad" + final;
}

const MENSAGEM_NAO_ENTENDI =
  'Desculpe, não entendi. Eu cuido apenas dos dispositivos da casa. ' +
  'Tente, por exemplo: "Apague a luz da sala" ou "A luz do quarto está ligada?".';

// ---------- Funções de cada intenção ----------

/** Busca os dispositivos pedidos e explica o problema quando não há exatamente um. */
async function localizarUnico(i: Interpretacao): Promise<{ dispositivo?: Dispositivo; erro?: string }> {
  if (!i.dispositivo) {
    return { erro: "Qual dispositivo você quer controlar? Eu conheço: luz, ventilador, ar-condicionado e TV." };
  }

  const encontrados = await dispositivoService.buscar({ tipo: i.dispositivo, ambiente: i.ambiente ?? undefined });
  const nomeTipo = NOME_DO_TIPO[i.dispositivo] ?? i.dispositivo;

  if (encontrados.length === 0) {
    const onde = i.ambiente ? ` ${NO_AMBIENTE[i.ambiente] ?? i.ambiente}` : "";
    return { erro: `Não encontrei nenhum dispositivo do tipo "${nomeTipo}"${onde}.` };
  }
  if (encontrados.length > 1) {
    const ambientes = encontrados.map((d) => d.ambiente).join(", ");
    return { erro: `Em qual ambiente? Tenho "${nomeTipo}" em: ${ambientes}.` };
  }
  return { dispositivo: encontrados[0] };
}

async function ligarOuDesligar(i: Interpretacao, ligar: boolean): Promise<string> {
  const { dispositivo, erro } = await localizarUnico(i);
  if (!dispositivo) return erro!;

  if (dispositivo.ligado === ligar) {
    return `${comArtigo(dispositivo)} já está ${textoDoEstado(dispositivo, ligar)}.`;
  }
  await dispositivoService.alterarEstado(dispositivo, ligar, "assistente");
  return `Pronto! ${comArtigo(dispositivo)} agora está ${textoDoEstado(dispositivo, ligar)}.`;
}

async function consultarEstado(i: Interpretacao): Promise<string> {
  if (!i.dispositivo) {
    return "De qual dispositivo você quer saber o estado? Eu conheço: luz, ventilador, ar-condicionado e TV.";
  }

  const encontrados = await dispositivoService.buscar({ tipo: i.dispositivo, ambiente: i.ambiente ?? undefined });
  if (encontrados.length === 0) {
    const nomeTipo = NOME_DO_TIPO[i.dispositivo] ?? i.dispositivo;
    const onde = i.ambiente ? ` ${NO_AMBIENTE[i.ambiente] ?? i.ambiente}` : "";
    return `Não encontrei nenhum dispositivo do tipo "${nomeTipo}"${onde}.`;
  }

  // Um dispositivo só: resposta direta. Vários (ex.: "as luzes"): uma linha para cada.
  return encontrados
    .map((d) => `${comArtigo(d)} está ${textoDoEstado(d, d.ligado)}.`)
    .join("\n");
}

async function responderDuvida(i: Interpretacao): Promise<string> {
  const lista = await dispositivoService.buscar({ tipo: i.dispositivo ?? undefined, ambiente: i.ambiente ?? undefined });
  const onde = i.ambiente ? ` ${NO_AMBIENTE[i.ambiente] ?? i.ambiente}` : "";

  if (lista.length === 0) {
    return `Não encontrei dispositivos${onde} com esse filtro.`;
  }

  // Pergunta sobre um dispositivo específico: "Tem TV na sala?"
  if (i.dispositivo) {
    return `Sim! Encontrei: ${lista.map((d) => d.nome).join(", ")}.`;
  }

  // Dispositivos de um ambiente
  if (i.ambiente) {
    return `Posso controlar${onde}: ${lista.map((d) => d.nome).join(", ")}.`;
  }

  // Casa inteira, agrupado por ambiente
  const porAmbiente: Record<string, string[]> = {};
  for (const d of lista) {
    (porAmbiente[d.ambiente] ??= []).push(d.nome);
  }
  const linhas = Object.entries(porAmbiente).map(([amb, nomes]) => `• ${amb}: ${nomes.join(", ")}`);
  return `Estes são os dispositivos da casa:\n${linhas.join("\n")}`;
}

/** "Quais são minhas rotinas?": mostra o que o Machine Learning aprendeu com o histórico. */
async function responderRotina(): Promise<string> {
  const { analisados, rotinas } = await rotinaService.obterRotinas();
  if (rotinas.length === 0) {
    return analisados === 0
      ? "Ainda não aprendi nenhuma rotina: preciso observar você usando a casa por alguns dias."
      : "Já observei alguns comandos, mas ainda não encontrei um hábito que se repita. Continue usando a casa!";
  }
  const agora = rotinas.filter((r) => r.sugerirAgora).map((r) => `💡 ${r.mensagem}`);
  const linhas = rotinas.slice(0, 6).map((r) => `• ${r.dispositivo_nome}: costuma ${r.acao} por volta das ${r.horario} (${r.ocorrencias} vezes)`);
  return [...agora, `Isto é o que aprendi com ${analisados} comandos seus:`, ...linhas].join("\n");
}

// ---------- Função principal ----------

export async function processarMensagem(mensagem: string) {
  const interpretacao = await interpretarMensagem(mensagem);

  let resposta: string;
  switch (interpretacao.intencao) {
    case "ligar_dispositivo":
      resposta = await ligarOuDesligar(interpretacao, true);
      break;
    case "desligar_dispositivo":
      resposta = await ligarOuDesligar(interpretacao, false);
      break;
    case "consultar_estado":
      resposta = await consultarEstado(interpretacao);
      break;
    case "duvida_dispositivo":
      resposta = await responderDuvida(interpretacao);
      break;
    case "consultar_rotina":
      resposta = await responderRotina();
      break;
    default: // "fora_do_escopo" ou "nao_entendi"
      resposta = MENSAGEM_NAO_ENTENDI;
  }

  // Devolvemos também a interpretação: ótimo para mostrar à banca o que o NLU entendeu
  return { resposta, interpretacao };
}
