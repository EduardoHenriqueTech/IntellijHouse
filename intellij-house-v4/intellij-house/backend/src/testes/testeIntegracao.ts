/**
 * testeIntegracao.ts
 * Teste de INTEGRAÇÃO (Etapa 6): envia mensagens reais ao Node, que chama o Python e o banco.
 *
 * Antes de rodar, deixe os DOIS servidores ligados:
 *   - Python (porta 5001):  python app.py
 *   - Node   (porta 3000):  npm run dev
 *
 * Depois, em outro terminal:  npm run testar
 *
 * Os testes rodam em ORDEM, pois um depende do estado deixado pelo anterior.
 */
const URL_BASE = process.env.API_URL || "http://localhost:3000";

interface Caso {
  descricao: string;
  mensagem: string;
  intencao: string | string[];
  dispositivo: string | null;
  ambiente: string | null;
  resposta: RegExp; // trecho esperado na resposta do assistente
}

const CASOS: Caso[] = [
  { descricao: "Desligar a luz da sala", mensagem: "Apague a luz da sala.",
    intencao: "desligar_dispositivo", dispositivo: "luz", ambiente: "sala", resposta: /desligada/ },
  { descricao: "Consultar a luz da sala (agora desligada)", mensagem: "A luz da sala está ligada?",
    intencao: "consultar_estado", dispositivo: "luz", ambiente: "sala", resposta: /está desligada/ },
  { descricao: "Ligar a luz da sala", mensagem: "Acenda a luz da sala",
    intencao: "ligar_dispositivo", dispositivo: "luz", ambiente: "sala", resposta: /ligada/ },
  { descricao: "Consultar a luz da sala (agora ligada)", mensagem: "A luz da sala está ligada?",
    intencao: "consultar_estado", dispositivo: "luz", ambiente: "sala", resposta: /está ligada/ },
  { descricao: "Ligar o ventilador do quarto", mensagem: "Liga o ventilador do quarto, por favor",
    intencao: "ligar_dispositivo", dispositivo: "ventilador", ambiente: "quarto", resposta: /ligado/ },
  { descricao: "Desligar a TV da sala", mensagem: "Pode desligar a televisão da sala?",
    intencao: "desligar_dispositivo", dispositivo: "tv", ambiente: "sala", resposta: /desligada/ },
  { descricao: "Listar dispositivos de um ambiente", mensagem: "Quais dispositivos tem na cozinha?",
    intencao: "duvida_dispositivo", dispositivo: null, ambiente: "cozinha", resposta: /Luz da cozinha/ },
  { descricao: "Pedir ligar luz sem dizer o ambiente", mensagem: "Liga a luz",
    intencao: "ligar_dispositivo", dispositivo: "luz", ambiente: null, resposta: /Em qual ambiente/ },
  { descricao: "Dispositivo que não existe na casa", mensagem: "Liga a tv da cozinha",
    intencao: "ligar_dispositivo", dispositivo: "tv", ambiente: "cozinha", resposta: /Não encontrei/ },
  { descricao: "Assunto fora do escopo", mensagem: "Qual a capital da França?",
    intencao: ["fora_do_escopo", "nao_entendi"], dispositivo: null, ambiente: null, resposta: /não entendi/i },
];

async function enviar(mensagem: string) {
  const resp = await fetch(`${URL_BASE}/assistente/mensagem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem }),
  });
  return resp.json() as Promise<{ resposta: string; interpretacao: any }>;
}

async function main() {
  let acertos = 0;

  for (const caso of CASOS) {
    const { resposta, interpretacao: i } = await enviar(caso.mensagem);
    const intencoesAceitas = Array.isArray(caso.intencao) ? caso.intencao : [caso.intencao];

    const ok =
      intencoesAceitas.includes(i.intencao) &&
      i.dispositivo === caso.dispositivo &&
      i.ambiente === caso.ambiente &&
      caso.resposta.test(resposta);

    if (ok) acertos++;
    console.log(`[${ok ? "OK   " : "FALHA"}] ${caso.descricao}`);
    console.log(`        mensagem:  "${caso.mensagem}"`);
    console.log(`        entendeu:  ${i.intencao} | ${i.dispositivo} | ${i.ambiente} (${i.confianca})`);
    console.log(`        resposta:  ${resposta.replace(/\n/g, " / ")}`);
  }

  console.log(`\nResultado: ${acertos}/${CASOS.length} testes passaram`);
  process.exit(acertos === CASOS.length ? 0 : 1);
}

main().catch((erro) => {
  console.error("Não consegui falar com a API. Os servidores Node e Python estão rodando?\n", erro);
  process.exit(1);
});
