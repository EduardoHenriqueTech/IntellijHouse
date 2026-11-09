# Intellij House — Casa Inteligente com Assistente Virtual (NLU + ML)

Projeto acadêmico do 4º semestre de Análise e Desenvolvimento de Sistemas (ADS).
O usuário conversa com a casa em linguagem natural ("Apague a luz da sala") e o sistema entende e executa o comando em dispositivos **simulados**. A casa também **aprende a rotina do morador** (Machine Learning) e sugere ações nos horários habituais.

**Atalhos depois de rodar:** painel do morador `http://localhost:3000` · área administrativa `http://localhost:3000/#/admin` · documentação Swagger `/docs` · saúde `/saude`.

## Arquitetura

```
 Navegador (React)
        │  POST /assistente/mensagem
        ▼
 ┌───────────────────────────┐   POST /interpretar    ┌──────────────────────────────┐
 │  Back-End Node.js (3000)  │ ─────────────────────► │  Microsserviço Python (5001) │
 │  Express + TypeORM        │ ◄───────────────────── │  Flask + scikit-learn        │
 │  executa a ação           │  intenção + entidades  │  NLU: intenção + entidades   │
 └─────────────┬─────────────┘                        └──────────────────────────────┘
               │ TypeORM
               ▼
        PostgreSQL (tabela dispositivos)
```

| Parte | Responsabilidade |
|---|---|
| **Node.js** | Recebe a mensagem, chama o Python, liga/desliga/consulta dispositivos no banco e monta a resposta |
| **Python** | Entende a frase: descobre a **intenção** (modelo de ML) e o **dispositivo/ambiente** (dicionários). Também **aprende a rotina** do morador agrupando os horários do histórico (K-Means) |
| **PostgreSQL** | Guarda os dispositivos simulados, seu estado (ligado/desligado) e o histórico de comandos |

## Estrutura de pastas

```
intellij-house/
├── frontend/                 React 18 + TypeScript (Vite)
│   ├── vite.config.ts            Build vai para backend/public; proxy da API no modo dev
│   └── src/
│       ├── main.tsx · App.tsx    Entrada e rotas (React Router, HashRouter)
│       ├── api/                  Chamadas HTTP tipadas (dispositivos, assistente, rotina/histórico)
│       ├── context/              Estado global: HouseContext (dispositivos, chat, rotinas) e ToastContext
│       ├── components/           Layout, DeviceCard, RoomCard, RoutineCard, Switch, ActivityList, ícones
│       ├── pages/                Visão geral, Dispositivos, Assistente, Ambientes, Atividade, Rotinas
│       │   └── admin/AdminPage.tsx   Área administrativa (CRUD + histórico)
│       ├── styles/               app.css (painel) e admin.css (escopado em .admin)
│       └── types.ts · constants.ts · utils/format.ts
├── backend/                  Node.js + TypeScript
│   ├── public/               (gerada) build do React, servido pelo Express — não editar à mão
│   └── src/
│       ├── index.ts              Inicia o servidor
│       ├── data-source.ts        Conexão TypeORM → PostgreSQL
│       ├── seed.ts               Dispositivos iniciais
│       ├── container.ts          Liga services e repositórios (injeção de dependência)
│       ├── validation.ts         Validação dos dados de dispositivo
│       ├── entities/             Dispositivo e HistoricoComando (viram tabelas)
│       ├── domain/interfaces.ts  Contratos dos repositórios (S.O.L.I.D.)
│       ├── repositories/         Acesso ao banco (TypeORM)
│       ├── routes/               Rotas da API (dispositivos, assistente, rotina/histórico)
│       ├── services/             Regras (dispositivos, assistente, rotina, chamadas ao Python)
│       ├── middlewares/adminAuth.ts   Token de administrador
│       ├── docs/swagger.ts       Documentação OpenAPI
│       ├── seedHistorico.ts      Gera histórico SIMULADO para demonstrar a rotina
│       └── testes/               testeIntegracao.ts e testeCrud.ts
├── nlu-service/              Python
│   ├── app.py                    API Flask
│   ├── interpretador.py          Junta intenção + entidades
│   ├── modelo.py                 Treino/carga do modelo (TF-IDF + Regressão Logística)
│   ├── extrator_entidades.py     Dispositivo e ambiente (dicionários)
│   ├── rotina.py                 Aprendizado de rotina (K-Means)
│   ├── dados_treino.py           Frases de treino (dataset sintético)
│   ├── normalizacao.py           Limpeza do texto
│   ├── treinar_modelo.py         Treina e mostra a acurácia
│   └── testes_nlu.py             Testes de interpretação
└── docs/
    ├── requisitos.md
    ├── arquitetura-solid.md
    ├── roteiro-apresentacao.md
    ├── DEPLOY.md             Como colocar no ar
    └── prototipo/            Capturas das telas e orientação para o Figma/Canva
```

