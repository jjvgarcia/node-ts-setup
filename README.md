# Node.js TypeScript API

Uma API RESTful robusta e escalável construída com Node.js, Express e TypeScript, seguindo as melhores práticas de desenvolvimento.

## 🚀 Características

- **TypeScript**: Tipagem estática para maior segurança e produtividade
- **Express.js**: Framework web rápido e minimalista
- **Arquitetura Modular**: Estrutura organizada com controllers, routes, middlewares e services
- **Segurança**: Implementação de CORS, Helmet, Rate Limiting e headers de segurança
- **Logging**: Sistema de logs estruturado com Morgan
- **Tratamento de Erros**: Middleware global para tratamento de erros
- **Validação**: Utilitários para validação de dados
- **Configuração**: Sistema de configuração com variáveis de ambiente
- **Testes**: Configuração com Jest para testes unitários
- **Compressão**: Middleware de compressão para otimização de performance

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações da aplicação
├── controllers/      # Controllers da API
├── middlewares/      # Middlewares customizados
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
├── types/           # Tipos TypeScript customizados
├── utils/           # Utilitários e helpers
├── app.ts           # Configuração da aplicação Express
└── server.ts        # Ponto de entrada da aplicação
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

4. Edite o arquivo `.env` com suas configurações:
```env
PORT=5000
NODE_ENV=development
API_VERSION=v1
API_PREFIX=/api
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start
```

### Testes
```bash
npm test
```

## 📡 Endpoints da API

### Health Check
- `GET /health` - Status detalhado da aplicação
- `GET /ping` - Verificação simples de conectividade

### API Info
- `GET /api/v1` - Informações da API

### Usuários (Exemplo)
- `GET /api/v1/users` - Listar usuários (com paginação)
- `GET /api/v1/users/:id` - Obter usuário por ID
- `POST /api/v1/users` - Criar novo usuário
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Deletar usuário

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `5000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `API_VERSION` | Versão da API | `v1` |
| `API_PREFIX` | Prefixo das rotas da API | `/api` |
| `JWT_SECRET` | Chave secreta para JWT | - |
| `CORS_ORIGIN` | Origens permitidas para CORS | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Janela de tempo para rate limiting | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por janela | `100` |
| `LOG_LEVEL` | Nível de log | `info` |

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
Interfaces e tipos TypeScript customizados para garantir tipagem consistente em toda a aplicação.

## 🧪 Testes

O projeto está configurado com Jest para testes unitários. Os testes devem ser colocados no diretório `__tests__/`.

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor em modo produção
- `npm test` - Executa os testes

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
