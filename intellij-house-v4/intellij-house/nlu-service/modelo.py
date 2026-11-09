"""
modelo.py
Treina, salva e carrega o modelo de Machine Learning que descobre a INTENÇÃO.

Como o modelo funciona (explicação simples):
  1. TF-IDF: transforma cada frase em números. Palavras importantes para distinguir
     as frases ganham peso maior (ex.: "apague" pesa mais que "a").
  2. Regressão Logística: algoritmo de classificação que aprende, a partir dos exemplos,
     quais palavras indicam cada intenção e calcula a PROBABILIDADE de cada uma.

Os dois são juntos em um Pipeline do scikit-learn (uma "esteira": texto entra, intenção sai).
"""
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from dados_treino import gerar_dataset
from normalizacao import normalizar_texto

ARQUIVO_MODELO = os.path.join(os.path.dirname(__file__), "modelo_intencoes.joblib")


def criar_pipeline() -> Pipeline:
    return Pipeline([
        # C=10 deixa o modelo mais "confiante" nas previsões (padrão é 1)
        # ngram_range=(1, 2): olha palavras sozinhas ("liga") e pares ("pode ligar")
        ("tfidf", TfidfVectorizer(preprocessor=normalizar_texto, ngram_range=(1, 2))),
        ("classificador", LogisticRegression(C=10, max_iter=1000)),
    ])


def treinar_e_salvar(mostrar_relatorio: bool = False) -> Pipeline:
    frases, intencoes = gerar_dataset()

    if mostrar_relatorio:
        # Separa 20% das frases só para TESTAR (o modelo não vê essas frases no treino)
        x_treino, x_teste, y_treino, y_teste = train_test_split(
            frases, intencoes, test_size=0.2, random_state=42, stratify=intencoes
        )
        pipeline = criar_pipeline()
        pipeline.fit(x_treino, y_treino)
        previsoes = pipeline.predict(x_teste)
        print(f"Frases de treino: {len(x_treino)} | Frases de teste: {len(x_teste)}")
        print(f"Acurácia no teste: {accuracy_score(y_teste, previsoes):.2%}\n")
        print(classification_report(y_teste, previsoes, zero_division=0))

    # Modelo final: treina com TODAS as frases e salva em arquivo
    pipeline = criar_pipeline()
    pipeline.fit(frases, intencoes)
    joblib.dump(pipeline, ARQUIVO_MODELO)
    print(f"Modelo salvo em: {ARQUIVO_MODELO}")
    return pipeline


def carregar_modelo() -> Pipeline:
    """Carrega o modelo salvo. Se ainda não existir, treina um novo."""
    if not os.path.exists(ARQUIVO_MODELO):
        print("Modelo não encontrado. Treinando um novo...")
        return treinar_e_salvar()
    return joblib.load(ARQUIVO_MODELO)