## Como rodar o projeto

Se você baixou o projeto para testar no seu computador, pode escolher entre rodar tudo pelo Docker ou iniciar cada parte separadamente. Se nunca usou essas tecnologias, recomendo começar pelo Docker: dá menos trabalho para configurar.

### Rodando com Docker

Antes de começar, instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) e abra o programa.

1. Abra o terminal dentro da pasta principal do projeto. É a pasta onde está o arquivo `docker-compose.yml`.
2. Crie um arquivo chamado `.env` nessa pasta.
3. Abra o arquivo e coloque estas duas linhas:

```env
DB_PASSWORD=MinhaSenhaLocal123
ADMIN_TOKEN=TokenAdmin123
```

Pode usar outros valores, se preferir. O importante é preencher os dois campos.

4. No terminal, rode:

```bash
docker compose up --build
```

Na primeira vez, o Docker vai baixar as imagens e preparar os serviços. Isso pode levar alguns minutos. Quando terminar, acesse:

- Sistema: http://localhost:3000
- Área administrativa: http://localhost:3000/#/admin
- Documentação da API: http://localhost:3000/docs

Para parar o projeto, pressione `Ctrl + C` no terminal. Depois, se quiser, execute:

```bash
docker compose down
```

Se precisar apagar também os dados salvos no banco e começar novamente do zero, use:

```bash
docker compose down -v
```

Atenção: esse último comando apaga os dados do banco.

### Rodando sem Docker

Também dá para executar o projeto instalando e iniciando cada parte separadamente. Para isso, você vai precisar de:

- Node.js e npm: https://nodejs.org/
- Python 3.10 ou superior: https://www.python.org/downloads/
- PostgreSQL 16: https://www.postgresql.org/download/

Depois de instalar, confira se o Node.js e o npm estão funcionando:

```bash
node -v
npm -v
```

E confira a versão do Python:

```bash
python --version
```

#### 1. Prepare o banco de dados

Abra o PostgreSQL e crie um banco com o nome `intellij_house`.

Se estiver usando o terminal `psql`, o comando é:

```sql
CREATE DATABASE intellij_house;
```

As tabelas e os dispositivos iniciais são criados pelo próprio back-end quando ele é iniciado.

#### 2. Inicie o serviço Python

Abra um terminal na pasta principal do projeto e entre na pasta `nlu-service`:

```bash
cd nlu-service
```

Crie um ambiente virtual para instalar as dependências do projeto sem misturá-las com outros projetos Python:

```bash
python -m venv venv
```

Ative o ambiente virtual.

No Windows (PowerShell):

```powershell
.\venv\Scripts\Activate.ps1
```

No Linux ou macOS:

```bash
source venv/bin/activate
```

Agora instale as dependências e inicie o serviço:

```bash
pip install -r requirements.txt
python app.py
```

Deixe esse terminal aberto. O serviço Python ficará rodando na porta `5001`.

Se o Windows não permitir ativar o ambiente virtual, rode este comando no PowerShell e tente novamente:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

#### 3. Inicie o back-end

Abra outro terminal na pasta principal do projeto e entre em `backend`:

```bash
cd backend
npm install
```

Crie o arquivo `.env` usando o arquivo de exemplo que já está na pasta.

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

