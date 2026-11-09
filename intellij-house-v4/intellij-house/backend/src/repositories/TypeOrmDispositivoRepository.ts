/** Implementação do repositório de dispositivos usando TypeORM + PostgreSQL. */
import { AppDataSource } from "../data-source";
import { Dispositivo } from "../entities/Dispositivo";
import { FiltroDispositivo, IDispositivoRepository } from "../domain/interfaces";

export class TypeOrmDispositivoRepository implements IDispositivoRepository {
  private get repo() { return AppDataSource.getRepository(Dispositivo); }

  listar(filtros: FiltroDispositivo = {}) {
    const where: FiltroDispositivo = {};
    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.ambiente) where.ambiente = filtros.ambiente;
    return this.repo.find({ where, order: { ambiente: "ASC", id: "ASC" } });
  }
  buscarPorId(id: number) { return this.repo.findOneBy({ id }); }
  buscarPorTipoEAmbiente(tipo: string, ambiente: string) { return this.repo.findOneBy({ tipo, ambiente }); }
  salvar(dispositivo: Partial<Dispositivo>) { return this.repo.save(dispositivo as Dispositivo); }
  async remover(dispositivo: Dispositivo) { await this.repo.remove(dispositivo); }
}
