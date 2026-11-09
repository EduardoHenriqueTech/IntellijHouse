"""
rotina.py
"A casa que aprende": descobre os HORÁRIOS HABITUAIS do morador com Machine Learning.

Ideia (explicação simples):
  - Cada vez que o morador liga/desliga algo, o Node guarda o horário no histórico.
  - Aqui agrupamos esses horários com K-Means (aprendizado NÃO supervisionado).
    O centro de cada grupo é o "horário habitual" daquele hábito.
  - Horário é circular (23:50 está pertinho de 00:10), então convertemos a hora em um
    ponto de um círculo (seno e cosseno) antes de agrupar.
  - Usamos o coeficiente de silhueta (e uma distância mínima de 2h) para decidir se
    existem 1 ou 2 hábitos no mesmo dispositivo (ex.: liga a TV às 08h e às 20h).
"""
from collections import defaultdict

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

MIN_OCORRENCIAS = 3      # menos que isso ainda não é "hábito"
MAX_DISPERSAO_MIN = 90   # se o horário varia demais, não é rotina
MINUTOS_NO_DIA = 1440
SEPARACAO_MIN_ENTRE_HABITOS = 120  # dois hábitos precisam estar a pelo menos 2h um do outro


def _para_circulo(minutos):
    angulos = 2 * np.pi * np.asarray(minutos, dtype=float) / MINUTOS_NO_DIA
    return np.column_stack([np.cos(angulos), np.sin(angulos)])


def _centro_em_minutos(centro) -> int:
    angulo = np.arctan2(centro[1], centro[0]) % (2 * np.pi)
    return int(round(angulo / (2 * np.pi) * MINUTOS_NO_DIA)) % MINUTOS_NO_DIA


def _distancia_circular(a, b):
    """Diferença em minutos entre dois horários, considerando a virada do dia."""
    return np.abs(((np.asarray(a) - b + 720) % MINUTOS_NO_DIA) - 720)


def _agrupar(minutos):
    """Devolve (rótulos, centros em minutos) usando 1 ou 2 grupos."""
    pontos = _para_circulo(minutos)
    melhor_k = 1
    if len(minutos) >= 2 * MIN_OCORRENCIAS and len(np.unique(pontos, axis=0)) >= 2:
        k2 = KMeans(n_clusters=2, n_init=10, random_state=42).fit(pontos)
        c1, c2 = (_centro_em_minutos(c) for c in k2.cluster_centers_)
        longe = _distancia_circular(c1, c2) >= SEPARACAO_MIN_ENTRE_HABITOS
        if len(set(k2.labels_)) == 2 and longe and silhouette_score(pontos, k2.labels_) > 0.7:
            melhor_k = 2
    modelo = KMeans(n_clusters=melhor_k, n_init=10, random_state=42).fit(pontos)
    return modelo.labels_, [_centro_em_minutos(c) for c in modelo.cluster_centers_]


def aprender_rotina(eventos: list) -> list:
    """eventos: [{dispositivo_id, dispositivo_nome, acao, minuto_do_dia}, ...]"""
    grupos = defaultdict(list)
    for e in eventos:
        chave = (e["dispositivo_id"], e["dispositivo_nome"], e["acao"])
        grupos[chave].append(int(e["minuto_do_dia"]))

    rotinas = []
    for (disp_id, nome, acao), minutos in grupos.items():
        if len(minutos) < MIN_OCORRENCIAS:
            continue
        rotulos, centros = _agrupar(minutos)
        minutos = np.asarray(minutos)
        for indice, centro in enumerate(centros):
            membros = minutos[rotulos == indice]
            if len(membros) < MIN_OCORRENCIAS:
                continue
            dispersao = float(_distancia_circular(membros, centro).mean())
            if dispersao > MAX_DISPERSAO_MIN:
                continue
            rotinas.append({
                "dispositivo_id": disp_id,
                "dispositivo_nome": nome,
                "acao": acao,
                "horario": f"{centro // 60:02d}:{centro % 60:02d}",
                "minuto_do_dia": centro,
                "ocorrencias": int(len(membros)),
                "dispersao_min": int(round(dispersao)),
                "consistencia": round(max(0.0, 1 - dispersao / MAX_DISPERSAO_MIN), 2),
            })
    rotinas.sort(key=lambda r: (-r["ocorrencias"], r["dispersao_min"]))
    return rotinas
