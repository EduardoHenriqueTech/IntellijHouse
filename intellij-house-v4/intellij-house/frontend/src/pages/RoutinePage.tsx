import { useEffect } from "react";
import { RoutineCard } from "../components/RoutineCard";
import { useHouse } from "../context/HouseContext";
import { plural } from "../utils/format";

export function RoutinePage() {
  const { rotinas, erroRotinas, carregandoRotinas, atualizarRotinas } = useHouse();

  // Ao abrir a página, busca os hábitos de novo (como na versão anterior)
  useEffect(() => { void atualizarRotinas(); }, [atualizarRotinas]);

  const subtitulo = rotinas
    ? `Horários habituais descobertos por Machine Learning (K-Means) a partir de ${plural(rotinas.analisados, "comando registrado", "comandos registrados")}.`
    : "Horários habituais descobertos por Machine Learning (K-Means) a partir do histórico de comandos.";

  return (
    <section className="card">
      <div className="card-head">
        <div><h3 className="card-title">O que a casa aprendeu sobre você</h3><div className="card-sub">{subtitulo}</div></div>
        <button type="button" className="text-btn" onClick={() => void atualizarRotinas()}>Atualizar →</button>
      </div>
      <div className="routine-list">
        {erroRotinas ? <div className="empty">{erroRotinas}</div>
          : carregandoRotinas && !rotinas ? <div className="empty">Carregando rotinas…</div>
          : rotinas && rotinas.rotinas.length > 0
            ? rotinas.rotinas.map((r) => <RoutineCard key={`${r.dispositivo_id}-${r.acao}-${r.horario}`} rotina={r} />)
            : <div className="empty">Ainda não há hábitos suficientes. Use a casa por alguns dias ou peça ao administrador para popular o histórico de demonstração.</div>}
      </div>
    </section>
  );
}
