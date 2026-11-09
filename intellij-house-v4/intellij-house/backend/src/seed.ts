/**
 * seed.ts
 * Cadastra os dispositivos SIMULADOS da casa, apenas se a tabela estiver vazia.
 * (Não existe equipamento físico: o "estado" é só uma coluna no banco.)
 */
import { AppDataSource } from "./data-source";
import { Dispositivo } from "./entities/Dispositivo";

const DISPOSITIVOS_INICIAIS = [
  { nome: "Luz da sala", tipo: "luz", ambiente: "sala", ligado: true },
  { nome: "Luz do quarto", tipo: "luz", ambiente: "quarto", ligado: false },
  { nome: "Luz da cozinha", tipo: "luz", ambiente: "cozinha", ligado: false },
  { nome: "Luz do banheiro", tipo: "luz", ambiente: "banheiro", ligado: false },
  { nome: "Ventilador da sala", tipo: "ventilador", ambiente: "sala", ligado: false },
  { nome: "Ventilador do quarto", tipo: "ventilador", ambiente: "quarto", ligado: true },
  { nome: "TV da sala", tipo: "tv", ambiente: "sala", ligado: false },
  { nome: "Ar-condicionado do quarto", tipo: "ar_condicionado", ambiente: "quarto", ligado: false },
];

export async function cadastrarDispositivosIniciais() {
  const repositorio = AppDataSource.getRepository(Dispositivo);
  const quantidade = await repositorio.count();

  if (quantidade === 0) {
    await repositorio.save(DISPOSITIVOS_INICIAIS);
    console.log(`${DISPOSITIVOS_INICIAIS.length} dispositivos iniciais cadastrados.`);
  }
}
