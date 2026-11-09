/** Implementação do repositório de histórico usando TypeORM + PostgreSQL. */
import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../data-source";
import { HistoricoComando } from "../entities/HistoricoComando";
import { IHistoricoRepository } from "../domain/interfaces";

export class TypeOrmHistoricoRepository implements IHistoricoRepository {
  private get repo() { return AppDataSource.getRepository(HistoricoComando); }

  registrar(evento: Partial<HistoricoComando>) { return this.repo.save(evento as HistoricoComando); }
  async registrarVarios(eventos: Partial<HistoricoComando>[]) { await this.repo.save(eventos as HistoricoComando[], { chunk: 200 }); }
  ultimos(limite: number) { return this.repo.find({ order: { criadoEm: "DESC", id: "DESC" }, take: limite }); }
  desde(data: Date) { return this.repo.find({ where: { criadoEm: MoreThanOrEqual(data) }, order: { criadoEm: "ASC" } }); }
  async apagarPorOrigem(origem: string) {
    const r = await this.repo.delete({ origem });
    return r.affected ?? 0;
  }
}
