/**
 * index.ts
 * Ponto de entrada do Back-End: conecta no banco, cadastra os dispositivos
 * iniciais e liga o servidor Express.
 */
import "reflect-metadata";
import path from "path";
import express from "express";
import { AppDataSource } from "./data-source";
import { cadastrarDispositivosIniciais } from "./seed";
import dispositivosRoutes from "./routes/dispositivos.routes";
import assistenteRoutes from "./routes/assistente.routes";
import rotinaRoutes from "./routes/rotina.routes";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./docs/swagger";

const app = express();
app.use(express.json()); // permite ler o corpo (body) das requisições em JSON

// Entrega o front-end React já compilado (pasta "public", gerada por "npm run build" em frontend/)
app.use(express.static(path.join(__dirname, "..", "public")));

// Compatibilidade: o link antigo da área administrativa (HTML puro) agora é uma rota do React
app.get("/admin.html", (_req, res) => res.redirect(301, "/#/admin"));

app.use("/dispositivos", dispositivosRoutes);
app.use("/assistente", assistenteRoutes);
app.use("/", rotinaRoutes); // /rotina e /historico

// Documentação Swagger (OpenAPI)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: "Intellij House API" }));
app.get("/docs.json", (_req, res) => res.json(openapi));

// Verificação de saúde (usada por plataformas de hospedagem)
app.get("/saude", async (_req, res) => {
  try { await AppDataSource.query("SELECT 1"); res.json({ status: "ok" }); }
  catch { res.status(503).json({ status: "banco indisponível" }); }
});

// Se o front-end ainda não foi compilado, "/" cai aqui (o express.static acima só responde quando existe index.html)
app.get("/", (_req, res) => {
  res.status(200).type("html").send(
    "<!doctype html><meta charset=utf-8><title>Intellij House</title>" +
    "<body style=\"font:16px/1.6 system-ui;max-width:640px;margin:48px auto;padding:0 16px\">" +
    "<h1>Intellij House</h1><p>A API está no ar, mas o <b>front-end React ainda não foi compilado</b>.</p>" +
    "<pre>cd frontend\nnpm install\nnpm run build</pre>" +
    "<p>Depois recarregue esta página. Para desenvolver com recarga automática, use <code>npm run dev</code> " +
    "dentro de <code>frontend</code> e abra <a href=\"http://localhost:5173\">http://localhost:5173</a>.</p>" +
    "<p>Documentação da API: <a href=\"/docs\">/docs</a></p></body>",
  );
});

// Captura erros inesperados (ex.: banco fora do ar) e evita que o servidor "caia"
app.use((erro: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

async function iniciar() {
  await AppDataSource.initialize(); // conecta no PostgreSQL (e cria a tabela, se preciso)
  console.log("Conectado ao PostgreSQL.");

  await cadastrarDispositivosIniciais();

  const porta = Number(process.env.PORT) || 3000;
  app.listen(porta, () => console.log(`Servidor rodando em http://localhost:${porta}`));
}

iniciar().catch((erro) => {
  console.error("Falha ao iniciar o servidor:", erro);
  process.exit(1);
});
