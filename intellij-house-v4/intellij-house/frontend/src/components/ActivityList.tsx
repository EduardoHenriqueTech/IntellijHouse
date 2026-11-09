import type { Atividade } from "../context/HouseContext";
import { hora } from "../utils/format";

export function ActivityList({ atividades, vazio }: { atividades: Atividade[]; vazio: string }) {
  if (atividades.length === 0) return <div className="activity-list"><div className="empty">{vazio}</div></div>;
  return (
    <div className="activity-list">
      {atividades.map((a) => (
        <div className="activity" key={a.id}>
          <time>{hora(a.hora)}</time>
          <div className="activity-text">{a.texto}<span>{a.detalhe}</span></div>
        </div>
      ))}
    </div>
  );
}
