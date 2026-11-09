/**
 * AdminPage — área administrativa: CRUD de dispositivos + histórico de comandos.
 * Independente do painel do morador (não usa o HouseContext nem faz polling).
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dispositivosApi } from "../../api/dispositivos";
import { mensagemDeErro, tokenAdmin } from "../../api/http";
import { historicoApi } from "../../api/rotina";
import { useToast } from "../../context/ToastContext";
import type { Dispositivo, DispositivoInput, ItemHistorico } from "../../types";
import { AMBIENTES, TIPOS } from "../../constants";
import { nomeAmbiente, nomeTipo, plural } from "../../utils/format";

const FORM_VAZIO = { nome: "", tipo: "luz", ambiente: "sala", ligado: "false" };
type Formulario = typeof FORM_VAZIO;

export function AdminPage() {
  const toast = useToast();
  const [lista, setLista] = useState<Dispositivo[]>([]);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);
  const [form, setForm] = useState<Formulario>(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [token, setToken] = useState(() => tokenAdmin.ler());

  const carregarDispositivos = useCallback(async () => {
    try { setLista(await dispositivosApi.listar()); }
    catch (e) { toast.mostrar(mensagemDeErro(e, "Erro ao carregar dispositivos."), "erro"); }
  }, [toast]);

  const carregarHistorico = useCallback(async () => {
    try { setHistorico(await historicoApi.listar(60)); }
    catch (e) { toast.mostrar(mensagemDeErro(e, "Erro ao carregar o histórico."), "erro"); }
  }, [toast]);

  useEffect(() => {
    document.title = "Área administrativa | Intellij House";
    void carregarDispositivos();
    void carregarHistorico();
    return () => { document.title = "Intellij House"; };
  }, [carregarDispositivos, carregarHistorico]);

  const alterar = <K extends keyof Formulario>(campo: K, valor: Formulario[K]) => setForm((f) => ({ ...f, [campo]: valor }));

  function limparFormulario() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  function iniciarEdicao(d: Dispositivo) {
    setEditandoId(d.id);
    setForm({ nome: d.nome, tipo: d.tipo, ambiente: d.ambiente, ligado: String(d.ligado) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar() {
    const corpo: DispositivoInput = { nome: form.nome.trim(), tipo: form.tipo, ambiente: form.ambiente, ligado: form.ligado === "true" };
    try {
      if (editandoId !== null) {
        await dispositivosApi.atualizar(editandoId, corpo);
        toast.mostrar("Dispositivo atualizado.");
      } else {
        await dispositivosApi.criar(corpo);
        toast.mostrar("Dispositivo cadastrado.");
      }
      limparFormulario();
      await carregarDispositivos();
    } catch (e) {
      toast.mostrar(mensagemDeErro(e, "Não foi possível salvar."), "erro");
    }
  }

  async function excluir(d: Dispositivo) {
    if (!window.confirm(`Excluir "${d.nome}"?`)) return;
    try {
      await dispositivosApi.excluir(d.id);
      toast.mostrar("Dispositivo excluído.");
      if (editandoId === d.id) limparFormulario();
      await carregarDispositivos();
    } catch (e) {
      toast.mostrar(mensagemDeErro(e, "Não foi possível excluir."), "erro");
    }
  }

  async function apagarSimulado() {
    if (!window.confirm('Apagar todo o histórico de demonstração (origem "simulado")?')) return;
    try {
      const { apagados } = await historicoApi.apagarPorOrigem("simulado");
      toast.mostrar(`${apagados} ${apagados === 1 ? "registro apagado" : "registros apagados"}.`);
      await carregarHistorico();
    } catch (e) {
      toast.mostrar(mensagemDeErro(e, "Não foi possível apagar o histórico."), "erro");
    }
  }

  return (
    <div className="admin">
      <header>
        <div><div className="brand-name">Intellij House</div><div className="brand-sub">casa inteligente</div></div>
        <nav>
          <Link to="/">← Painel do morador</Link>
          <a href="/docs" target="_blank" rel="noreferrer">Documentação da API (Swagger)</a>
        </nav>
      </header>

      <main>
        <div>
          <h1 className="page-title">Área administrativa</h1>
          <p className="page-sub">Cadastro de dispositivos e histórico de comandos da casa.</p>
        </div>

        <section className="card">
          <h2>Acesso de administrador</h2>
          <div className="sub">Se o servidor tiver ADMIN_TOKEN configurado, informe-o para criar, editar e excluir. Ele fica salvo só nesta aba.</div>
          <div className="row">
            <label>Token
              <input type="password" placeholder="Vazio em ambiente local" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} />
            </label>
            <button type="button" className="ghost" onClick={() => { tokenAdmin.salvar(token.trim()); toast.mostrar("Token salvo nesta aba."); }}>
              Salvar token
            </button>
          </div>
        </section>

        <section className="card">
          <h2>{editandoId !== null ? `Editando #${editandoId}` : "Novo dispositivo"}</h2>
          <div className="sub">Tipos e ambientes são os mesmos que o assistente virtual (NLU) reconhece. Só pode existir um dispositivo de cada tipo por ambiente.</div>
          <div className="row">
            <label>Nome
              <input maxLength={60} placeholder="Ex.: Luz do escritório" value={form.nome} onChange={(e) => alterar("nome", e.target.value)} />
            </label>
            <label>Tipo
              <select value={form.tipo} onChange={(e) => alterar("tipo", e.target.value)}>
                {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
              </select>
            </label>
            <label>Ambiente
              <select value={form.ambiente} onChange={(e) => alterar("ambiente", e.target.value)}>
                {AMBIENTES.map((a) => <option key={a.valor} value={a.valor}>{a.rotulo}</option>)}
              </select>
            </label>
            <label>Estado inicial
              <select value={form.ligado} onChange={(e) => alterar("ligado", e.target.value)}>
                <option value="false">Desligado</option>
                <option value="true">Ligado</option>
              </select>
            </label>
            <button type="button" onClick={() => void salvar()}>{editandoId !== null ? "Salvar alterações" : "Cadastrar"}</button>
            {editandoId !== null && <button type="button" className="ghost" onClick={limparFormulario}>Cancelar edição</button>}
          </div>
        </section>

        <section className="card">
          <h2>Dispositivos cadastrados</h2>
          <div className="sub">{plural(lista.length, "dispositivo", "dispositivos")}</div>
          <div className="scroll">
            <table>
              <thead><tr><th>ID</th><th>Nome</th><th>Tipo</th><th>Ambiente</th><th>Estado</th><th>Ações</th></tr></thead>
              <tbody>
                {lista.length === 0 ? <tr><td colSpan={6}>Nenhum dispositivo cadastrado.</td></tr> : lista.map((d) => (
                  <tr key={d.id}>
                    <td className="num">{d.id}</td>
                    <td>{d.nome}</td>
                    <td>{nomeTipo(d.tipo)}</td>
                    <td>{nomeAmbiente(d.ambiente)}</td>
                    <td className={d.ligado ? "on" : "off"}>{d.ligado ? "Ligado" : "Desligado"}</td>
                    <td>
                      <div className="actions">
                        <button type="button" className="ghost small" onClick={() => iniciarEdicao(d)}>Editar</button>
                        <button type="button" className="danger small" onClick={() => void excluir(d)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2>Histórico de comandos</h2>
          <div className="sub">Cada liga/desliga é registrado. O Machine Learning usa esses horários para descobrir a rotina do morador.</div>
          <div className="row mb-12">
            <button type="button" className="ghost" onClick={() => void carregarHistorico()}>Atualizar</button>
            <button type="button" className="danger" onClick={() => void apagarSimulado()}>Apagar histórico simulado</button>
          </div>
          <div className="scroll">
            <table>
              <thead><tr><th>Quando</th><th>Dispositivo</th><th>Ação</th><th>Origem</th></tr></thead>
              <tbody>
                {historico.length === 0 ? <tr><td colSpan={4}>Sem registros.</td></tr> : historico.map((h) => (
                  <tr key={h.id}>
                    <td className="num">{new Date(h.criadoEm).toLocaleString("pt-BR")}</td>
                    <td>{h.dispositivoNome}</td>
                    <td>{h.acao}</td>
                    <td>{h.origem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
