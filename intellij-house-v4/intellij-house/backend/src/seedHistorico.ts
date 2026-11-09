/**
 * seedHistorico.ts   (npm run popular-historico)
 * Gera 30 dias de histórico SIMULADO (origem = "simulado") para demonstrar a rotina aprendida.
 * Os horários têm pequenas variações aleatórias, como numa rotina humana real.
 * Para apagar depois: Área administrativa > "Apagar histórico simulado".
 */
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Dispositivo } from "./entities/Dispositivo";
import { HistoricoComando } from "./entities/HistoricoComando";

// [nome do dispositivo, ação, horário médio (min do dia), variação em minutos, dias da semana (vazio = todos)]
const HABITOS: [string, string, number, number, number[]][] = [
  ["Luz da sala", "desligar", 23 * 60, 20, []],
  ["Luz do quarto", "ligar", 21 * 60 + 30, 15, []],
  ["Ventilador do quarto", "ligar", 22 * 60, 15, []],
  ["Luz da cozinha", "ligar", 7 * 60, 15, [1, 2, 3, 4, 5]],
  ["TV da sala", "ligar", 20 * 60 + 15, 20, [0, 5, 6]],
];

async function main() {
  await AppDataSource.initialize();
  const dispositivos = await AppDataSource.getRepository(Dispositivo).find();
  const eventos: Partial<HistoricoComando>[] = [];
  const hoje = new Date();

  for (let dia = 30; dia >= 1; dia--) {
    const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - dia);
    for (const [nome, acao, media, variacao, dias] of HABITOS) {
      const d = dispositivos.find((x) => x.nome === nome);
      if (!d || (dias.length && !dias.includes(base.getDay()))) continue;
      const minuto = Math.max(0, Math.min(1439, Math.round(media + (Math.random() * 2 - 1) * variacao)));
      const quando = new Date(base.getFullYear(), base.getMonth(), base.getDate(), Math.floor(minuto / 60), minuto % 60);
      eventos.push({
        dispositivoId: d.id, dispositivoNome: d.nome, tipo: d.tipo, acao, origem: "simulado",
        minutoDoDia: minuto, diaSemana: base.getDay(), criadoEm: quando,
      });
    }
  }
  await AppDataSource.getRepository(HistoricoComando).save(eventos, { chunk: 200 });
  console.log(`${eventos.length} eventos simulados criados.`);
  await AppDataSource.destroy();
}

main().catch((e) => { console.error(e); process.exit(1); });
