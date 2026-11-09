/**
 * nluService.ts
 * Faz a COMUNICAÇÃO entre o Node.js e o microsserviço Python (API REST).
 *
 * O Node envia a frase do usuário por HTTP (POST /interpretar) e recebe um JSON como:
 *   { "intencao": "desligar_dispositivo", "dispositivo": "luz", "ambiente": "sala", "confianca": 0.93 }
 *
 * "fetch" já vem pronto no Node 18+, então não precisamos instalar nenhuma biblioteca.
 */

export interface Interpretacao {
  mensagem: string;
  intencao: string;
  confianca: number;
  dispositivo: string | null;
  ambiente: string | null;
}

export async function interpretarMensagem(mensagem: string): Promise<Interpretacao> {
  const urlBase = process.env.NLU_URL || "http://localhost:5001";

  const resposta = await fetch(`${urlBase}/interpretar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem }),
  });

  if (!resposta.ok) {
    throw new Error(`O serviço de NLU respondeu com erro ${resposta.status}`);
  }

  return (await resposta.json()) as Interpretacao;
}

// ---------- Aprendizado de rotina (Machine Learning no Python) ----------

export interface EventoParaAprender { dispositivo_id: number; dispositivo_nome: string; acao: string; minuto_do_dia: number }

export interface RotinaAprendida {
  dispositivo_id: number;
  dispositivo_nome: string;
  acao: string;          // "ligar" | "desligar"
  horario: string;       // "23:05"
  minuto_do_dia: number;
  ocorrencias: number;   // quantas vezes o hábito apareceu
  dispersao_min: number; // quanto o horário varia, em minutos
  consistencia: number;  // 0 a 1 (quanto maior, mais regular)
}

/** Envia o histórico ao Python (POST /rotina), que agrupa os horários com K-Means. */
export async function aprenderRotina(eventos: EventoParaAprender[]): Promise<RotinaAprendida[]> {
  const urlBase = process.env.NLU_URL || "http://localhost:5001";
  const resposta = await fetch(`${urlBase}/rotina`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventos }),
  });
  if (!resposta.ok) throw new Error(`O serviço de ML respondeu com erro ${resposta.status}`);
  const dados = (await resposta.json()) as { rotinas: RotinaAprendida[] };
  return dados.rotinas;
}
