/**
 * adminAuth.ts
 * Protege as rotas administrativas (criar/editar/excluir). Funciona assim:
 *  - Se a variável ADMIN_TOKEN estiver definida no .env, exige o cabeçalho "x-admin-token" igual a ela.
 *  - Se NÃO estiver definida (ambiente local de desenvolvimento), deixa passar.
 * Em produção (internet) SEMPRE defina ADMIN_TOKEN.
 */
import { NextFunction, Request, Response } from "express";

export function exigirAdmin(req: Request, res: Response, next: NextFunction) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return next();
  if (req.header("x-admin-token") === token) return next();
  res.status(401).json({ erro: "Acesso restrito à área administrativa. Informe o token de administrador." });
}
