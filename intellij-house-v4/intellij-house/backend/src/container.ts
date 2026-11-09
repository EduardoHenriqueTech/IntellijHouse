/**
 * container.ts
 * "Raiz de composição": o ÚNICO lugar que sabe quais implementações concretas usar.
 * Para trocar o banco (ex.: MongoDB), basta criar novos repositórios aqui; os services não mudam.
 */
import { TypeOrmDispositivoRepository } from "./repositories/TypeOrmDispositivoRepository";
import { TypeOrmHistoricoRepository } from "./repositories/TypeOrmHistoricoRepository";
import { DispositivoService } from "./services/dispositivoService";
import { RotinaService } from "./services/rotinaService";

export const dispositivoRepository = new TypeOrmDispositivoRepository();
export const historicoRepository = new TypeOrmHistoricoRepository();

export const dispositivoService = new DispositivoService(dispositivoRepository, historicoRepository);
export const rotinaService = new RotinaService(historicoRepository, dispositivoRepository);
