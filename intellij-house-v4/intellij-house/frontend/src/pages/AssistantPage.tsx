import { useEffect, useRef, useState, type FormEvent } from "react";
import { useHouse } from "../context/HouseContext";
import { estado, formatarConfianca, nomeAmbiente, nomesDosAmbientes } from "../utils/format";

const EXEMPLOS = [
  "Apague a luz da sala",
  "Ligue o ventilador do quarto",
  "A TV da sala está ligada?",
  "Quais dispositivos tem na cozinha?",
];

export function AssistantPage() {
  const { mensagens, enviando, enviarMensagem, dispositivos } = useHouse();
  const [texto, setTexto] = useState("");
  const entrada = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  useEffect(() => { entrada.current?.focus(); }, []);
  useEffect(() => {
    if (lista.current) lista.current.scrollTop = lista.current.scrollHeight;
  }, [mensagens]);

  async function enviar(mensagem: string) {
    if (!mensagem.trim()) return;
    setTexto("");
    await enviarMensagem(mensagem);
    entrada.current?.focus();
  }

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    void enviar(texto);
  }

  return (
    <div className="assistant-grid">
      <section className="card chat-card">
        <div className="chat-top">
          <h3 className="card-title">Assistente Intellij</h3>
          <div className="chat-status"><span className="dot ok" />Pronto para receber comandos</div>
        </div>
        <div className="messages" ref={lista} aria-live="polite">
          {mensagens.map((m) => {
            if (m.tipo === "nlu") {
              const i = m.interpretacao;
              return (
                <div className="interpretation" key={m.id}>
                  NLU: intenção {i.intencao ?? "—"} · dispositivo {i.dispositivo ?? "—"} · ambiente {i.ambiente ?? "—"} · confiança {formatarConfianca(i.confianca)}
                </div>
              );
            }
            return <div className={`message ${m.tipo === "usuario" ? "user" : "bot"}`} key={m.id}>{m.texto}</div>;
          })}
        </div>
        <form className={`chat-form${enviando ? " loading" : ""}`} onSubmit={aoEnviar}>
          <input
            ref={entrada}
            className="chat-input"
            placeholder="Ex.: apague a luz da sala"
            autoComplete="off"
            required
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button className="primary" type="submit" disabled={enviando}>Enviar</button>
        </form>
      </section>

      <aside className="stack">
        <section className="card">
          <div className="card-head"><div><h3 className="card-title">Experimente pedir</h3><div className="card-sub">Comandos de exemplo</div></div></div>
          <div className="suggestion-list">
            {EXEMPLOS.map((e) => (
              <button key={e} type="button" className="suggestion" onClick={() => void enviar(e)}>{e}</button>
            ))}
          </div>
        </section>
        <section className="card">
          <h3 className="card-title mb-8">Como funciona</h3>
          <p className="note">Você escreve como falaria com uma pessoa. O serviço em Python interpreta a intenção e o backend em Node.js executa a ação nos dispositivos cadastrados.</p>
        </section>
        <section className="card">
          <div className="card-head"><div><h3 className="card-title">Ambientes</h3><div className="card-sub">Dispositivos ligados por cômodo</div></div></div>
          <div className="room-list">
            {dispositivos.length === 0 ? <div className="empty">Sem dados de ambientes.</div>
              : nomesDosAmbientes(dispositivos).map((a) => {
                const doAmbiente = dispositivos.filter((d) => d.ambiente === a);
                return (
                  <div className="room-row" key={a}>
                    <span>{nomeAmbiente(a)}</span>
                    <span>{doAmbiente.length === 1 ? estado(doAmbiente[0]) : `${doAmbiente.filter((d) => d.ligado).length} de ${doAmbiente.length} ligados`}</span>
                  </div>
                );
              })}
          </div>
        </section>
      </aside>
    </div>
  );
}
