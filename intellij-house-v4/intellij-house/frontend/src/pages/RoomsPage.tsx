import { useNavigate, useParams } from "react-router-dom";
import { DeviceCard } from "../components/DeviceCard";
import { RoomCard } from "../components/RoomCard";
import { useHouse } from "../context/HouseContext";
import { nomeAmbiente, nomesDosAmbientes } from "../utils/format";

export function RoomsPage() {
  const { dispositivos } = useHouse();
  const { ambiente: selecionado } = useParams<{ ambiente: string }>();
  const navigate = useNavigate();

  const ambientes = nomesDosAmbientes(dispositivos);
  const doAmbiente = selecionado ? dispositivos.filter((d) => d.ambiente === selecionado) : [];

  return (
    <>
      <section className="card">
        <div className="card-head"><div><h3 className="card-title">Ambientes</h3><div className="card-sub">Dispositivos organizados por cômodo.</div></div></div>
        <div className="rooms">
          {ambientes.length === 0 ? <div className="empty">Nenhum ambiente cadastrado.</div>
            : ambientes.map((a) => (
              <RoomCard key={a} ambiente={a} dispositivos={dispositivos} selecionado={selecionado === a}
                onSelecionar={(r) => navigate(`/ambientes/${encodeURIComponent(r)}`)} />
            ))}
        </div>
      </section>
      <section className="card mt-16">
        <div className="card-head">
          <div>
            <h3 className="card-title">{selecionado ? `Dispositivos · ${nomeAmbiente(selecionado)}` : "Dispositivos do ambiente"}</h3>
            <div className="card-sub">Escolha um ambiente acima para filtrar os equipamentos.</div>
          </div>
        </div>
        <div className="device-grid">
          {doAmbiente.length === 0
            ? <div className="section-empty span-all">Escolha um ambiente para ver seus dispositivos.</div>
            : doAmbiente.map((d) => <DeviceCard key={d.id} dispositivo={d} />)}
        </div>
      </section>
    </>
  );
}
