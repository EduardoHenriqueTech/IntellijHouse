# Etapa 1 — Planejamento e requisitos

## Problema e público-alvo
**Problema:** controlar uma casa conectada exige abrir aplicativos e decorar menus, e a casa não aprende nada com o dia a dia de quem mora nela.
**Solução:** uma aplicação web em que o morador **conversa** com a casa em linguagem natural e a casa **aprende os horários habituais** dele para sugerir ajustes de conforto e energia.

| Ator | Necessidade | Onde atua no sistema |
|---|---|---|
| **Morador** (usuário final) | Ligar/desligar/consultar dispositivos, conversar com o assistente, receber sugestões de rotina | Painel do morador (`/`) |
| **Administrador / síndico** | Cadastrar, editar e excluir dispositivos; manter o histórico; consultar a API | Área administrativa (`/#/admin`) e Swagger (`/docs`) |
| **Prestador de serviço** (futuro) | Consultar dispositivos para manutenção | Fora do escopo desta entrega (usaria a API REST) |

## Requisitos funcionais
| Código | Requisito |
|---|---|
| RF01 | O usuário envia uma mensagem em linguagem natural |
| RF02 | O sistema identifica a intenção (ligar, desligar, consultar estado, dúvida, rotina) |
| RF03 | O sistema identifica o dispositivo (luz, ventilador, ar-condicionado, TV) |
| RF04 | O sistema identifica o ambiente (sala, quarto, cozinha, banheiro, escritório) |
| RF05 | O sistema liga e desliga dispositivos simulados |
| RF06 | O sistema consulta o estado atual de um dispositivo |
| RF07 | O sistema responde com mensagem clara de confirmação ou erro |
| RF08 | O sistema entende diferentes formas de pedir a mesma coisa |
| RF09 | O sistema avisa quando não entende a mensagem ou o dispositivo não existe |
| RF10 | O sistema pede o ambiente quando houver mais de um dispositivo do mesmo tipo |
| RF11 | O administrador cadastra, lista, edita e exclui dispositivos (CRUD completo) |
| RF12 | O sistema impede dois dispositivos do mesmo tipo no mesmo ambiente |
| RF13 | O painel lista dispositivos com filtro (ligados/desligados), busca e ordenação |
| RF14 | Todo liga/desliga é registrado em um histórico (dispositivo, ação, horário, origem) |
| RF15 | O sistema aprende, por Machine Learning, os horários habituais de cada hábito do morador |
| RF16 | O sistema sugere ao morador, perto do horário habitual, a ação que ele costuma fazer |
| RF17 | O morador consulta as rotinas aprendidas pelo painel ou perguntando ao assistente |
| RF18 | A área administrativa é separada do painel do morador e protegida por token |
| RF19 | A API é documentada com Swagger (OpenAPI) |

## Requisitos não funcionais
| Código | Requisito |
|---|---|
| RNF01 | Código simples, comentado e fácil de explicar |
| RNF02 | Separação de responsabilidades: Node cuida da casa, Python cuida da linguagem e do aprendizado |
| RNF03 | Comunicação entre Node e Python por API REST (JSON) |
| RNF04 | Dados persistidos em PostgreSQL via TypeORM |
| RNF05 | Execução local, sem hardware e sem serviços pagos |
| RNF06 | Respostas em poucos segundos |
| RNF07 | Interface responsiva (celular, tablet e desktop) |
| RNF08 | Arquitetura em camadas seguindo S.O.L.I.D. (ver `arquitetura-solid.md`) |
| RNF09 | Rotas de escrita da área administrativa protegidas por `ADMIN_TOKEN` |
| RNF10 | Horários tratados sempre no fuso de São Paulo, independentemente do servidor |
| RNF11 | Possibilidade de publicação na internet (Docker; ver `DEPLOY.md`) |

## Decisões de tecnologia
| Item | Escolha | Motivo |
|---|---|---|
| API Node | Express + TypeScript | Mais didático e conhecido; atende a exigência do projeto |
| ORM / banco | TypeORM + PostgreSQL | Exigência do projeto |
| Documentação da API | Swagger (swagger-ui-express, OpenAPI 3) | Exigência do projeto |
| API Python | Flask (gunicorn em produção) | Mais simples que alternativas |
| ML — intenção do chat | scikit-learn: TF-IDF + Regressão Logística (supervisionado) | Simples, rápido e fácil de explicar |
| ML — rotina do morador | scikit-learn: K-Means + coeficiente de silhueta (não supervisionado) | Descobre horários habituais sem precisar de rótulos |
| ChatBot | NLU próprio (Flask + scikit-learn) | Roda local, sem custo e sem chave de API; ver observação abaixo |
| Entidades | Dicionários de sinônimos | Não precisa de IA pesada |
| Interface | React 18 + TypeScript (Vite) + React Router, HTML5/CSS3 responsivo, em duas áreas (morador e administrador) | Exigência do roteiro (React.js); componentes reutilizáveis e tipagem compartilhada com a API |

**Observação sobre o ChatBot:** o roteiro cita Dialogflow, Rasa ou OpenAI API como exemplos de ferramenta. Aqui o chatbot é construído sobre um NLU próprio, treinado com scikit-learn. Vale confirmar com o professor da disciplina se essa escolha é aceita.

## Fora do escopo (de propósito)
Login individual de usuários (existe apenas um token de administrador), hardware real, WebSocket, comandos para vários dispositivos de uma vez ("apague todas as luzes") e memória de contexto entre mensagens.

## Intenções do assistente
| Intenção | Exemplo |
|---|---|
| ligar_dispositivo | "Acenda a luz do quarto" |
| desligar_dispositivo | "Apague a luz da sala" |
| consultar_estado | "O ventilador da sala está ligado?" |
| duvida_dispositivo | "Quais dispositivos tem na cozinha?" |
| consultar_rotina | "O que você aprendeu sobre mim?" |
| fora_do_escopo | "Qual a capital da França?" |
