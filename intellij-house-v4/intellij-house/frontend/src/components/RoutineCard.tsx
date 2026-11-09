import { useHouse } from "../context/HouseContext";
import type { Rotina } from "../types";
import { plural } from "../utils/format";

export function RoutineCard({ rotina: r }: { rotina: Rotina }) {
  const { aplicarSugestao, ocupados } = useHouse();
  const pct = Math.round(r.consistencia * 100);
  const desliga = r.acao === "desligar";

  return (
    <div className={`routine${r.sugerirAgora ? " now" : ""}`}>
      <div className="routine-main">
        <div className="routine-title">{r.dispositivo_nome} · {desliga ? "desliga" : "liga"} por volta das {r.horario}</div>
        <div className="routine-meta">{r.mensagem}</div>
        <div className="bar" role="img" aria-label={`Regularidade de ${pct}%`}><i style={{ width: `${pct}%` }} /></div>
        <div className="routine-meta">
          Regularidade {pct}% · variação média de {r.dispersao_min} min · {plural(r.ocorrencias, "ocorrência", "ocorrências")}
        </div>
      </div>
      {r.sugerirAgora ? (
        <button
          type="button"
          className="primary"
          disabled={ocupados.has(r.dispositivo_id)}
          onClick={() => void aplicarSugestao(r)}
        >
          {desliga ? "Desligar" : "Ligar"} agora
        </button>
      ) : (
        <span className="badge">Hábito aprendido</span>
      )}
    </div>
  );
}
