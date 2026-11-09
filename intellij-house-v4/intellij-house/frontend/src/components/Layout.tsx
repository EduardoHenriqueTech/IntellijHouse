import { useMemo } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useHouse } from "../context/HouseContext";
import { PAGINAS } from "../routes";
import {
  IconActivity, IconAdmin, IconAssistant, IconDashboard, IconDevices, IconRefresh, IconRooms, IconRoutine,
} from "./icons";

const ICONES: Record<string, () => JSX.Element> = {
  "": IconDashboard, dispositivos: IconDevices, assistente: IconAssistant,
  ambientes: IconRooms, atividade: IconActivity, rotinas: IconRoutine,
};

const dataDeHoje = () =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date());

export function Layout() {
  const { conexao, atualizarDispositivos } = useHouse();
  const { pathname } = useLocation();
  const data = useMemo(dataDeHoje, []);

  const chave = pathname.split("/")[1] ?? "";
  const pagina = PAGINAS.find((p) => p.chave === chave) ?? PAGINAS[0];

  const status = {
    verificando: { classe: "", rotulo: "Verificando conexão", detalhe: "Conferindo a comunicação com o backend." },
    ok: { classe: "ok", rotulo: "Backend conectado", detalhe: "API respondendo, dados carregados do banco." },
    erro: { classe: "err", rotulo: "Backend indisponível", detalhe: "Não foi possível carregar /dispositivos." },
  }[conexao];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-name">Intellij House</div>
          <div className="brand-sub">casa inteligente</div>
        </div>
        <div className="nav-wrap">
          <nav className="nav" aria-label="Menu principal">
            {PAGINAS.map((p) => {
              const Icone = ICONES[p.chave];
              return (
                <NavLink key={p.caminho} to={p.caminho} end={p.caminho === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icone />{p.rotulo}
                </NavLink>
              );
            })}
            <Link to="/admin"><IconAdmin />Área administrativa</Link>
          </nav>
        </div>
        <div className="sidebar-bottom connection">
          <div className="connection-head">
            <span className={`dot ${status.classe}`} />
            <span>{status.rotulo}</span>
          </div>
          <p>{status.detalhe}</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="date-label">{data}</div>
            <h1 className="page-title">{pagina.titulo}</h1>
            <p className="page-sub">{pagina.subtitulo}</p>
          </div>
          <div className="top-actions">
            <button type="button" className="icon-btn" title="Atualizar dispositivos" aria-label="Atualizar dispositivos" onClick={() => void atualizarDispositivos()}>
              <IconRefresh />
            </button>
            <div className="profile">
              <div className="avatar">IH</div>
              <div><b>Minha casa</b><small>Morador</small></div>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
