/** Tipos dos dados trocados com a API (espelham as entidades e respostas do back-end). */

export interface Dispositivo {
  id: number;
  nome: string;
  tipo: string;
  ambiente: string;
  ligado: boolean;
}

/** Corpo de POST/PUT /dispositivos (sem o id, que é gerado pelo banco). */
export type DispositivoInput = Omit<Dispositivo, "id">;

export type AcaoDispositivo = "ligar" | "desligar";

export interface Interpretacao {
  intencao?: string | null;
  dispositivo?: string | null;
  ambiente?: string | null;
  confianca?: number | string | null;
}

export interface RespostaAssistente {
  resposta?: string;
  interpretacao?: Interpretacao;
}

/** Hábito descoberto pelo K-Means (serviço Python) + sugestão calculada pelo Node. */
export interface Rotina {
  dispositivo_id: number;
  dispositivo_nome: string;
  acao: string; // "ligar" | "desligar"
  horario: string; // "23:05"
  minuto_do_dia: number;
  ocorrencias: number;
  dispersao_min: number;
  consistencia: number; // 0 a 1
  mensagem: string;
  sugerirAgora: boolean;
}

export interface RespostaRotina {
  analisados: number;
  rotinas: Rotina[];
}

export type OrigemHistorico = "painel" | "assistente" | "simulado";

export interface ItemHistorico {
  id: number;
  dispositivoId: number;
  dispositivoNome: string;
  tipo: string;
  acao: string;
  origem: string;
  criadoEm: string;
}
