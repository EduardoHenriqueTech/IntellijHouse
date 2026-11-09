/**
 * rotinaService.ts
 * "A casa que aprende": pega o histórico de comandos, pede ao Python (Machine Learning)
 * para descobrir os horários habituais e compara com a hora e o estado ATUAL da casa.
 */
import { IDispositivoRepository, IHistoricoRepository } from "../domain/interfaces";
import { aprenderRotina, RotinaAprendida } from "./nluService";
import { formatarMinuto, minutoDoDiaEmSaoPaulo } from "./horario";

const DIAS_DE_HISTORICO = 60;
const JANELA_MINUTOS = 30; // "perto do horário habitual" = até 30 min de diferença

export interface RotinaComSugestao extends RotinaAprendida {
  mensagem: string;
  sugerirAgora: boolean;
}

export class RotinaService {
  constructor(
    private readonly historico: IHistoricoRepository,
    private readonly dispositivos: IDispositivoRepository,
  ) {}

  async obterRotinas(agora = new Date()): Promise<{ analisados: number; rotinas: RotinaComSugestao[] }> {
    const desde = new Date(agora.getTime() - DIAS_DE_HISTORICO * 24 * 3600 * 1000);
    const eventos = await this.historico.desde(desde);
    if (eventos.length === 0) return { analisados: 0, rotinas: [] };

    const aprendidas = await aprenderRotina(eventos.map((e) => ({
      dispositivo_id: e.dispositivoId, dispositivo_nome: e.dispositivoNome, acao: e.acao, minuto_do_dia: e.minutoDoDia,
    })));

    const minutoAtual = minutoDoDiaEmSaoPaulo(agora);
    const rotinas: RotinaComSugestao[] = [];
    for (const r of aprendidas) {
      const d = await this.dispositivos.buscarPorId(r.dispositivo_id);
      const diferenca = Math.abs(((minutoAtual - r.minuto_do_dia + 720 + 1440) % 1440) - 720);
      // Só sugere se o dispositivo ainda existe e está no estado OPOSTO ao da rotina
      const precisaAgir = !!d && (r.acao === "desligar" ? d.ligado : !d.ligado);
      const sugerirAgora = precisaAgir && diferenca <= JANELA_MINUTOS;
      rotinas.push({
        ...r,
        sugerirAgora,
        mensagem: sugerirAgora
          ? `Está perto do seu horário habitual (${formatarMinuto(r.minuto_do_dia)}): você costuma ${r.acao} ${r.dispositivo_nome}. Quer fazer isso agora?`
          : `Você costuma ${r.acao} ${r.dispositivo_nome} por volta das ${r.horario} (${r.ocorrencias} vezes).`,
      });
    }
    return { analisados: eventos.length, rotinas };
  }
}
