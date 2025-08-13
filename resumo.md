# Node.js TypeScript API

API RESTful moderna com Node.js, Express, TypeScript, PostgreSQL e Prisma ORM.

## Características Principais

- **TypeScript** com validação Zod
- **PostgreSQL** com Prisma ORM
- **Documentação** automática com Swagger
- **Testes** com Vitest
- **Docker** para desenvolvimento e produção
- **CI/CD** com GitHub Actions
- **Logs estruturados** com Pino
- **Segurança** avançada integrada

## Comandos Essenciais

### Instalação e Configuração

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Configurar banco de dados
docker-compose up -d db
npm run db:migrate
npm run db:seed
```

### Desenvolvimento

```bash
# Executar em desenvolvimento
npm run dev

# Prisma Studio (interface visual do banco)
npm run db:studio
```

### Testes

```bash
# Executar testes
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Produção

```bash
# Build para produção
npm run build

# Iniciar em produção
npm start
```

### Docker

```bash
# Docker (desenvolvimento)
docker-compose -f docker-compose.dev.yml up

# Docker (produção)
docker-compose up -d
```

## Endpoints Principais

- **API**: `http://localhost:5000/api/v1`
- **Docs**: `http://localhost:5000/api-docs`
- **Health**: `http://localhost:5000/health`

### Usuários

- `GET /api/v1/users` - Listar usuários
- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users/:id` - Obter usuário
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Deletar usuário

### Notas

- `GET /api/v1/notes` - Listar notas
- `POST /api/v1/notes` - Criar nota
- `GET /api/v1/notes/:id` - Obter nota
- `PUT /api/v1/notes/:id` - Atualizar nota
- `DELETE /api/v1/notes/:id` - Deletar nota

## Banco de Dados

- **PostgreSQL** para produção
- **SQLite** para testes
- **Prisma** como ORM
- **Migrações** automáticas
- **Seeds** para dados iniciais
