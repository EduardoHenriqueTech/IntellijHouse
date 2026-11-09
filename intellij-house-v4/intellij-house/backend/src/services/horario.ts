/**
 * horario.ts
 * Hora e dia da semana sempre no fuso de São Paulo, não importa onde o servidor esteja
 * (na nuvem o servidor costuma ficar em UTC, o que bagunçaria a rotina aprendida).
 */
const FUSO = "America/Sao_Paulo";

function partes(data: Date) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: FUSO, hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(data).map((x) => [x.type, x.value]));
  return { hora: Number(p.hour) % 24, minuto: Number(p.minute), dia: p.weekday };
}

export function minutoDoDiaEmSaoPaulo(data: Date): number {
  const { hora, minuto } = partes(data);
  return hora * 60 + minuto;
}

export function diaDaSemanaEmSaoPaulo(data: Date): number {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(partes(data).dia);
}

export function formatarMinuto(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
