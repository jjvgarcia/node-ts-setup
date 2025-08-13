Com certeza! Dá pra acoplar um frontend React sem drama. Existem **duas formas** comuns:

---

# Opção A — **Um único container** (API Express + React estático)

Mais simples de deploy. A API serve os arquivos do React.

**1) Estrutura do repo (monorepo simples)**

```
/
  apps/
    api/        # teu servidor Node/TS atual
    web/        # novo frontend React
  package.json
  tsconfig.json
  dockerfile
```

**2) Criar o frontend (Vite + TS)**

```bash
cd apps
npm create vite@latest web -- --template react-ts
cd web
npm i
```

No `.env` do **web**:

```env
VITE_API_URL=/api   # em prod, vamos “colar” no mesmo host
```

Em dev, crie um `vite.config.ts` com proxy:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000" // porta do backend em dev
    }
  }
});
```

**3) Servir o build React no Express**
No `apps/api/src/app.ts` (ou onde monta o Express):

```ts
import path from "node:path";
import express from "express";
const app = express();

// ... suas rotas /api aqui

// static do React
const clientDir = path.join(__dirname, "../../web-dist"); // vamos copiar p/ dist
app.use(express.static(clientDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

export default app;
```

**4) Dockerfile multi-stage único**

```dockerfile
# ========== base de build ==========
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ========== build do web ==========
FROM base AS build-web
WORKDIR /app/apps/web
COPY apps/web/package*.json ./
RUN npm ci
COPY apps/web .
RUN npm run build

# ========== build da api ==========
FROM base AS build-api
WORKDIR /app/apps/api
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api .
RUN npm run build

# ========== runtime ==========
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# node_modules só da api (a web é estática)
COPY --from=build-api /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build-api /app/apps/api/dist ./apps/api/dist
# copia o build estático do web para junto do dist
COPY --from=build-web /app/apps/web/dist ./apps/web-dist

EXPOSE 5000
CMD ["node","apps/api/dist/server.js"]
```

**Pontos bons:**

* Um único container/porta.
* Sem CORS em produção (API e frontend no mesmo host).

**Trade-offs:**

* Se um dia quiser escalar web e API separadamente, fica menos flexível.

---

# Opção B — **Dois containers** (recomendado para crescer)

Um container para a API, outro para o web (servido por Nginx).

**docker-compose.yml**

```yaml
services:
  api:
    build:
      context: .
      dockerfile: ./apps/api/Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=5000
    ports:
      - "5000:5000"
    networks: [appnet]

  web:
    build:
      context: .
      dockerfile: ./apps/web/Dockerfile
    ports:
      - "8080:80"
    depends_on: [api]
    networks: [appnet]

networks:
  appnet: {}
```

**apps/web/Dockerfile** (build com Node, serve com Nginx)

```dockerfile
# build
FROM node:20-alpine AS build
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm ci
COPY apps/web .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# runtime
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**apps/web/nginx.conf**

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback
  location / {
    try_files $uri /index.html;
  }

  # Proxy opcional para a API (facilita “mesmo host”)
  location /api/ {
    proxy_pass http://api:5000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}
```

**apps/api/Dockerfile** (api sozinha)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api .
RUN npm run build && npm prune --production

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 5000
CMD ["node","dist/server.js"]
```

**Como fica em produção:**

* Frontend servido por Nginx na porta 8080.
* API na 5000.
* O Nginx faz **proxy** de `/api` → `api:5000`, então no React você usa `VITE_API_URL=/api`.

**Pontos bons:**

* Escala/observabilidade separados.
* Pode usar CDN/cache no Nginx pro web.

**Trade-offs:**

* Dois containers (compose/infra um tiquinho maior).

---

## Extras que valem ouro

* **Variáveis de ambiente no web**: usar `VITE_API_URL` (build-time). Se precisar **trocar em runtime**, sirva `config.json` e leia no app.
* **CORS**:

  * Opção A (um container): desnecessário em produção.
  * Opção B: habilite CORS na API para o host do web (ou faça proxy pelo Nginx e evite CORS).
* **Healthchecks**:

  * API: `/health` → usado em `HEALTHCHECK` do Docker.
  * Web (Nginx): `location = /health { return 200 'ok'; }`.
* **Shadcn/TanStack**: dá pra plugar já no Vite; mantenha `VITE_API_URL` numa camada de `apiClient` (fetch/axios) e centralize interceptors.

---

## TL;DR

* **Sim**, dá para pôr React junto.
* **Se quer simplicidade**: **Opção A** (um container, Express serve o build).
* **Se pensa em crescer** (escalar/observabilidade): **Opção B** (dois containers com Nginx proxyando `/api`).

