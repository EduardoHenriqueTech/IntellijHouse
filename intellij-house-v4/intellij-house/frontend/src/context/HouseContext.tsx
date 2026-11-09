/**
 * HouseContext — estado compartilhado do painel do morador:
 * dispositivos, atividade da sessão, conversa com o assistente e rotinas aprendidas.
 * As páginas só leem o estado e chamam as ações; quem fala com a API é este arquivo.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { assistenteApi } from "../api/assistente";
import { dispositivosApi } from "../api/dispositivos";
import { mensagemDeErro } from "../api/http";
import { rotinaApi } from "../api/rotina";
import type { Dispositivo, Interpretacao, RespostaRotina, Rotina } from "../types";
import { estado, nomeAmbiente } from "../utils/format";
import { useToast } from "./ToastContext";

const INTERVALO_DISPOSITIVOS_MS = 30_000;
const INTERVALO_ROTINA_MS = 120_000;
const MAX_ATIVIDADES = 30;

export type StatusConexao = "verificando" | "ok" | "erro";

export interface Atividade {
  id: number;
  texto: string;
  detalhe: string;
  hora: Date;
}

export type MensagemChat =
  | { id: number; tipo: "usuario" | "bot"; texto: string }
  | { id: number; tipo: "nlu"; interpretacao: Interpretacao };

interface HouseApi {
  dispositivos: Dispositivo[];
  conexao: StatusConexao;
  ocupados: ReadonlySet<number>;
  atualizarDispositivos: () => Promise<void>;
  alternarDispositivo: (id: number) => Promise<void>;

  atividades: Atividade[];
  limparAtividades: () => void;

  mensagens: MensagemChat[];
  enviando: boolean;
  enviarMensagem: (texto: string) => Promise<void>;

  rotinas: RespostaRotina | null;
  erroRotinas: string | null;
  carregandoRotinas: boolean;
  atualizarRotinas: () => Promise<void>;
  aplicarSugestao: (rotina: Rotina) => Promise<void>;
}

const HouseContext = createContext<HouseApi | null>(null);

const SAUDACAO: MensagemChat = {
  id: 0,
  tipo: "bot",
  texto: "Olá! Posso ligar e desligar os dispositivos da casa e dizer em que estado eles estão. O que você precisa?",
};

export function HouseProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [conexao, setConexao] = useState<StatusConexao>("verificando");
  const [ocupados, setOcupados] = useState<ReadonlySet<number>>(new Set());
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [mensagens, setMensagens] = useState<MensagemChat[]>([SAUDACAO]);
  const [enviando, setEnviando] = useState(false);
  const [rotinas, setRotinas] = useState<RespostaRotina | null>(null);
  const [erroRotinas, setErroRotinas] = useState<string | null>(null);
  const [carregandoRotinas, setCarregandoRotinas] = useState(true);

  // Refs: leem o valor mais recente sem recriar as funções (evita "closures velhas" nos intervalos)
  const dispositivosRef = useRef<Dispositivo[]>([]);
  dispositivosRef.current = dispositivos;
  const ocupadosRef = useRef(new Set<number>());
  const enviandoRef = useRef(false);
  const proximoId = useRef(1);

  const marcarOcupado = useCallback((id: number, ocupado: boolean) => {
    if (ocupado) ocupadosRef.current.add(id); else ocupadosRef.current.delete(id);
    setOcupados(new Set(ocupadosRef.current));
  }, []);

  const registrarAtividade = useCallback((texto: string, detalhe = "") => {
    setAtividades((anteriores) =>
      [{ id: proximoId.current++, texto, detalhe, hora: new Date() }, ...anteriores].slice(0, MAX_ATIVIDADES));
  }, []);

  const limparAtividades = useCallback(() => setAtividades([]), []);

  // ---------- Dispositivos ----------
  const atualizarDispositivos = useCallback(async () => {
    try {
      setDispositivos(await dispositivosApi.listar());
      setConexao("ok");
    } catch (erro) {
      setConexao("erro");
      toast.mostrar("Não foi possível carregar os dispositivos. Verifique o backend.", "erro");
      console.error(erro);
    }
  }, [toast]);

  const alternarDispositivo = useCallback(async (id: number) => {
    const dispositivo = dispositivosRef.current.find((d) => d.id === id);
    if (!dispositivo || ocupadosRef.current.has(id)) return;
    marcarOcupado(id, true);
    try {
      const resultado = await dispositivosApi.alterarEstado(id, dispositivo.ligado ? "desligar" : "ligar");
      setDispositivos((lista) => lista.map((d) => (d.id === resultado.id ? resultado : d)));
      registrarAtividade(`${resultado.nome} foi ${estado(resultado)}`, `Controle direto · ${nomeAmbiente(resultado.ambiente)}`);
      toast.mostrar(`${resultado.nome}: ${estado(resultado)}`);
    } catch (erro) {
      toast.mostrar(mensagemDeErro(erro, "Erro ao controlar dispositivo."), "erro");
    } finally {
      marcarOcupado(id, false);
    }
  }, [marcarOcupado, registrarAtividade, toast]);

  // ---------- Rotinas aprendidas (ML) ----------
  const atualizarRotinas = useCallback(async () => {
    try {
      setRotinas(await rotinaApi.obter());
      setErroRotinas(null);
    } catch (erro) {
      setErroRotinas(mensagemDeErro(erro, "Falha ao carregar rotinas"));
    } finally {
      setCarregandoRotinas(false);
    }
  }, []);

  const aplicarSugestao = useCallback(async (rotina: Rotina) => {
    const id = rotina.dispositivo_id;
    if (ocupadosRef.current.has(id)) return;
    marcarOcupado(id, true);
    try {
      const acao = rotina.acao === "desligar" ? "desligar" : "ligar";
      const resultado = await dispositivosApi.alterarEstado(id, acao);
      registrarAtividade(`${resultado.nome} foi ${estado(resultado)}`, "Sugestão da rotina aprendida");
      toast.mostrar(`${resultado.nome}: ${estado(resultado)}`);
      await Promise.all([atualizarDispositivos(), atualizarRotinas()]);
    } catch (erro) {
      toast.mostrar(mensagemDeErro(erro, "Não foi possível aplicar a sugestão."), "erro");
    } finally {
      marcarOcupado(id, false);
    }
  }, [atualizarDispositivos, atualizarRotinas, marcarOcupado, registrarAtividade, toast]);

  // ---------- Assistente ----------
  const enviarMensagem = useCallback(async (texto: string) => {
    const limpo = texto.trim();
    if (!limpo || enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    const nova = (m: Omit<Extract<MensagemChat, { tipo: "usuario" | "bot" }>, "id">): MensagemChat => ({ ...m, id: proximoId.current++ });
    setMensagens((ms) => [...ms, nova({ tipo: "usuario", texto: limpo })]);
    try {
      const dados = await assistenteApi.enviar(limpo);
      setMensagens((ms) => {
        const novas: MensagemChat[] = [...ms, nova({ tipo: "bot", texto: dados.resposta || "Comando processado." })];
        if (dados.interpretacao) novas.push({ id: proximoId.current++, tipo: "nlu", interpretacao: dados.interpretacao });
        return novas;
      });
      registrarAtividade(`Comando enviado: “${limpo}”`, "Assistente virtual");
      await atualizarDispositivos();
    } catch (erro) {
      setMensagens((ms) => [...ms, nova({ tipo: "bot", texto: mensagemDeErro(erro, "Não consegui falar com o servidor.") })]);
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }, [atualizarDispositivos, registrarAtividade]);

  // Carga inicial + atualização periódica (igual à versão anterior: 30 s e 2 min)
  useEffect(() => {
    void atualizarDispositivos();
    void atualizarRotinas();
    const a = window.setInterval(() => void atualizarDispositivos(), INTERVALO_DISPOSITIVOS_MS);
    const b = window.setInterval(() => void atualizarRotinas(), INTERVALO_ROTINA_MS);
    return () => { window.clearInterval(a); window.clearInterval(b); };
  }, [atualizarDispositivos, atualizarRotinas]);

  const valor = useMemo<HouseApi>(() => ({
    dispositivos, conexao, ocupados, atualizarDispositivos, alternarDispositivo,
    atividades, limparAtividades,
    mensagens, enviando, enviarMensagem,
    rotinas, erroRotinas, carregandoRotinas, atualizarRotinas, aplicarSugestao,
  }), [dispositivos, conexao, ocupados, atualizarDispositivos, alternarDispositivo, atividades, limparAtividades,
       mensagens, enviando, enviarMensagem, rotinas, erroRotinas, carregandoRotinas, atualizarRotinas, aplicarSugestao]);

  return <HouseContext.Provider value={valor}>{children}</HouseContext.Provider>;
}

export function useHouse(): HouseApi {
  const ctx = useContext(HouseContext);
  if (!ctx) throw new Error("useHouse precisa estar dentro de <HouseProvider>");
  return ctx;
}
