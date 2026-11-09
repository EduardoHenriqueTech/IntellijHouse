import type { Dispositivo } from "../types";

const tipoNome: Record<string, string> = { luz: "Luz", ventilador: "Ventilador", tv: "TV", ar_condicionado: "Ar-condicionado" };
const ambienteNome: Record<string, string> = { escritorio: "Escritório" };

export const collator = new Intl.Collator("pt-BR");

export const titleCase = (valor: string | null | undefined) =>
  String(valor || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const nomeAmbiente = (valor: string) => ambienteNome[valor] || titleCase(valor);
export const nomeTipo = (valor: string) => tipoNome[valor] || titleCase(valor);

const feminino = (d: Dispositivo) => ["luz", "tv"].includes(d.tipo);

/** "ligado" / "ligada" / "desligado" / "desligada" concordando com o tipo do dispositivo. */
export const estado = (d: Dispositivo) =>
  d.ligado ? (feminino(d) ? "ligada" : "ligado") : feminino(d) ? "desligada" : "desligado";

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export const hora = (data: Date) => data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Ambientes distintos, em ordem alfabética. */
export function nomesDosAmbientes(dispositivos: Dispositivo[]): string[] {
  return [...new Set(dispositivos.map((d) => d.ambiente).filter(Boolean))].sort((a, b) => collator.compare(a, b));
}

export function formatarConfianca(valor: number | string | null | undefined): string {
  if (typeof valor === "number") return valor.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  return valor ?? "—";
}
