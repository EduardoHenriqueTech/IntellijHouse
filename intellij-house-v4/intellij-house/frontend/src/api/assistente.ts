import type { RespostaAssistente } from "../types";
import { requisitar } from "./http";

export const assistenteApi = {
  enviar: (mensagem: string) => requisitar<RespostaAssistente>("POST", "/assistente/mensagem", { mensagem }),
};
