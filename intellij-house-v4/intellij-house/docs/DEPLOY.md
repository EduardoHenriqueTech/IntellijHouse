# Como colocar o Intellij House no ar

O sistema tem **3 peças**: banco PostgreSQL, microsserviço Python (NLU/ML) e back-end Node.js (que também entrega as telas React já compiladas).
Qualquer hospedagem precisa rodar essas três. Escolha **um** dos caminhos abaixo.

> **Segurança:** na internet, defina sempre `ADMIN_TOKEN` (senão qualquer pessoa pode criar/excluir dispositivos) e use senhas fortes. Nunca suba o arquivo `.env` para o GitHub.

---

## Caminho A — Máquina local + link público (o mais simples para a apresentação)
Roda tudo no seu notebook (como no README) e gera um link temporário para outras pessoas acessarem.

1. Suba Python, Node e PostgreSQL normalmente e compile o front (`cd frontend && npm install && npm run build`) — README, passos 1 a 7.
2. Instale o **Cloudflare Tunnel** (`cloudflared`) ou o **ngrok** e rode:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   # ou: ngrok http 3000
   ```
3. O comando mostra um endereço `https://....` — é o link público. Ele só funciona enquanto o notebook e o comando estiverem ligados.

**Quando usar:** demonstração em sala/ExpoTech. **Limitação:** não é permanente.

---

## Caminho B — Docker Compose em um servidor (VPS)
Qualquer VPS com Linux e Docker (Oracle Cloud Free Tier, DigitalOcean, Hetzner, AWS Lightsail, etc.).

```bash
git clone <seu-repositorio> && cd intellij-house
printf "DB_PASSWORD=troque_esta_senha\nADMIN_TOKEN=troque_este_token\n" > .env
docker compose up -d --build
```
Abra `http://IP-DO-SERVIDOR:3000`. Para ter `https://seudominio.com`, coloque um proxy reverso (Caddy é o mais fácil: `seudominio.com { reverse_proxy localhost:3000 }`) e libere as portas 80/443 no firewall.

**Quando usar:** quer algo permanente e com controle total. **Custo:** depende do provedor (alguns têm camada gratuita).

> O `docker-compose.yml` e os Dockerfiles foram escritos para este projeto, mas **não foram executados no ambiente em que o código foi preparado** (sem Docker disponível). Faça um primeiro teste local com `docker compose up --build` antes de depender deles.

---

## Caminho C — Plataforma gerenciada (ex.: Render, Railway)
Você conecta o repositório do GitHub e a plataforma constrói e hospeda. Crie **3 recursos**:

1. **PostgreSQL** gerenciado → copie a *Internal/Connection URL*.
2. **Serviço web do Python** (`nlu-service`, runtime Docker, raiz `nlu-service`). Anote a URL dele.
3. **Serviço web do Node** (runtime Docker, **raiz do repositório**, caminho do Dockerfile `backend/Dockerfile`) — a raiz precisa ser o repositório inteiro porque a imagem também compila o front-end React. Variáveis:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | URL do PostgreSQL do passo 1 |
| `DB_SSL` | `true` (se o provedor exigir SSL) |
| `NLU_URL` | URL do serviço Python (com `https://`) |
| `ADMIN_TOKEN` | um segredo longo |

Cada plataforma tem regras próprias de plano gratuito (limites, hibernação do serviço, prazo de validade do banco). **Confira a página de preços atual** antes de escolher; em planos gratuitos o primeiro acesso após inatividade pode demorar.

---

## Depois de publicar
- Abra `/saude` (deve responder `{"status":"ok"}`), `/docs` (Swagger) e `/#/admin`.
- Para a demonstração da rotina, rode uma vez `npm run popular-historico` (na sua máquina, com `DATABASE_URL` apontando para o banco da nuvem) ou, no Docker Compose, `docker compose exec backend node dist/seedHistorico.js`. Isso gera histórico **simulado**, que a área administrativa consegue apagar depois.
