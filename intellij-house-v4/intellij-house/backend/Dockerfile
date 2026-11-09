# O contexto de build é a RAIZ do repositório (o docker-compose.yml já configura isso),
# porque a imagem precisa do código do back-end E do front-end React.

# ---------- Etapa 1: compila o front-end React ----------
FROM node:22-alpine AS front
WORKDIR /frontend
COPY frontend/package*.json ./
# "npm ci" exige o package-lock.json; se ele ainda não existir, cai para "npm install"
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY frontend/ ./
# o vite.config.ts manda o resultado para ../backend/public  ->  /backend/public
RUN npm run build

# ---------- Etapa 2: compila o TypeScript do back-end ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ---------- Etapa 3: imagem final (só o necessário para rodar) ----------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=front /backend/public ./public
EXPOSE 3000
CMD ["node", "dist/index.js"]
