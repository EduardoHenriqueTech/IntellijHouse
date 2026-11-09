"""
interpretador.py
Junta as duas partes do NLU:
  - Intent Classification (modelo de ML)  -> descobre O QUE o usuário quer
  - Entity Extraction (dicionários)       -> descobre EM QUAL dispositivo e ambiente
"""
from modelo import carregar_modelo
from extrator_entidades import extrair_entidades

# Se o modelo tiver menos que 50% de certeza, dizemos que não entendemos.
LIMITE_CONFIANCA = 0.50

modelo = carregar_modelo()


def interpretar_mensagem(mensagem: str) -> dict:
    # predict_proba devolve a probabilidade de cada intenção, ex.: [0.05, 0.90, 0.03, 0.02]
    probabilidades = modelo.predict_proba([mensagem])[0]
    indice_maior = probabilidades.argmax()
    intencao = modelo.classes_[indice_maior]
    confianca = float(probabilidades[indice_maior])

    entidades = extrair_entidades(mensagem)

    # Intenções que mexem em um dispositivo precisam ter achado algum dispositivo.
    # Se a confiança for baixa, não arriscamos executar nada.
    if confianca < LIMITE_CONFIANCA:
        intencao = "nao_entendi"

    # Assunto que não tem relação com a casa: não faz sentido enviar dispositivo/ambiente
    if intencao == "fora_do_escopo":
        entidades = {"dispositivo": None, "ambiente": None}

    return {
        "mensagem": mensagem,
        "intencao": intencao,
        "confianca": round(confianca, 3),
        "dispositivo": entidades["dispositivo"],
        "ambiente": entidades["ambiente"],
    }
