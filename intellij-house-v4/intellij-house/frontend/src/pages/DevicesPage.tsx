import { useMemo, useState } from "react";
import { DeviceCard } from "../components/DeviceCard";
import { useHouse } from "../context/HouseContext";
import type { Dispositivo } from "../types";
import { collator, nomeAmbiente, nomeTipo } from "../utils/format";

type Filtro = "todos" | "ligados" | "desligados";
type Ordem = "ambiente" | "nome" | "nome_desc" | "ligado";

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ligados", rotulo: "Ligados" },
  { valor: "desligados", rotulo: "Desligados" },
];

const ORDENACOES: Record<Ordem, (a: Dispositivo, b: Dispositivo) => number> = {
  ambiente: (a, b) => collator.compare(nomeAmbiente(a.ambiente), nomeAmbiente(b.ambiente)) || collator.compare(a.nome, b.nome),
  nome: (a, b) => collator.compare(a.nome, b.nome),
  nome_desc: (a, b) => collator.compare(b.nome, a.nome),
  ligado: (a, b) => Number(b.ligado) - Number(a.ligado),
};

export function DevicesPage() {
  const { dispositivos } = useHouse();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("ambiente");

  const visiveis = useMemo(() => {
    const q = busca.toLocaleLowerCase("pt-BR");
    return dispositivos
      .filter((d) =>
        (filtro === "todos" || (filtro === "ligados" ? d.ligado : !d.ligado)) &&
        `${d.nome} ${nomeTipo(d.tipo)} ${nomeAmbiente(d.ambiente)}`.toLocaleLowerCase("pt-BR").includes(q))
      .sort(ORDENACOES[ordem]);
  }, [dispositivos, filtro, busca, ordem]);

  const ligados = dispositivos.filter((d) => d.ligado).length;
  const contagem: Record<Filtro, number> = { todos: dispositivos.length, ligados, desligados: dispositivos.length - ligados };

  return (
    <div className="card">
      <div className="card-head">
        <div><h3 className="card-title">Todos os dispositivos</h3><div className="card-sub">Ligue ou desligue equipamentos direto pelo painel.</div></div>
      </div>
      <div className="devices-toolbar">
        <div className="filters">
          {FILTROS.map((f) => (
            <button key={f.valor} type="button" className={`filter${filtro === f.valor ? " active" : ""}`} onClick={() => setFiltro(f.valor)}>
              {f.rotulo} ({contagem[f.valor]})
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <select className="select" aria-label="Ordenar dispositivos" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            <option value="ambiente">Ordenar por ambiente</option>
            <option value="nome">Nome (A–Z)</option>
            <option value="nome_desc">Nome (Z–A)</option>
            <option value="ligado">Ligados primeiro</option>
          </select>
          <input className="search" placeholder="Buscar dispositivo" aria-label="Buscar dispositivo" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </div>
      <div className="device-grid">
        {visiveis.length === 0
          ? <div className="section-empty span-all">Nenhum dispositivo encontrado.</div>
          : visiveis.map((d) => <DeviceCard key={d.id} dispositivo={d} />)}
      </div>
    </div>
  );
}
