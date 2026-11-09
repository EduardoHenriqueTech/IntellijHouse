/**
 * testeCrud.ts   (npm run testar-crud)
 * Testa o CRUD de dispositivos, a proteção de admin e a rotina aprendida.
 * Deixe Node (3000) e Python (5001) rodando. Se ADMIN_TOKEN estiver no .env,
 * rode com:  ADMIN_TOKEN=seu_token npm run testar-crud
 */
const BASE = process.env.API_URL || "http://localhost:3000";
const TOKEN = process.env.ADMIN_TOKEN || "";
let falhas = 0;

async function chamar(metodo: string, caminho: string, corpo?: unknown, comToken = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (comToken && TOKEN) headers["x-admin-token"] = TOKEN;
  const r = await fetch(BASE + caminho, { method: metodo, headers, body: corpo ? JSON.stringify(corpo) : undefined });
  const texto = await r.text();
  return { status: r.status, dados: texto ? JSON.parse(texto) : null };
}
function conferir(descricao: string, ok: boolean, extra = "") {
  console.log(`${ok ? "✅" : "❌"} ${descricao}${ok ? "" : "  " + extra}`);
  if (!ok) falhas++;
}

async function main() {
  const novo = { nome: "Luz do escritório", tipo: "luz", ambiente: "escritorio" };
  let r = await chamar("POST", "/dispositivos", novo);
  conferir("POST cria dispositivo (201)", r.status === 201, JSON.stringify(r.dados));
  const id = r.dados?.id;

  r = await chamar("POST", "/dispositivos", novo);
  conferir("POST duplicado (mesmo tipo e ambiente) → 409", r.status === 409);
  r = await chamar("POST", "/dispositivos", { nome: "X", tipo: "geladeira", ambiente: "sala" });
  conferir("POST com dados inválidos → 400", r.status === 400);
  if (TOKEN) {
    r = await chamar("POST", "/dispositivos", novo, false);
    conferir("POST sem token de admin → 401", r.status === 401);
  }

  r = await chamar("GET", `/dispositivos/${id}`);
  conferir("GET por id (200)", r.status === 200 && r.dados.nome === novo.nome);
  r = await chamar("GET", "/dispositivos?ordenar=nome&ordem=desc");
  const nomes: string[] = r.dados.map((d: any) => d.nome);
  conferir("GET com ordenação decrescente por nome", [...nomes].sort().reverse().join() === nomes.join());

  r = await chamar("PUT", `/dispositivos/${id}`, { ...novo, nome: "Luz do home office" });
  conferir("PUT substitui (200)", r.status === 200 && r.dados.nome === "Luz do home office");
  r = await chamar("PATCH", `/dispositivos/${id}`, { ligado: true });
  conferir("PATCH altera um campo (200)", r.status === 200 && r.dados.ligado === true);
  r = await chamar("POST", `/dispositivos/${id}/desligar`);
  conferir("POST /desligar (200)", r.status === 200 && r.dados.ligado === false);

  r = await chamar("GET", "/historico?limite=5");
  conferir("Comando ficou registrado no histórico", r.dados[0]?.dispositivoId === id && r.dados[0]?.acao === "desligar");

  r = await chamar("DELETE", `/dispositivos/${id}`);
  conferir("DELETE exclui (204)", r.status === 204);
  r = await chamar("GET", `/dispositivos/${id}`);
  conferir("GET após excluir → 404", r.status === 404);

  r = await chamar("GET", "/rotina");
  conferir("GET /rotina responde (200)", r.status === 200 && Array.isArray(r.dados.rotinas), JSON.stringify(r.dados));

  r = await chamar("POST", "/assistente/mensagem", { mensagem: "Quais são as minhas rotinas?" });
  conferir("Assistente entende pergunta sobre rotina", r.dados?.interpretacao?.intencao === "consultar_rotina", JSON.stringify(r.dados));

  r = await (await fetch(BASE + "/docs.json")).json().then((d) => ({ status: 200, dados: d }));
  conferir("Swagger publicado em /docs.json", !!r.dados.paths["/dispositivos"]);

  console.log(falhas === 0 ? "\nTodos os testes passaram." : `\n${falhas} teste(s) falharam.`);
  process.exit(falhas === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
