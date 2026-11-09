"""
dados_treino.py
Cria o conjunto de frases usado para ENSINAR o modelo (dataset sintético).

Como funciona:
  1. Para cada intenção escrevemos "modelos de frase" com os espaços {disp} e {amb}.
  2. Combinamos esses modelos com dispositivos e ambientes variados.
  3. O resultado é uma lista de pares (frase, intenção) para treinar o modelo.

Intenções (intents) do projeto:
  - ligar_dispositivo
  - desligar_dispositivo
  - consultar_estado
  - duvida_dispositivo
  - consultar_rotina (pergunta sobre hábitos/rotinas aprendidas)
  - fora_do_escopo   (assuntos que não têm relação com a casa; evita respostas absurdas)
"""
import random

MODELOS = {
    "ligar_dispositivo": [
        "ligue {disp} {amb}",
        "liga {disp} {amb}",
        "acenda {disp} {amb}",
        "acende {disp} {amb}",
        "pode ligar {disp} {amb}",
        "por favor ligue {disp} {amb}",
        "quero ligar {disp} {amb}",
        "preciso que voce ligue {disp} {amb}",
        "ativa {disp} {amb}",
        "ative {disp} {amb}",
        "liga ai {disp} {amb}",
        "coloca {disp} {amb} para funcionar",
        "pode acender {disp} {amb}",
        "da uma ligada em {disp} {amb}",
        "inicie {disp} {amb}",
        "liga {disp} {amb} por favor",
    ],
    "desligar_dispositivo": [
        "desligue {disp} {amb}",
        "desliga {disp} {amb}",
        "apague {disp} {amb}",
        "apaga {disp} {amb}",
        "pode desligar {disp} {amb}",
        "por favor desligue {disp} {amb}",
        "quero desligar {disp} {amb}",
        "preciso que voce desligue {disp} {amb}",
        "desativa {disp} {amb}",
        "desative {disp} {amb}",
        "desliga ai {disp} {amb}",
        "pode apagar {disp} {amb}",
        "da uma desligada em {disp} {amb}",
        "encerre {disp} {amb}",
        "para {disp} {amb}",
        "desliga {disp} {amb} por favor",
    ],
    "consultar_estado": [
        "{disp} {amb} esta ligado",
        "{disp} {amb} esta ligada",
        "{disp} {amb} esta desligado",
        "{disp} {amb} esta desligada",
        "{disp} {amb} esta acesa",
        "{disp} {amb} esta apagada",
        "{disp} {amb} esta funcionando",
        "qual o estado {disp} {amb}",
        "qual e o estado {disp} {amb}",
        "me diga se {disp} {amb} esta ligado",
        "verifique se {disp} {amb} esta ligado",
        "confere se {disp} {amb} esta desligado",
        "como esta {disp} {amb}",
        "{disp} {amb} ficou ligado",
        "sera que deixei {disp} {amb} ligado",
        "consulta o estado {disp} {amb}",
    ],
    "duvida_dispositivo": [
        "quais dispositivos tem {amb}",
        "quais dispositivos existem {amb}",
        "o que posso controlar {amb}",
        "o que tem {amb}",
        "que aparelhos tem {amb}",
        "liste os dispositivos {amb}",
        "me mostra os dispositivos {amb}",
        "quais aparelhos posso controlar {amb}",
        "que dispositivos voce controla {amb}",
        "o que voce consegue controlar {amb}",
        "tem {disp} {amb}",
        "quais sao os dispositivos {amb}",
        "me diga o que posso ligar {amb}",
        "quais equipamentos existem {amb}",
        "como funciona o controle {amb}",
        "o que voce sabe fazer",
        "quais dispositivos existem na casa",
        "o que posso controlar",
        "o que voce pode fazer",
        "lista todos os dispositivos",
    ],
}


# Frases SEM relação com a casa. Servem para o modelo aprender a dizer "isso não é comigo".
# (Sem esta classe, o modelo tentaria encaixar QUALQUER frase em uma das 4 intenções.)
FRASES_FORA_DO_ESCOPO = [
    "qual a capital do brasil", "qual e a capital da italia", "conte uma piada",
    "me conta uma historia", "que horas sao", "qual a previsao do tempo",
    "vai chover amanha", "quem descobriu o brasil", "quanto e dois mais dois",
    "me ajuda com a lição de casa de matematica", "quem ganhou o jogo ontem",
    "toca uma musica", "qual o seu nome", "voce tem namorada",
    "como faco um bolo de chocolate", "qual a receita de macarrao",
    "me recomenda um filme", "o que voce acha de futebol", "bom dia",
    "boa noite tudo bem", "oi", "ola", "obrigado", "quanto custa um carro",
    "qual a distancia da terra ate a lua", "quem e o presidente",
    "como esta o transito hoje", "me ensina a programar", "quero pedir uma pizza",
    "qual o resultado da loteria", "traduza isso para o ingles",
]

# Palavras usadas para preencher os espaços {disp} e {amb}
# (as formas com artigo, ex.: "a luz" e "da sala", deixam as frases mais naturais)
DISPOSITIVOS = ["a luz", "as luzes", "a lampada", "o ventilador", "o ar condicionado",
                "o ar", "a tv", "a televisao", "o abajur"]
AMBIENTES = ["da sala", "do quarto", "da cozinha", "do banheiro", "do escritorio",
             "na sala", "no quarto", "na cozinha", "no banheiro", "no escritorio", ""]


# Intenção ligada ao aprendizado de rotina ("a casa que aprende")
MODELOS["consultar_rotina"] = [
    "quais sao as minhas rotinas", "qual e a minha rotina", "o que voce aprendeu sobre mim",
    "o que voce aprendeu sobre a minha rotina", "quais habitos voce aprendeu", "que habitos voce notou",
    "me mostra minha rotina", "voce aprendeu alguma rotina", "voce tem alguma sugestao para mim",
    "o que voce sugere agora", "qual e o meu padrao de uso da casa", "me fala os meus habitos",
    "quais sao os meus habitos na casa", "que horas eu costumo desligar {disp} {amb}",
    "que horas eu costumo ligar {disp} {amb}", "qual e a minha rotina com {disp} {amb}",
    "que sugestoes voce tem", "tem alguma sugestao de rotina", "o que voce observou sobre meus habitos",
]


def gerar_dataset(semente: int = 42):
    """Devolve duas listas: frases e intenções (rótulos)."""
    random.seed(semente)  # semente fixa = mesmo resultado toda vez (bom para testes)
    frases, intencoes = [], []

    for intencao, modelos in MODELOS.items():
        for modelo in modelos:
            # 6 combinações aleatórias por modelo de frase
            for _ in range(6):
                disp = random.choice(DISPOSITIVOS)
                amb = random.choice(AMBIENTES)
                frase = modelo.format(disp=disp, amb=amb)
                frase = " ".join(frase.split())  # remove espaços duplos
                frases.append(frase)
                intencoes.append(intencao)

    for frase in FRASES_FORA_DO_ESCOPO:
        for _ in range(3):
            frases.append(frase)
            intencoes.append("fora_do_escopo")

    return frases, intencoes
