# Node.js TypeScript API

Uma API RESTful robusta e escalável construída com Node.js, Express e TypeScript, seguindo as melhores práticas de desenvolvimento.

## 🚀 Características

- **TypeScript**: Tipagem estática para maior segurança e produtividade
- **Express.js**: Framework web rápido e minimalista
- **Arquitetura Modular**: Estrutura organizada seguindo Clean Architecture
- **Validação com Zod**: Validação robusta de schemas e variáveis de ambiente
- **Logging Estruturado**: Sistema de “logs” JSON com Pino
- **Segurança Avançada**: CORS, Helmet, Rate Limiting, proteção contra injeções
- **Documentação API**: OpenAPI/Swagger automático
- **Testes Modernos**: Vitest com cobertura de código
- **Docker**: Containerização com multi-stage builds
- **CI/CD**: GitHub Actions com testes e segurança
- **Graceful Shutdown**: Encerramento gracioso do servidor
- **Hot Reload**: Desenvolvimento com tsx para recarregar rápido
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Migrations**: Sistema de migração automática do banco
- **Seeds**: Dados iniciais para desenvolvimento

## 📁 Estrutura do Projeto

```
src/
├── application/         # Camada de aplicação
│   ├── use-cases/      # Casos de uso
│   └── dtos/           # Data Transfer Objects
├── domain/             # Camada de domínio
│   ├── entities/       # Entidades de negócio
│   └── repositories/   # Interfaces de repositórios
├── infrastructure/     # Camada de infraestrutura
│   ├── database/       # Repositórios Prisma
│   └── external/       # Serviços externos
├── presentation/       # Camada de apresentação
│   └── validators/     # Schemas de validação Zod
├── config/            # Configurações da aplicação
│   ├── env.ts         # Validação de variáveis de ambiente
│   ├── logger.ts      # Configuração do Pino
│   └── swagger.ts     # Configuração OpenAPI
├── controllers/       # Controllers da API
├── middlewares/       # Middlewares customizados
├── routes/           # Definição das rotas
├── services/         # Lógica de negócio
├── types/            # Tipos TypeScript customizados
├── utils/            # Utilitários e helpers
├── app.ts            # Configuração da aplicação Express
└── server.ts         # Ponto de entrada da aplicação

prisma/
├── schema.prisma     # Schema do banco de dados
├── seed.ts          # Dados iniciais
└── migrations/      # Histórico de migrações
```

## 🛠️ Instalação

1. Clone o repositório:

```bash
git clone <repository-url>
cd node-ts-setup
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com as suas configurações:

```env
PORT=5000
NODE_ENV=development
API_VERSION=v1
API_PREFIX=/api
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/node_ts_api?schema=public
```

5. Configure o banco de dados:

```bash
# Iniciar PostgreSQL com Docker
docker compose up -d db

# Executar migrações
npm run db:migrate

# Popular com dados iniciais
npm run db:seed
```

## 🚀 Uso

### Desenvolvimento

```bash
# Desenvolvimento com hot reload
npm run dev

# Desenvolvimento com Docker
docker-compose -f docker-compose.dev.yml up
```

### Produção

```bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start

# Produção com Docker
docker-compose up -d
```

### Testes

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage

# Verificação de tipos
npm run typecheck
```

### Linting e Formatação

```bash
# Executar ESLint
npm run lint

# Formatar código com Prettier
npx prettier --write .
```

## 📡 Endpoints da API

### Documentação

- `GET /api-docs` - Interface Swagger UI (apenas em desenvolvimento)
- `GET /api-docs.json` - Especificação OpenAPI em JSON

### Health Check

- `GET /health` - Status detalhado da aplicação
- `GET /ping` - Verificação simples de conectividade

### API Info

- `GET /api/v1` - Informações da API

### Usuários

