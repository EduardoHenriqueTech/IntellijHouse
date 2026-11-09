import type { ItemHistorico, OrigemHistorico, RespostaRotina } from "../types";
import { requisitar } from "./http";

export const rotinaApi = {
  obter: () => requisitar<RespostaRotina>("GET", "/rotina"),
};

export const historicoApi = {
  listar: (limite = 60) => requisitar<ItemHistorico[]>("GET", `/historico?limite=${limite}`),
  apagarPorOrigem: (origem: OrigemHistorico) =>
    requisitar<{ apagados: number }>("DELETE", `/historico?origem=${origem}`, undefined, { admin: true }),
};
