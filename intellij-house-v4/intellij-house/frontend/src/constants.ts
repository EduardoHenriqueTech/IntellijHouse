/** Tipos e ambientes que o assistente (NLU) reconhece — os mesmos do back-end (validation.ts). */
export const TIPOS = [
  { valor: "luz", rotulo: "Luz" },
  { valor: "ventilador", rotulo: "Ventilador" },
  { valor: "ar_condicionado", rotulo: "Ar-condicionado" },
  { valor: "tv", rotulo: "TV" },
] as const;

export const AMBIENTES = [
  { valor: "sala", rotulo: "Sala" },
  { valor: "quarto", rotulo: "Quarto" },
  { valor: "cozinha", rotulo: "Cozinha" },
  { valor: "banheiro", rotulo: "Banheiro" },
  { valor: "escritorio", rotulo: "Escritório" },
] as const;
