import { Link, useNavigate } from "react-router-dom";
import { ActivityList } from "../components/ActivityList";
import { DeviceCard } from "../components/DeviceCard";
import { RoomCard } from "../components/RoomCard";
import { RoutineCard } from "../components/RoutineCard";
import { useHouse } from "../context/HouseContext";
import { nomesDosAmbientes } from "../utils/format";

export function DashboardPage() {
  const { dispositivos, conexao, atividades, rotinas } = useHouse();
  const navigate = useNavigate();

  const ambientes = nomesDosAmbientes(dispositivos);
  const ligados = dispositivos.filter((d) => d.ligado).length;
  const sugestoes = rotinas?.rotinas.filter((r) => r.sugerirAgora) ?? [];
  const falhou = conexao === "erro" && dispositivos.length === 0;
  const aviso = "Não foi possível carregar os dispositivos. Confira se o servidor está no ar e use o botão de atualizar.";
  const n = (valor: number) => (conexao === "verificando" && dispositivos.length === 0 ? "—" : valor);

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Resumo da casa</h2>
          <p>Estado dos dispositivos e sugestões baseadas nos seus horários.</p>
        </div>
        <Link className="primary" to="/assistente">Falar com o assistente</Link>
      </div>

      <div className="banner">
        {sugestoes.map((r) => <RoutineCard key={`${r.dispositivo_id}-${r.acao}-${r.horario}`} rotina={r} />)}
      </div>

      <div className="stats">
        <article className="stat"><div className="stat-label">Dispositivos cadastrados</div><div className="stat-value">{n(dispositivos.length)}</div><div className="stat-note">Equipamentos registrados</div></article>
        <article className="stat"><div className="stat-label">Dispositivos ligados</div><div className="stat-value">{n(ligados)}</div><div className="stat-note">Ativos neste momento</div></article>
        <article className="stat"><div className="stat-label">Dispositivos desligados</div><div className="stat-value">{n(dispositivos.length - ligados)}</div><div className="stat-note">Disponíveis para ativação</div></article>
        <article className="stat"><div className="stat-label">Ambientes</div><div className="stat-value">{n(ambientes.length)}</div><div className="stat-note">Com dispositivos cadastrados</div></article>
      </div>

      <div className="layout-two">
        <section className="card">
          <div className="card-head">
            <div><h3 className="card-title">Ambientes da casa</h3><div className="card-sub">Selecione um ambiente para ver seus dispositivos</div></div>
            <Link className="text-btn" to="/ambientes">Ver ambientes →</Link>
          </div>
          <div className="rooms">
            {falhou ? <div className="empty">{aviso}</div>
              : ambientes.length === 0 ? <div className="empty">Nenhum ambiente cadastrado.</div>
              : ambientes.map((a) => (
                <RoomCard key={a} ambiente={a} dispositivos={dispositivos} onSelecionar={(r) => navigate(`/ambientes/${encodeURIComponent(r)}`)} />
              ))}
          </div>
        </section>
        <section className="card">
          <div className="card-head">
            <div><h3 className="card-title">Atividade recente</h3><div className="card-sub">Ações realizadas nesta sessão</div></div>
            <Link className="text-btn" to="/atividade">Ver tudo →</Link>
          </div>
          <ActivityList atividades={atividades.slice(0, 5)} vazio="As ações realizadas aparecerão aqui." />
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <div><h3 className="card-title">Dispositivos da casa</h3><div className="card-sub">Acesso rápido aos controles principais</div></div>
          <Link className="text-btn" to="/dispositivos">Gerenciar dispositivos →</Link>
        </div>
        <div className="device-grid">
          {falhou ? <div className="empty">{aviso}</div>
            : dispositivos.length === 0 ? <div className="empty">Nenhum dispositivo cadastrado.</div>
            : dispositivos.slice(0, 6).map((d) => <DeviceCard key={d.id} dispositivo={d} />)}
        </div>
      </section>
    </section>
  );
}
