# Guia: Prisma na aplicação

Este guia mostra, de forma prática, como usar o Prisma neste projeto.
Ele complementa `docs/banco-de-dados.md` com passos focados no que já está configurado aqui.

## O que já existe no projeto

- `src/config/prisma.ts`: singleton do `PrismaClient` com logs por ambiente.
- `prisma/schema.prisma`: models `User` e `Note`. Hoje o `provider` está como `sqlite`.
- `prisma/seed.ts`: script de seed criando usuários e notas.
- `package.json` (scripts):
  - `db:migrate`, `db:generate`, `db:studio`, `db:seed`, `db:reset`, `db:deploy`.
  - Campo `prisma.seed` aponta para `tsx prisma/seed.ts`.
- Variáveis de ambiente:
  - `.env.example`: `DATABASE_URL` de Postgres (ex.: docker-compose).
  - `.env.test`: `DATABASE_URL` de SQLite (arquivo local).
- `docker-compose.yml`: serviço `db` com Postgres 16 já pronto.

> Importante: O `provider` do `schema.prisma` deve ser compatível com o `DATABASE_URL`.
> Se usar Postgres, troque o `provider` para `postgresql`.

---

## 1) Configurar o ambiente

- Crie `.env` a partir de `.env.example` e ajuste `DATABASE_URL` conforme o banco desejado.

Exemplo Postgres (compatível com `docker-compose.yml`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/node_ts_api?schema=public"
```

Exemplo SQLite local:
```env
DATABASE_URL="file:./dev.db"
```

Para testes, `.env.test` já usa SQLite: `file:./test.db`.

---

## 2) Escolher o banco (SQLite vs Postgres)

- SQLite (mais simples/local): mantenha em `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
- Postgres (dev/prod): altere para:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Depois da escolha/alteração:
- Gere o client: `npm run db:generate`
- Crie/aplique migrations (dev): `npm run db:migrate`

> Migrando de SQLite para Postgres? Use `npm run db:reset` (DROPA e recria o banco) após ajustar `provider` e `DATABASE_URL`.
> Em produção, use `npm run db:deploy` (não cria novas migrations; apenas aplica as existentes).

---

## 3) Criar e aplicar migrations

- Desenvolvimento (cria e aplica):
```bash
npm run db:migrate # interativo; pedirá um nome quando houver mudanças
```
- Produção/CI (aplica existentes):
```bash
npm run db:deploy
```

Abra o Prisma Studio para inspecionar dados:
```bash
npm run db:studio
```

---

## 4) Popular dados (seed)

O projeto já traz `prisma/seed.ts`. Para rodar:
```bash
npm run db:seed
```

Edite `prisma/seed.ts` conforme necessário. O client se desconecta ao final.

---

## 5) Usar o Prisma no código

Use sempre o singleton de `src/config/prisma.ts`:

```ts
import { prisma } from "@config/prisma";

// Listar usuários
const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

// Criar usuário
const user = await prisma.user.create({
  data: { name: "Alice", email: "alice@example.com" },
});
```

Recomendação: no shutdown do servidor, desconecte o client (exemplo):
```ts
import { prisma } from "@config/prisma";

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
```

Transações quando houver várias operações dependentes:
```ts
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { name: "Bob", email: "bob@example.com" } });
  await tx.note.create({ data: { title: "Primeira", content: "...", userId: user.id } });
});
```

---

## 6) Testes com banco

- `.env.test` já aponta para SQLite (`file:./test.db`).
- Execute as migrations antes dos testes (ex.: etapa de setup do Vitest/Jest):
```bash
npm run db:deploy -- --schema prisma/schema.prisma
```
- Apague o arquivo `test.db` ao terminar, se quiser estado limpo a cada execução.

> Alternativa em CI: subir Postgres via container e apontar `DATABASE_URL` de teste para ele.

---

## 7) Fluxo sugerido (dev)

1. Defina `DATABASE_URL` no `.env` (SQLite ou Postgres).
2. Ajuste o `provider` no `prisma/schema.prisma` para combinar com o banco.
3. `npm run db:generate`
4. `npm run db:migrate`
5. (Opcional) `npm run db:seed`
6. Execute a API: `npm run dev`

---

## 8) Boas práticas

- Evite múltiplas instâncias do client (o singleton em `src/config/prisma.ts` já cuida disso em modo dev com hot-reload).
- Use `select`/`include` para trafegar só o necessário.
- Modele índices/uniques no schema (`@@index`, `@unique`).
- Padronize paginação (`take/skip` ou cursor) para listas grandes.
- Separe camadas (controllers → services → repositories/Prisma) quando a regra de negócio crescer.

---

## 9) Erros comuns

- “Error validating datasource … provider … not compatible with the URL”: `provider` do schema não bate com o `DATABASE_URL`.
- “P1001: Can’t reach database server”: verifique se o Postgres do `docker-compose` está de pé e portas/credenciais corretas.
- “Query engine library not found”: rode `npm run db:generate` após instalar dependências ou mudar de ambiente/arquitetura.

---

## Referências

- Prisma Docs: https://www.prisma.io/docs
- Studio: https://www.prisma.io/studio
- Migrate: https://www.prisma.io/docs/orm/prisma-migrate
