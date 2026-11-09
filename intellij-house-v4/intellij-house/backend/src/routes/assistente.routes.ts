/**
 * assistente.routes.ts
 *  POST /assistente/mensagem   body: { "mensagem": "Apague a luz da sala" }
 *  Resposta: { "resposta": "...", "interpretacao": { intencao, dispositivo, ambiente, confianca } }
 */
import { Router } from "express";
import { processarMensagem } from "../services/assistenteService";

const router = Router();

router.post("/mensagem", async (req, res) => {
  const mensagem = String(req.body?.mensagem ?? "").trim();
  if (!mensagem) {
    return res.status(400).json({ erro: "Envie o campo 'mensagem' com o texto do usuário." });
  }

  try {
    res.json(await processarMensagem(mensagem));
  } catch (erro) {
    // Normalmente acontece quando o microsserviço Python não está rodando
    console.error("Erro ao processar a mensagem:", erro);
    res.status(503).json({
      resposta: "Não consegui falar com o serviço de interpretação (Python). Ele está em execução?",
      erro: String(erro),
    });
  }
});

export default router;
