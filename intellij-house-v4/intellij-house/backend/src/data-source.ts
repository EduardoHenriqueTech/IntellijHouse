/**
 * data-source.ts
 * Configura a CONEXÃO do TypeORM com o PostgreSQL.
 * Os dados (usuário, senha, etc.) vêm do arquivo .env (carregado pelo dotenv).
 */
import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Dispositivo } from "./entities/Dispositivo";
import { HistoricoComando } from "./entities/HistoricoComando";

dotenv.config();

// Na nuvem (Render, Railway...) o banco costuma vir em uma única variável DATABASE_URL.
// Localmente usamos DB_HOST, DB_USER etc. Se o provedor exigir SSL, defina DB_SSL=true.
const conexao = process.env.DATABASE_URL
  ? { url: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "intellij_house",
    };

export const AppDataSource = new DataSource({
  type: "postgres",
  ...conexao,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  entities: [Dispositivo, HistoricoComando],
  // synchronize: true cria/atualiza as tabelas automaticamente a partir das entidades.
  // Ótimo para projeto acadêmico. Em sistemas reais usam-se "migrations".
  synchronize: true,
  logging: false,
});