- `GET /api/v1/users` - Listar usuários (com paginação)
- `GET /api/v1/users/:id` - Obter usuário por "ID"
- `POST /api/v1/users` - Criar usuário
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Remover usuário

### Notas

- `GET /api/v1/notes` - Listar todas as notas (com paginação)
- `GET /api/v1/notes/:id` - Obter nota por ID
- `POST /api/v1/notes` - Criar nota
- `PUT /api/v1/notes/:id` - Atualizar nota
- `DELETE /api/v1/notes/:id` - Remover nota
- `GET /users/:userId/notes` - Listar notas de um usuário específico

## 🔧 Configuração

### Variáveis de Ambiente

| Variável                  | Descrição                          | Padrão                  |
|---------------------------|------------------------------------|-------------------------|
| `PORT`                    | Porta do servidor                  | `5000`                  |
| `NODE_ENV`                | Ambiente de execução               | `development`           |
| `API_VERSION`             | Versão da API                      | `v1`                    |
| `API_PREFIX`              | Prefixo das rotas da API           | `/api`                  |
| `JWT_SECRET`              | Chave secreta para JWT             | -                       |
| `CORS_ORIGIN`             | Origens permitidas para CORS       | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS`    | Janela de tempo para rate limiting | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por janela      | `100`                   |
| `LOG_LEVEL`               | Nível de log                       | `info`                  |
| `DATABASE_URL`            | URL de conexão com PostgreSQL      | -                       |

## 🏗️ Arquitetura

### Controllers

Os controllers são responsáveis por receber as requisições HTTP, processar os dados e retornar as respostas. Todos herdam de `BaseController` que fornece métodos utilitários para respostas padronizadas.

### Middlewares

- **Security**: CORS, Helmet, Rate Limiting
- **Logging**: Request ID, Response Time, HTTP Logger
- **Error Handling**: Tratamento global de erros

### Routes

Sistema de roteamento modular que organiza as rotas por funcionalidade.

### Types

“Interfaces” e tipos TypeScript customizados para garantir tipagem consistente em toda a aplicação.

## 🧪 Testes

O projeto está configurado com Vitest para testes unitários modernos e rápidos.

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 🐳 Docker

### Desenvolvimento

```bash
# Construir e executar em modo desenvolvimento
docker-compose -f docker-compose.dev.yml up --build

# Parar containers
docker-compose -f docker-compose.dev.yml down
```

### Produção

```bash
# Construir e executar em modo produção
docker-compose up --build -d

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

### Build Manual

```bash
# Build da imagem
docker build -t node-ts-api .

# Executar container
docker run -p 5000:5000 --env-file .env node-ts-api
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload (tsx)
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor em modo produção
- `npm test` - Executa os testes com Vitest
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Executa os testes com cobertura de código
- `npm run typecheck` - Verifica tipos TypeScript sem compilar
- `npm run lint` - Executa ESLint para verificar qualidade do código
- `npm run db:migrate` - Executa migrações do banco de dados
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:studio` - Abre o Prisma Studio (interface visual)
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:reset` - Reseta o banco de dados

## 🔧 Tecnologias e Ferramentas

### Core

- **Node.js 20+** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express.js** - Framework web minimalista

### Banco de Dados

- **PostgreSQL** - Banco de dados relacional robusto
- **Prisma** - ORM moderno e type-safe
- **SQLite** - Banco para testes (isolamento)

### Validação e Segurança

- **Zod** - Validação de schemas TypeScript-first
- **Helmet** - Headers de segurança
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Limitação de taxa de requisições

### Logging e Monitoramento

- **Pino** - Logger JSON estruturado e performático
- **Morgan** - Logger HTTP middleware

### Testes e Qualidade

- **Vitest** - Framework de testes rápido
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formatador de código

### Documentação

- **Swagger/OpenAPI** - Documentação automática da API
- **JSDoc** - Documentação inline do código

### DevOps

- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **tsx** - Execução TypeScript para desenvolvimento

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
