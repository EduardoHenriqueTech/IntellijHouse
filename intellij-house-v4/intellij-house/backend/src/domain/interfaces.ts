/**
 * interfaces.ts
 * "Contratos" que os services conhecem. Os services dependem destas interfaces
 * e NÃO do TypeORM (princípio D do S.O.L.I.D.: inversão de dependência).
 */
import { Dispositivo } from "../entities/Dispositivo";
import { HistoricoComando } from "../entities/HistoricoComando";

export interface FiltroDispositivo { tipo?: string; ambiente?: string }

export interface IDispositivoRepository {
  listar(filtros?: FiltroDispositivo): Promise<Dispositivo[]>;
  buscarPorId(id: number): Promise<Dispositivo | null>;
  buscarPorTipoEAmbiente(tipo: string, ambiente: string): Promise<Dispositivo | null>;
  salvar(dispositivo: Partial<Dispositivo>): Promise<Dispositivo>;
  remover(dispositivo: Dispositivo): Promise<void>;
}

export interface IHistoricoRepository {
  registrar(evento: Partial<HistoricoComando>): Promise<HistoricoComando>;
  registrarVarios(eventos: Partial<HistoricoComando>[]): Promise<void>;
  ultimos(limite: number): Promise<HistoricoComando[]>;
  desde(data: Date): Promise<HistoricoComando[]>;
  apagarPorOrigem(origem: string): Promise<number>;
}
