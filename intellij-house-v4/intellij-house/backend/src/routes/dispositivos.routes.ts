/**
 * dispositivos.routes.ts  —  CRUD completo + ligar/desligar
 *
 *  GET    /dispositivos               lista (aceita ?tipo=luz&ambiente=sala&ordenar=nome&ordem=desc)
 *  GET    /dispositivos/:id           mostra um
 *  POST   /dispositivos               cria          (admin)
 *  PUT    /dispositivos/:id           substitui     (admin)
 *  PATCH  /dispositivos/:id           altera campos (admin)
 *  DELETE /dispositivos/:id           exclui        (admin)
 *  POST   /dispositivos/:id/ligar     liga
 *  POST   /dispositivos/:id/desligar  desliga
 */
import { Router } from "express";
import { dispositivoService } from "../container";
import { ErroDeNegocio } from "../services/dispositivoService";
import { exigirAdmin } from "../middlewares/adminAuth";
import { validarDispositivo } from "../validation";

const router = Router();
const idDaRota = (valor: unknown) => Number(valor);

function idValido(id: number) { return Number.isInteger(id) && id > 0; }

/** Converte ErroDeNegocio (404/409) em resposta HTTP; outros erros seguem para o handler geral. */
function tratar(erro: unknown, res: any, next: any) {
  if (erro instanceof ErroDeNegocio) return res.status(erro.status).json({ erro: erro.message });
  next(erro);
}

router.get("/", async (req, res, next) => {
  try {
    const lista = await dispositivoService.buscar({
      tipo: req.query.tipo as string | undefined,
      ambiente: req.query.ambiente as string | undefined,
    });
    // Ordenação opcional (requisito do front: filtros e ordenação)
    const campo = req.query.ordenar as string | undefined;
    if (campo && ["nome", "tipo", "ambiente", "ligado", "id"].includes(campo)) {
      const sentido = req.query.ordem === "desc" ? -1 : 1;
      lista.sort((a: any, b: any) => (a[campo] > b[campo] ? 1 : a[campo] < b[campo] ? -1 : 0) * sentido);
    }
    res.json(lista);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  const id = idDaRota(req.params.id);
  if (!idValido(id)) return res.status(400).json({ erro: "Id inválido." });
  try { res.json(await dispositivoService.obter(id)); } catch (e) { tratar(e, res, next); }
});

router.post("/", exigirAdmin, async (req, res, next) => {
  const { dados, erro } = validarDispositivo(req.body, false);
  if (erro) return res.status(400).json({ erro });
  try { res.status(201).json(await dispositivoService.criar(dados!)); } catch (e) { tratar(e, res, next); }
});

for (const metodo of ["put", "patch"] as const) {
  router[metodo]("/:id", exigirAdmin, async (req, res, next) => {
    const id = idDaRota(req.params.id);
    if (!idValido(id)) return res.status(400).json({ erro: "Id inválido." });
    const { dados, erro } = validarDispositivo(req.body, metodo === "patch");
    if (erro) return res.status(400).json({ erro });
    try { res.json(await dispositivoService.atualizar(id, dados!)); } catch (e) { tratar(e, res, next); }
  });
}

router.delete("/:id", exigirAdmin, async (req, res, next) => {
  const id = idDaRota(req.params.id);
  if (!idValido(id)) return res.status(400).json({ erro: "Id inválido." });
  try { await dispositivoService.excluir(id); res.status(204).end(); } catch (e) { tratar(e, res, next); }
});

for (const [acao, ligar] of [["ligar", true], ["desligar", false]] as const) {
  router.post(`/:id/${acao}`, async (req, res, next) => {
    const id = idDaRota(req.params.id);
    if (!idValido(id)) return res.status(400).json({ erro: "Id inválido." });
    try {
      const d = await dispositivoService.obter(id);
      res.json(await dispositivoService.alterarEstado(d, ligar, "painel"));
    } catch (e) { tratar(e, res, next); }
  });
}

export default router;
