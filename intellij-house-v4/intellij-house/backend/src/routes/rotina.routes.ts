/**
 * rotina.routes.ts  —  a casa que aprende
 *
 *  GET    /rotina                 rotinas aprendidas (ML no Python) + sugestões para agora
 *  GET    /historico?limite=50    últimos comandos registrados
 *  DELETE /historico?origem=simulado   apaga histórico de demonstração (admin)
 */
import { Router } from "express";
import { historicoRepository, rotinaService } from "../container";
import { exigirAdmin } from "../middlewares/adminAuth";

const router = Router();

router.get("/rotina", async (_req, res) => {
  try {
    res.json(await rotinaService.obterRotinas());
  } catch (erro) {
    console.error("Erro ao aprender rotina:", erro);
    res.status(503).json({ erro: "Não consegui falar com o serviço de Machine Learning (Python)." });
  }
});

router.get("/historico", async (req, res, next) => {
  try {
    const limite = Math.min(Math.max(Number(req.query.limite) || 50, 1), 500);
    res.json(await historicoRepository.ultimos(limite));
  } catch (e) { next(e); }
});

router.delete("/historico", exigirAdmin, async (req, res, next) => {
  const origem = String(req.query.origem ?? "");
  if (!["simulado", "painel", "assistente"].includes(origem)) {
    return res.status(400).json({ erro: "Informe ?origem=simulado, painel ou assistente." });
  }
  try { res.json({ apagados: await historicoRepository.apagarPorOrigem(origem) }); } catch (e) { next(e); }
});

export default router;