Abra `backend/.env` e confira as configurações do banco. A senha precisa ser a mesma que você definiu no PostgreSQL.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SENHA_DO_SEU_POSTGRES
DB_NAME=intellij_house
NLU_URL=http://localhost:5001
ADMIN_TOKEN=
```

Troque `SENHA_DO_SEU_POSTGRES` pela sua senha. Para testar localmente, pode deixar `ADMIN_TOKEN` vazio.

Com as configurações prontas, inicie o back-end:

```bash
npm run dev
```

Quando o servidor iniciar, deixe esse terminal aberto também.

#### 4. Inicie o front-end

Abra mais um terminal, volte para a pasta principal do projeto e entre em `frontend`:

```bash
cd frontend
npm install
npm run dev
```

O terminal vai mostrar o endereço para abrir no navegador. Normalmente é:

http://localhost:5173

Pronto! Com os três serviços rodando — Python, back-end e front-end — você já pode usar o sistema.

### Endereços úteis

| O que você quer acessar | Endereço |
|---|---|
| Sistema (Docker) | http://localhost:3000 |
| Sistema (front-end em desenvolvimento) | http://localhost:5173 |
| Área administrativa | http://localhost:3000/#/admin |
| Documentação da API | http://localhost:3000/docs |
| Verificar se o back-end está funcionando | http://localhost:3000/saude |
| Verificar se o serviço Python está funcionando | http://localhost:5001/saude |

### Quando for usar o projeto novamente

Se estiver usando Docker, abra o Docker Desktop, entre na pasta do projeto pelo terminal e rode `docker compose up`.

Se estiver rodando manualmente, primeiro inicie o PostgreSQL. Depois, abra os terminais do Python, do back-end e do front-end e execute os comandos de inicialização indicados acima. Não precisa instalar as dependências de novo toda vez.

### Gerar dados de exemplo (opcional)

O projeto também permite criar um histórico simulado de comandos para demonstrar a parte de aprendizado de rotina.

Com o banco e o back-end funcionando, abra outro terminal, entre na pasta `backend` e execute:

```bash
npm run popular-historico
```

Isso adiciona registros fictícios ao histórico. Eles podem ser apagados pela área administrativa.

## Testes

| Teste | Comando | O que verifica |
|---|---|---|
| Interpretação (NLU) | `cd nlu-service && python testes_nlu.py` | Se o Python entende frases novas |
| Integração | `cd backend && npm run testar` | Fluxo completo Node → Python → banco (Node e Python precisam estar rodando) |
| CRUD, admin, histórico, rotina e Swagger | `cd backend && npm run testar-crud` | Todas as rotas novas (com `ADMIN_TOKEN` no ambiente, se definido: `ADMIN_TOKEN=xxx npm run testar-crud`) |

Para testar a API direto (sem o chat):
```bash
curl -X POST http://localhost:3000/assistente/mensagem -H "Content-Type: application/json" -d "{\"mensagem\":\"Apague a luz da sala\"}"
curl http://localhost:3000/dispositivos
```

## Rotas da API

| Método | Rota | Função |
|---|---|---|
| POST | `/assistente/mensagem` | Envia uma frase ao assistente |
| GET | `/dispositivos` | Lista dispositivos (`?tipo=luz&ambiente=sala&ordenar=nome&ordem=desc`) |
| GET | `/dispositivos/:id` | Mostra um dispositivo |
| POST | `/dispositivos` 🔒 | Cria dispositivo |
| PUT / PATCH | `/dispositivos/:id` 🔒 | Substitui / altera campos |
| DELETE | `/dispositivos/:id` 🔒 | Exclui |
| POST | `/dispositivos/:id/ligar` · `/desligar` | Liga / desliga |
| GET | `/rotina` | Rotinas aprendidas (ML) + sugestões para agora |
| GET | `/historico?limite=50` | Últimos comandos registrados |
| DELETE | `/historico?origem=simulado` 🔒 | Apaga histórico de uma origem |
| GET | `/saude` · `/docs` · `/docs.json` | Saúde, Swagger e especificação OpenAPI |
| POST (Python) | `/interpretar` | Devolve intenção, dispositivo, ambiente e confiança |
| POST (Python) | `/rotina` | Recebe eventos e devolve os hábitos (K-Means) |

🔒 = exige `x-admin-token` quando `ADMIN_TOKEN` está definido.

## Como o NLU funciona

1. **Normalização:** minúsculas, sem acento e sem pontuação.
2. **Intent Classification (ML):** TF-IDF transforma a frase em números e a Regressão Logística escolhe a intenção com maior probabilidade (`ligar_dispositivo`, `desligar_dispositivo`, `consultar_estado`, `duvida_dispositivo`, `fora_do_escopo`).
3. **Entity Extraction (regras):** dicionários de sinônimos encontram dispositivo e ambiente (ex.: "lâmpada" → `luz`).
4. **Confiança mínima:** se a probabilidade for menor que 50%, o sistema responde que não entendeu, em vez de arriscar uma ação errada.

## Como a casa "aprende" a rotina

1. Cada liga/desliga (pelo painel ou pelo chat) vira um registro em `historico_comandos` com o horário (fuso de São Paulo).
2. O Node envia o histórico dos últimos 60 dias para o Python (`POST /rotina`).
3. Para cada par *dispositivo + ação*, o **K-Means** agrupa os horários. Como 23:50 e 00:10 são vizinhos, o horário é convertido em um ponto de círculo (seno e cosseno). O **coeficiente de silhueta** decide se há 1 ou 2 hábitos (ex.: TV às 08h e às 20h).
4. Só viram "hábito" grupos com pelo menos 3 ocorrências e variação média de até 90 minutos.
5. Se o horário atual está a até 30 min do hábito e o dispositivo está no estado oposto, o sistema **sugere** a ação (banner no painel e resposta do chat).

## Como adicionar um dispositivo ou ambiente novo

- **Dispositivo comum** (um dos tipos já existentes): use a **Área administrativa** (`/#/admin`) ou `POST /dispositivos`.
- **Tipo ou ambiente novo:** (1) Python: sinônimos em `extrator_entidades.py`; (2) Node: lista em `validation.ts` e dicionários de `assistenteService.ts`; (3) React: opções do formulário em `frontend/src/constants.ts` e rótulos em `frontend/src/utils/format.ts` (depois, `npm run build`); (4) retreine o modelo se quiser frases novas (`python treinar_modelo.py`).

