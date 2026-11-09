"""
extrator_entidades.py
Entity Extraction (extração de entidades): encontra DISPOSITIVO e AMBIENTE na mensagem.

Aqui NÃO usamos Machine Learning. Usamos dicionários de sinônimos, que é uma técnica
simples e muito comum. Exemplo: "lâmpada", "luzes" e "luz" significam o dispositivo "luz".

Para adicionar um dispositivo ou ambiente novo, basta incluir uma linha nos dicionários.
"""
import re
from normalizacao import normalizar_texto

# chave = nome padrão usado pelo sistema | valor = formas como o usuário pode escrever
DISPOSITIVOS = {
    "luz": ["luz", "luzes", "lampada", "lampadas", "iluminacao", "abajur"],
    "ventilador": ["ventilador", "ventiladores", "ventilacao"],
    "ar_condicionado": ["ar condicionado", "ar", "climatizador"],
    "tv": ["tv", "televisao", "televisor"],
}

AMBIENTES = {
    "sala": ["sala", "living"],
    "quarto": ["quarto", "dormitorio", "suite"],
    "cozinha": ["cozinha"],
    "banheiro": ["banheiro", "lavabo"],
    "escritorio": ["escritorio"],
}


def _procurar(texto_normalizado: str, dicionario: dict):
    """Procura no texto qualquer sinônimo do dicionário. Devolve o nome padrão ou None."""
    for nome_padrao, sinonimos in dicionario.items():
        for sinonimo in sinonimos:
            # \b garante que a palavra seja inteira (assim "ar" não é achado dentro de "parar")
            if re.search(rf"\b{re.escape(sinonimo)}\b", texto_normalizado):
                return nome_padrao
    return None


def extrair_entidades(mensagem: str) -> dict:
    texto = normalizar_texto(mensagem)
    return {
        "dispositivo": _procurar(texto, DISPOSITIVOS),
        "ambiente": _procurar(texto, AMBIENTES),
    }
