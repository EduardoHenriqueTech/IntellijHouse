import type { AcaoDispositivo, Dispositivo, DispositivoInput } from "../types";
import { requisitar } from "./http";

export const dispositivosApi = {
  listar: async (): Promise<Dispositivo[]> => {
    const dados = await requisitar<unknown>("GET", "/dispositivos");
    if (!Array.isArray(dados)) throw new Error("Resposta inesperada da API");
    return dados as Dispositivo[];
  },
  alterarEstado: (id: number, acao: AcaoDispositivo) =>
    requisitar<Dispositivo>("POST", `/dispositivos/${id}/${acao}`),

  // Rotas administrativas (exigem x-admin-token quando ADMIN_TOKEN está definido)
  criar: (dados: DispositivoInput) => requisitar<Dispositivo>("POST", "/dispositivos", dados, { admin: true }),
  atualizar: (id: number, dados: DispositivoInput) =>
    requisitar<Dispositivo>("PUT", `/dispositivos/${id}`, dados, { admin: true }),
  excluir: (id: number) => requisitar<null>("DELETE", `/dispositivos/${id}`, undefined, { admin: true }),
};
