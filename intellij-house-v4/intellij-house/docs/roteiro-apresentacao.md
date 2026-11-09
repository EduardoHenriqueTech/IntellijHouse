# Roteiro de apresentação (Etapa 7)

## 1. Abertura (1 min)
Problema: controlar a casa sem decorar menus, apenas conversando.
Solução: assistente com NLU, dividido em Node.js (execução) e Python (entendimento).

## 2. Arquitetura (2 min)
Mostre o diagrama do README. Explique o caminho de uma mensagem:
usuário → Node → Python → Node → banco → resposta.

## 3. Demonstração prática (4 min)
Deixe aberto o chat em http://localhost:3000 (a linha "NLU:" aparece sob cada resposta).

| Digite | O que mostrar |
|---|---|
| Apague a luz da sala | Painel muda para "Desligado"; linha do NLU mostra intenção, dispositivo e ambiente |
| A luz da sala está ligada? | Consulta ao banco: "está desligada" |
| Acenda a lâmpada da sala | Sinônimo ("lâmpada" → luz) |
| Pode ligar o ventilador do quarto, por favor? | Frase mais longa e educada |
| Liga a luz | O assistente pergunta o ambiente |
| Liga a TV da cozinha | Dispositivo que não existe |
| Quais dispositivos tem na cozinha? | Intenção de dúvida |
| Qual a capital da França? | Fora do escopo |

Se der tempo: derrube o Python e mande uma mensagem para mostrar o tratamento de erro (503).

## 3.1 Novidades para mostrar (3 min)
| Ação | O que mostrar |
|---|---|
| Abrir `/#/admin` | Área administrativa separada: cadastrar "Luz do escritório", editar e excluir (CRUD completo). Tente cadastrar de novo para mostrar o bloqueio de duplicado (409) |
| Abrir `/docs` | Swagger: execute `GET /dispositivos?ordenar=nome` e mostre o cadeado nas rotas de escrita |
| Rodar `npm run popular-historico` e abrir "Rotinas aprendidas" | Hábitos descobertos pelo K-Means, regularidade e o botão "Ligar agora" quando o horário está próximo |
| Perguntar no chat "O que você aprendeu sobre mim?" | O chatbot responde com as rotinas (nova intenção `consultar_rotina`) |

## 4. Machine Learning (2 min)
São dois modelos: (1) **supervisionado** — TF-IDF + Regressão Logística para a intenção da frase; (2) **não supervisionado** — K-Means para descobrir os horários habituais (`nlu-service/rotina.py`).
Rode `python treinar_modelo.py` e mostre a acurácia e o relatório.
Explique: TF-IDF (frase → números) e Regressão Logística (números → intenção + probabilidade).

## 5. Limitações (importante: mostra maturidade)
- O dataset é **sintético** (gerado de modelos de frase), por isso a acurácia no teste é altíssima. Frases muito diferentes das de treino podem errar.
- Entidades por dicionário: palavra fora do dicionário não é reconhecida.
- Cada mensagem é independente (sem memória de contexto).
- Dispositivos simulados.
Melhorias futuras: mais frases de treino reais, comando para vários dispositivos, controle de hardware (ESP32), autenticação.

## Perguntas prováveis da banca
**Onde a casa "aprende"?** No histórico de comandos: o K-Means agrupa os horários de cada hábito e a casa sugere a ação quando o horário se aproxima (`rotina.py` e `rotinaService.ts`).

**Por que K-Means e não uma regressão?** Não temos rótulos ("este é um hábito"); queremos descobrir grupos de horários. É aprendizado não supervisionado. A silhueta decide entre 1 ou 2 hábitos, e o horário é tratado como círculo para que 23:50 e 00:10 fiquem próximos.

**Os dados de rotina são reais?** Os do `popular-historico` são **simulados** (origem "simulado") só para demonstrar; o sistema registra os reais (painel e chat) e a área administrativa apaga os simulados.

**Como o S.O.L.I.D. foi aplicado?** Veja `docs/arquitetura-solid.md` (services dependem de interfaces; `container.ts` escolhe as implementações).

**Como o admin é protegido?** Por `ADMIN_TOKEN` no servidor (cabeçalho `x-admin-token`). Não há login individual — está no "fora do escopo".

**Por que dois serviços (Node e Python)?** Python tem as melhores bibliotecas de ML; Node é ótimo para APIs. Cada um faz o que faz melhor, e conversam por REST.

**O que é NLU?** Natural Language Understanding: transformar texto livre em informação estruturada (intenção + entidades).

**Diferença entre intenção e entidade?** Intenção é *o que* o usuário quer (desligar). Entidades são *os detalhes* (luz, sala).

**Por que as entidades não usam ML?** Com poucos dispositivos, dicionário é mais simples, previsível e fácil de explicar. ML para entidades exigiria muito mais dados.

**Como o modelo sabe que não entendeu?** Pela probabilidade: abaixo de 50% o sistema recusa. Além disso, existe a classe `fora_do_escopo` treinada com frases sem relação com a casa.

**O que é TF-IDF?** Dá mais peso a palavras que ajudam a diferenciar frases (como "apague") e menos a palavras comuns (como "a", "de").

**Por que TypeORM e `synchronize: true`?** O TypeORM mapeia classes para tabelas. O `synchronize` cria a tabela sozinho; em sistemas reais usam-se migrations.

**A acurácia de ~100% é confiável?** Para o dataset sintético sim, mas ela é otimista, porque treino e teste vêm dos mesmos modelos de frase. Por isso existe o `testes_nlu.py`, com frases escritas à mão.
