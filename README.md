# RepassIA API

API RESTful para gerenciamento de carros usados - RepassIA

## 🚀 Tecnologias

- **Node.js** com Express.js
- **PostgreSQL** com Prisma ORM
- **MinIO** para armazenamento de arquivos
- **Nodemailer** para envio de emails
- **JWT** para autenticação web
- **Token fixo** para automações n8n

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- MinIO (ou Docker)

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp env.example.txt .env

# Edite o arquivo .env com suas configurações
# IMPORTANTE: Preencha todas as variáveis obrigatórias antes de iniciar
```

4. Configure o banco de dados:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Inicie o servidor:
```bash
npm run dev
```

## 🐳 Docker

Para desenvolvimento com Docker:

```bash
docker-compose up
```

Isso iniciará:
- PostgreSQL na porta 5432
- MinIO na porta 9000 (API) e 9001 (Console)
- API na porta 8080

## 📚 Endpoints

### Públicos

#### Listar Carros
- `GET /api/v1/cars` - Listar carros com filtros e paginação

**Query Parameters:**
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 20, máximo: 100)
- `brand` - Filtrar por marca (busca parcial, case-insensitive)
- `model` - Filtrar por modelo (busca parcial, case-insensitive)
- `year` - Filtrar por ano exato
- `min_price` - Preço mínimo
- `max_price` - Preço máximo
- `status` - Status do carro (`disponível`, `reservado`, `vendido`)
- `fuel_type` - Tipo de combustível (`gasolina`, `etanol`, `flex`, `diesel`, `elétrico`, `híbrido`)
- `transmission` - Tipo de transmissão (`manual`, `automático`, `automatizado`, `cvt`)
- `sort_by` - Campo para ordenação (`price`, `year`, `createdAt` - padrão: `createdAt`)
- `sort_order` - Ordem (`asc`, `desc` - padrão: `desc`)

**Exemplo:**
```
GET /api/v1/cars?brand=Toyota&min_price=30000&max_price=100000&status=disponível&sort_by=price&sort_order=asc&page=1&limit=20
```

**Resposta:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

- `GET /api/v1/cars/:id` - Detalhes do carro
- `GET /api/v1/cars/:id/images` - Imagens do carro
- `GET /api/v1/images/:filename` - Servir imagem

### Autenticação

- `POST /api/v1/auth/request-code` - Solicitar código por email
- `POST /api/v1/auth/verify-code` - Verificar código e obter JWT
- `POST /api/v1/auth/validate-token` - Validar token fixo

### Admin (Requer autenticação)

- `POST /api/v1/admin/cars` - Criar carro
- `PUT /api/v1/admin/cars/:id` - Atualizar carro
- `PATCH /api/v1/admin/cars/:id/status` - Atualizar status
- `DELETE /api/v1/admin/cars/:id` - Deletar carro
- `POST /api/v1/admin/cars/:id/images` - Upload de imagens
- `DELETE /api/v1/admin/images/:id` - Deletar imagem
- `PUT /api/v1/admin/images/:id/set-primary` - Definir imagem principal
- `PUT /api/v1/admin/images/:id/order` - Atualizar ordem
- `POST /api/v1/admin/cleanup` - Executar limpeza manual

## 🔐 Autenticação

### Acesso Web (JWT)

1. Solicite um código: `POST /api/v1/auth/request-code` com `{email}`
2. Verifique o código: `POST /api/v1/auth/verify-code` com `{email, code}`
3. Use o JWT retornado: `Authorization: Bearer {jwt_token}`

### Automações n8n (Token Fixo)

Use diretamente o token fixo do profile:
```
Authorization: Bearer {fixed_token}
```

### Criar Profile Admin

Para criar um profile admin (necessário para autenticação):

```bash
node scripts/create-admin.js <email> <nome> [fixed_token]
```

**Exemplo:**
```bash
node scripts/create-admin.js admin@exemplo.com "Admin User"
```

O script criará um profile com:
- Email e nome fornecidos
- Token fixo gerado automaticamente (ou você pode fornecer um customizado)
- Profile ativo por padrão

O token fixo será exibido no console e pode ser usado diretamente no header `Authorization: Bearer {fixed_token}` para automações n8n.

## 📝 Variáveis de Ambiente

Veja `env.example.txt` para todas as variáveis necessárias. O arquivo contém:

- **Obrigatórias**: DATABASE_URL, JWT_SECRET, MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, SMTP_HOST, SMTP_USER, SMTP_PASSWORD
- **Opcionais**: Todas as outras têm valores padrão

### Variáveis Obrigatórias

Certifique-se de preencher estas variáveis no arquivo `.env`:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_secreta_super_segura
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
SMTP_HOST=smtp.hostinger.com
SMTP_USER=seu-email@seudominio.com
SMTP_PASSWORD=sua_senha_smtp
```

## 🧪 Testes

```bash
npm test
```

## 📄 Licença

ISC

