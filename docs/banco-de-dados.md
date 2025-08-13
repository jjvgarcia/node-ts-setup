Boa! Hoje ele não acessa DB nenhum — é só um servidor HTTP. Dá pra integrar **Prisma** fácil e, se quiser, manter tudo “plugável” (ex.: Postgres em prod e SQLite nos testes).

Abaixo vai um passo-a-passo direto pra acoplar Prisma no teu boilerplate.

# Passo 0 — Dependências

```bash
# com npm (troque por pnpm/yarn se preferir)
npm i prisma @prisma/client
npx prisma init
```

Isso cria `prisma/schema.prisma` e `.env`.

No `.env`, coloque (exemplo Postgres):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/minha_base?schema=public"
```

Se quiser subir um Postgres rápido:

```yaml
# docker-compose.yml (opcional)
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: minha_base
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes: { pgdata: {} }
```

# Passo 1 — Defina o schema

`prisma/schema.prisma` (exemplo simples de `User` e `Note`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // pode usar "sqlite" ou "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  notes     Note[]
}

model Note {
  id        String   @id @default(cuid())
  title     String
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Crie e aplique a migration:

```bash
npx prisma migrate dev --name init
```

# Passo 2 — Client Prisma singleton

`src/config/prisma.ts`

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  // evita criar múltiplas instâncias em dev (hot-reload)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
```

No `server.ts`, feche no shutdown:

```ts
import { prisma } from "@/config/prisma";
// ...
const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

# Passo 3 — Rotas + validação

Exemplo com `zod` e Express:

`src/http/validators/user.ts`

```ts
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

`src/http/controllers/user.controller.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/prisma";
import { CreateUserSchema } from "@/http/validators/user";

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = CreateUserSchema.parse(req.body);
    const user = await prisma.user.create({ data });
    res.status(201).json({ data: user });
  } catch (err) { next(err); }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ data: users });
  } catch (err) { next(err); }
}
```

`src/http/routes/user.routes.ts`

```ts
import { Router } from "express";
import { createUser, listUsers } from "@/http/controllers/user.controller";

const router = Router();
router.get("/", listUsers);
router.post("/", createUser);
export default router;
```

`src/app.ts` (onde você já monta as rotas)

```ts
import userRoutes from "@/http/routes/user.routes";
app.use("/api/v1/users", userRoutes);
```

# Passo 4 — Scripts úteis

No `package.json`:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

# Passo 5 — Seeds (opcional)

`prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const juan = await prisma.user.upsert({
    where: { email: "juan@example.com" },
    update: {},
    create: { name: "Juan", email: "juan@example.com" },
  });

  await prisma.note.create({
    data: { title: "Oi 👋", content: "Primeira nota", userId: juan.id },
  });
}
main().finally(() => prisma.$disconnect());
```

No `package.json`:

```json
{ "prisma": { "seed": "tsx prisma/seed.ts" } }
```

Roda com:

```bash
npx prisma db seed
```

# Passo 6 — Testes com DB

Para testes rápidos, use **SQLite** isolado:

* Em `.env.test`:

  ```env
  DATABASE_URL="file:./test.db?connection_limit=1"
  ```
* No `vitest`/Jest, rode `prisma migrate deploy` antes e apague o arquivo após os testes.
* Alternativa: `postgres` em container por workflow de CI.

# Boas práticas com Prisma

* **Transactions**: `prisma.$transaction()` em fluxos multi-passo.
* **Select/Include**: evite retornar tudo; selecione só o que precisa.
* **Índices**: defina no schema (`@@index`, `@unique`) para consultas críticas.
* **Paginação**: `take/skip` ou “cursor-based” (`cursor`, `take`, `skip`).
* **Camadas**: se quiser separar, crie `repositories` chamando Prisma e `services` com regra de negócio (facilita mocks em testes unitários).

---



