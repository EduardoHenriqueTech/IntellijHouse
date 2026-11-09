import { ActivityList } from "../components/ActivityList";
import { useHouse } from "../context/HouseContext";
import { useToast } from "../context/ToastContext";

export function ActivityPage() {
  const { atividades, limparAtividades } = useHouse();
  const toast = useToast();

  return (
    <section className="card">
      <div className="card-head">
        <div><h3 className="card-title">Atividade recente</h3><div className="card-sub">Ações feitas desde que esta página foi aberta.</div></div>
        <button type="button" className="text-btn" onClick={() => { limparAtividades(); toast.mostrar("Histórico desta sessão limpo."); }}>
          Limpar histórico
        </button>
      </div>
      <ActivityList atividades={atividades} vazio="Nenhuma ação registrada nesta sessão." />
    </section>
  );
}
