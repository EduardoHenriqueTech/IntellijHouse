"""
testes_nlu.py
Teste de interpretação das mensagens (Etapa 6).
Cada linha: (frase, intenção esperada, dispositivo esperado, ambiente esperado)
A intenção esperada pode ser uma tupla quando mais de uma resposta é aceitável.

Atenção: são frases ESCRITAS À MÃO, diferentes das usadas no treino, para testar de verdade.

    python testes_nlu.py
"""
from interpretador import interpretar_mensagem

CASOS = [
    ("Apague a luz da sala.",                    "desligar_dispositivo", "luz", "sala"),
    ("Acenda a luz do quarto",                   "ligar_dispositivo",    "luz", "quarto"),
    ("Liga o ventilador da sala, por favor",     "ligar_dispositivo",    "ventilador", "sala"),
    ("Desligue o ar condicionado do quarto",     "desligar_dispositivo", "ar_condicionado", "quarto"),
    ("A luz do quarto está ligada?",             "consultar_estado",     "luz", "quarto"),
    ("O ventilador da sala está desligado?",     "consultar_estado",     "ventilador", "sala"),
    ("A TV da sala está funcionando?",           "consultar_estado",     "tv", "sala"),
    ("Quais dispositivos tem na cozinha?",       "duvida_dispositivo",   None, "cozinha"),
    ("O que posso controlar no quarto?",         "duvida_dispositivo",   None, "quarto"),
    ("Pode apagar a lâmpada do banheiro?",       "desligar_dispositivo", "luz", "banheiro"),
    ("Preciso que ligue a televisão da sala",    "ligar_dispositivo",    "tv", "sala"),
    ("asdfgh qwerty zzz",                        ("nao_entendi", "fora_do_escopo"), None, None),
    ("Qual a capital da França?",                "fora_do_escopo",       None, None),
    ("Me conta uma curiosidade sobre o espaço",  "fora_do_escopo",       None, None),
]

if __name__ == "__main__":
    acertos = 0
    for frase, intencao_esp, disp_esp, amb_esp in CASOS:
        r = interpretar_mensagem(frase)
        aceitas = intencao_esp if isinstance(intencao_esp, tuple) else (intencao_esp,)
        ok = (r["intencao"] in aceitas and r["dispositivo"] == disp_esp
              and r["ambiente"] == amb_esp)
        acertos += ok
        marca = "OK  " if ok else "FALHA"
        print(f"[{marca}] {frase!r}")
        print(f"        obtido: {r['intencao']} | {r['dispositivo']} | {r['ambiente']} "
              f"(confiança {r['confianca']})")
        if not ok:
            print(f"        esperado: {intencao_esp} | {disp_esp} | {amb_esp}")
    print(f"\nResultado: {acertos}/{len(CASOS)} casos corretos")