## Interface web (frontend)

O front-end é uma aplicação **React 18 + TypeScript** (Vite), em `frontend/`, com duas áreas responsivas em tema escuro: o **painel do morador** e a **área administrativa** (`/#/admin`). As rotas usam `HashRouter` (`/#/dispositivos`, `/#/ambientes/quarto`, ...), então não colidem com as rotas da API.

| Rota | Tela |
|---|---|
| `/#/` | Visão geral: indicadores, ambientes, atividade e banner de sugestão da rotina |
| `/#/dispositivos` | Lista com filtro (todos/ligados/desligados), busca e ordenação |
| `/#/assistente` | Chat com o assistente (mostra a interpretação do NLU) |
| `/#/ambientes/:ambiente?` | Dispositivos por cômodo (o ambiente selecionado fica na URL) |
| `/#/atividade` | Ações feitas na sessão |
| `/#/rotinas` | Hábitos aprendidos por ML e botão "Ligar/Desligar agora" |
| `/#/admin` | CRUD de dispositivos, token de administrador e histórico de comandos |

**Como o código está organizado**
- `api/` — única camada que usa `fetch`; funções tipadas por recurso e `ApiError` para as respostas de erro da API.
- `context/HouseContext.tsx` — estado compartilhado do painel (dispositivos, atividade da sessão, conversa do chat, rotinas) e as ações que falam com a API; atualiza dispositivos a cada 30 s e rotinas a cada 2 min. Só envolve a área do morador, então a área admin não faz essas consultas.
- `components/` — peças reutilizáveis (`DeviceCard`, `RoomCard`, `RoutineCard`, `Switch`, `Layout`...). `pages/` — uma por rota.
- O React escapa todo texto por padrão (sem `innerHTML`), eliminando o risco de XSS que a versão em HTML puro tratava com uma função manual.

Endpoints consumidos: `GET /dispositivos`, `POST /dispositivos/:id/ligar|desligar`, `POST /assistente/mensagem`, `GET /rotina`, `GET /historico` e, só na área administrativa, `POST/PUT/DELETE /dispositivos` e `DELETE /historico`. Os indicadores e estados exibidos derivam dos dados da API; não há sensores nem medições de energia simulados. Os horários e hábitos vêm do histórico real de comandos (ou do histórico **simulado**, identificado com `origem = simulado`).

`npm run build` roda `tsc --noEmit` (checagem de tipos) antes do Vite; `npm run typecheck` faz só a checagem.
