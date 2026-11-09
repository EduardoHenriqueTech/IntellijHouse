/**
 * validation.ts
 * Regras de validação dos dados de um dispositivo (usadas por POST, PUT e PATCH).
 * Os tipos e ambientes permitidos são os mesmos que o NLU em Python reconhece.
 */
export const TIPOS = ["luz", "ventilador", "ar_condicionado", "tv"] as const;
export const AMBIENTES = ["sala", "quarto", "cozinha", "banheiro", "escritorio"] as const;

export interface DadosDispositivo { nome?: string; tipo?: string; ambiente?: string; ligado?: boolean }

/** Devolve { dados } se estiver tudo certo, ou { erro } com a mensagem para o usuário. */
export function validarDispositivo(body: any, parcial: boolean): { dados?: DadosDispositivo; erro?: string } {
  if (typeof body !== "object" || body === null) return { erro: "Envie um JSON no corpo da requisição." };
  const dados: DadosDispositivo = {};

  if (body.nome !== undefined || !parcial) {
    const nome = String(body.nome ?? "").trim();
    if (nome.length < 2 || nome.length > 60) return { erro: "O campo 'nome' deve ter de 2 a 60 caracteres." };
    dados.nome = nome;
  }
  if (body.tipo !== undefined || !parcial) {
    if (!TIPOS.includes(body.tipo)) return { erro: `O campo 'tipo' deve ser um destes: ${TIPOS.join(", ")}.` };
    dados.tipo = body.tipo;
  }
  if (body.ambiente !== undefined || !parcial) {
    if (!AMBIENTES.includes(body.ambiente)) return { erro: `O campo 'ambiente' deve ser um destes: ${AMBIENTES.join(", ")}.` };
    dados.ambiente = body.ambiente;
  }
  if (body.ligado !== undefined) {
    if (typeof body.ligado !== "boolean") return { erro: "O campo 'ligado' deve ser true ou false." };
    dados.ligado = body.ligado;
  }
  if (parcial && Object.keys(dados).length === 0) return { erro: "Envie ao menos um campo para alterar." };
  return { dados };
}
