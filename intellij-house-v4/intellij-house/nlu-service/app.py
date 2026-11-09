"""
app.py
Microsserviço de NLU (API REST feita com Flask).

Rotas:
  GET  /saude        -> confere se o serviço está no ar
  POST /interpretar  -> recebe {"mensagem": "..."} e devolve intenção + entidades
  POST /rotina       -> recebe {"eventos": [...]} e devolve os hábitos aprendidos (K-Means)

Para iniciar:
    python app.py
"""
from flask import Flask, request, jsonify
import os
from interpretador import interpretar_mensagem
from rotina import aprender_rotina

app = Flask(__name__)


@app.get("/saude")
def saude():
    return jsonify({"status": "ok"})


@app.post("/interpretar")
def interpretar():
    dados = request.get_json(silent=True) or {}
    mensagem = str(dados.get("mensagem", "")).strip()

    if not mensagem:
        return jsonify({"erro": "Envie o campo 'mensagem' com o texto do usuário."}), 400

    return jsonify(interpretar_mensagem(mensagem))


@app.post("/rotina")
def rotina():
    dados = request.get_json(silent=True) or {}
    eventos = dados.get("eventos")
    if not isinstance(eventos, list):
        return jsonify({"erro": "Envie o campo 'eventos' com a lista de comandos."}), 400
    try:
        return jsonify({"rotinas": aprender_rotina(eventos)})
    except (KeyError, TypeError, ValueError):
        return jsonify({"erro": "Formato de evento inválido."}), 400


if __name__ == "__main__":
    # Porta 5001 (a 5000 costuma estar ocupada no macOS).
    # Na nuvem/Docker use HOST=0.0.0.0 (ou rode com gunicorn, como no Dockerfile).
    app.run(host=os.environ.get("HOST", "127.0.0.1"), port=int(os.environ.get("PORT", 5001)), debug=False)
