/**
 * http.ts — único ponto que usa fetch. Converte respostas de erro da API em ApiError
 * (a API devolve { erro } e, no assistente, { resposta }).
 */
const CHAVE_TOKEN = "adminToken";

/** Token de administrador: fica só na aba (sessionStorage), como na versão anterior. */
export const tokenAdmin = {
  ler(): string {
    try { return sessionStorage.getItem(CHAVE_TOKEN) ?? ""; } catch { return ""; }
  },
  salvar(valor: string): void {
    try { sessionStorage.setItem(CHAVE_TOKEN, valor); } catch { /* armazenamento indisponível */ }
  },
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function mensagemDeErro(erro: unknown, padrao: string): string {
  return erro instanceof Error && erro.message ? erro.message : padrao;
}

interface Opcoes {
  /** Envia o cabeçalho x-admin-token (rotas protegidas). */
  admin?: boolean;
}

export async function requisitar<T>(metodo: string, url: string, corpo?: unknown, opcoes: Opcoes = {}): Promise<T> {
  const cabecalhos: Record<string, string> = {};
  if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
  if (opcoes.admin) {
    const token = tokenAdmin.ler();
    if (token) cabecalhos["x-admin-token"] = token;
  }

  const resposta = await fetch(url, {
    method: metodo,
    headers: cabecalhos,
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  const texto = await resposta.text();
  let dados: any = null;
  if (texto) {
    try { dados = JSON.parse(texto); } catch { dados = null; }
  }

  if (!resposta.ok) {
    throw new ApiError(dados?.resposta ?? dados?.erro ?? `Erro ${resposta.status}`, resposta.status);
  }
  return dados as T;
}
