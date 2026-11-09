"""
normalizacao.py
Função para "limpar" o texto antes de usá-lo no modelo e na busca de entidades.

Por que normalizar?
Os usuários escrevem de formas diferentes: "Apague a LUZ da sala!", "apague a luz da sala".
Para o computador, textos diferentes são coisas diferentes. Então deixamos tudo no mesmo padrão:
  - letras minúsculas
  - sem acentos (lâmpada -> lampada)
  - sem pontuação (? ! , .)
"""
import re
import unicodedata


def normalizar_texto(texto: str) -> str:
    texto = texto.lower()

    # Remove acentos: separa a letra do acento e descarta o acento
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(letra for letra in texto if unicodedata.category(letra) != "Mn")

    # Troca qualquer coisa que não seja letra, número ou espaço por espaço
    texto = re.sub(r"[^a-z0-9\s]", " ", texto)

    # Junta espaços repetidos
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto
