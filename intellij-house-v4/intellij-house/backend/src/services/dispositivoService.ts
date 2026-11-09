/**
 * dispositivoService.ts
 * Regras de negócio dos dispositivos: CRUD, ligar/desligar e registro no histórico.
 *
 * S.O.L.I.D.:
 *  - S: só cuida de dispositivos (histórico e rotina têm seus próprios arquivos).
 *  - D: recebe os repositórios pelo construtor, como interfaces (veja container.ts).
 */
import { Dispositivo } from "../entities/Dispositivo";
import { FiltroDispositivo, IDispositivoRepository, IHistoricoRepository } from "../domain/interfaces";
import { DadosDispositivo } from "../validation";
import { minutoDoDiaEmSaoPaulo, diaDaSemanaEmSaoPaulo } from "./horario";

/** Erro com código HTTP, para as rotas responderem 404/409 corretamente. */
export class ErroDeNegocio extends Error {
  constructor(mensagem: string, public status: number) { super(mensagem); }
}

export type Origem = "painel" | "assistente" | "simulado";

export class DispositivoService {
  constructor(
    private readonly dispositivos: IDispositivoRepository,
    private readonly historico: IHistoricoRepository,
  ) {}

  buscar(filtros: FiltroDispositivo = {}) { return this.dispositivos.listar(filtros); }
  buscarPorId(id: number) { return this.dispositivos.buscarPorId(id); }

  async obter(id: number) {
    const d = await this.dispositivos.buscarPorId(id);
    if (!d) throw new ErroDeNegocio("Dispositivo não encontrado.", 404);
    return d;
  }

  async criar(dados: DadosDispositivo) {
    await this.garantirUnico(dados.tipo!, dados.ambiente!);
    return this.dispositivos.salvar({ nome: dados.nome, tipo: dados.tipo, ambiente: dados.ambiente, ligado: dados.ligado ?? false });
  }

  async atualizar(id: number, dados: DadosDispositivo) {
    const atual = await this.obter(id);
    const tipo = dados.tipo ?? atual.tipo;
    const ambiente = dados.ambiente ?? atual.ambiente;
    if (tipo !== atual.tipo || ambiente !== atual.ambiente) await this.garantirUnico(tipo, ambiente, id);
    return this.dispositivos.salvar({ ...atual, ...dados });
  }

  async excluir(id: number) {
    await this.dispositivos.remover(await this.obter(id));
  }

  /** Muda o estado, salva no banco e registra no histórico (de onde a casa aprende). */
  async alterarEstado(dispositivo: Dispositivo, ligado: boolean, origem: Origem = "painel") {
    const salvo = await this.dispositivos.salvar({ ...dispositivo, ligado });
    const agora = new Date();
    await this.historico.registrar({
      dispositivoId: salvo.id, dispositivoNome: salvo.nome, tipo: salvo.tipo,
      acao: ligado ? "ligar" : "desligar", origem,
      minutoDoDia: minutoDoDiaEmSaoPaulo(agora), diaSemana: diaDaSemanaEmSaoPaulo(agora), criadoEm: agora,
    });
    return salvo;
  }

  /** Regra: só um dispositivo de cada tipo por ambiente (senão o assistente não saberia qual controlar). */
  private async garantirUnico(tipo: string, ambiente: string, ignorarId?: number) {
    const existente = await this.dispositivos.buscarPorTipoEAmbiente(tipo, ambiente);
    if (existente && existente.id !== ignorarId) {
      throw new ErroDeNegocio(`Já existe um dispositivo do tipo "${tipo}" no ambiente "${ambiente}".`, 409);
    }
  }
}
