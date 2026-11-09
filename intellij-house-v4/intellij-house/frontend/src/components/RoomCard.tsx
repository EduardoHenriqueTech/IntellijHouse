import type { Dispositivo } from "../types";
import { nomeAmbiente, plural } from "../utils/format";

interface Props {
  ambiente: string;
  dispositivos: Dispositivo[];
  selecionado?: boolean;
  onSelecionar: (ambiente: string) => void;
}

export function RoomCard({ ambiente, dispositivos, selecionado = false, onSelecionar }: Props) {
  const doAmbiente = dispositivos.filter((d) => d.ambiente === ambiente);
  const ligados = doAmbiente.filter((d) => d.ligado).length;

  return (
    <button type="button" className={`room${selecionado ? " selected" : ""}`} onClick={() => onSelecionar(ambiente)}>
      <div className="room-name">{nomeAmbiente(ambiente)}</div>
      <div className="room-count">{plural(doAmbiente.length, "dispositivo", "dispositivos")}</div>
      <div className={`room-on${ligados ? " has" : ""}`}>{plural(ligados, "ligado", "ligados")}</div>
    </button>
  );
}
