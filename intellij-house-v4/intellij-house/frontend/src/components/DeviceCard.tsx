import { useHouse } from "../context/HouseContext";
import type { Dispositivo } from "../types";
import { nomeAmbiente, nomeTipo } from "../utils/format";
import { Switch } from "./Switch";

export function DeviceCard({ dispositivo: d }: { dispositivo: Dispositivo }) {
  const { ocupados, alternarDispositivo } = useHouse();
  const ocupado = ocupados.has(d.id);

  return (
    <article className={`device${d.ligado ? " is-on" : ""}${ocupado ? " loading" : ""}`}>
      <div className="device-top">
        <div>
          <div className="device-name">{d.nome}</div>
          <div className="device-meta">{nomeAmbiente(d.ambiente)} · {nomeTipo(d.tipo)}</div>
        </div>
        <Switch
          ligado={d.ligado}
          rotulo={`${d.ligado ? "Desligar" : "Ligar"} ${d.nome}`}
          desabilitado={ocupado}
          onAlternar={() => void alternarDispositivo(d.id)}
        />
      </div>
      <div className={`state${d.ligado ? " on" : ""}`}>{d.ligado ? "Ligado" : "Desligado"}</div>
    </article>
  );
}
