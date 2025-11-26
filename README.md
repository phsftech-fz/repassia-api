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
- MinIO

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie o arquivo .env baseado no exemplo
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

## 🚀 Deploy

O projeto está configurado para deploy via Nixpacks (Easypanel). Configure as variáveis de ambiente necessárias e execute o deploy.

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
- `min_year` - Ano mínimo (tem prioridade sobre `year` se especificado)
- `max_year` - Ano máximo (tem prioridade sobre `year` se especificado)
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

#### Formulário

- `GET /api/v1/form/types` - Obter tipos/enums do formulário

**Resposta:**
```json
{
  "success": true,
  "data": {
    "maritalStatus": [
      { "value": "solteiro", "label": "Solteiro" },
      { "value": "casado", "label": "Casado" },
      ...
    ],
    "driverLicenseCategory": [
      { "value": "A", "label": "A - Motocicleta" },
      ...
    ],
    "residenceType": [...],
    "employmentType": [...],
    "states": [
      { "value": "SP", "label": "São Paulo" },
      ...
    ],
    "employmentTypeRequiredFields": {
      "assalariado": ["companyName", "admissionDate", "position", "grossIncome"],
      ...
    },
    "validations": {
      "minAge": 18,
      "phoneLength": { "min": 10, "max": 11 },
      ...
    }
  }
}
```

- `POST /api/v1/form/submit` - Submeter formulário de interesse

**Request Body:**
```json
{
  "personalData": {
    "fullName": "João Silva",
    "email": "joao@example.com",
    "phone": "11987654321",
    "cpf": "12345678901",
    "birthDate": "1990-01-15",
    "motherName": "Maria Silva",
    "birthCity": "São Paulo",
    "birthState": "SP",
    "maritalStatus": "solteiro",
    "hasDriverLicense": true,
    "driverLicenseCategory": "B"
  },
  "residentialData": {
    "zipCode": "01310100",
    "street": "Avenida Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP"
  },
  "professionalData": {
    "employmentType": "assalariado",
    "companyName": "Empresa XYZ",
    "admissionDate": "2020-01-01",
    "grossIncome": 5000.00,
    "position": "Desenvolvedor"
  },
  "interest": {  // Opcional - pode ser omitido completamente
    "carId": "uuid-do-carro",  // Opcional - pode ser null ou omitido
    "message": "Tenho interesse neste veículo"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-da-submissao",
    "whatsappLink": "https://chat.whatsapp.com/XXXXXXXX",
    "message": "Obrigado pelo interesse! Clique no link para entrar no grupo do WhatsApp."
  }
}
```

### Autenticação

- `POST /api/v1/auth/request-code` - Solicitar código por email
- `POST /api/v1/auth/verify-code` - Verificar código e obter JWT e refresh token
- `POST /api/v1/auth/refresh` - Renovar access token usando refresh token
- `POST /api/v1/auth/revoke` - Revogar refresh token
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
- `GET /api/v1/admin/form-submissions` - Listar submissões de formulário
- `GET /api/v1/admin/form-submissions/:id` - Detalhes de uma submissão

## 🔐 Autenticação

### Acesso Web (JWT)

1. Solicite um código: `POST /api/v1/auth/request-code` com `{email}`
2. Verifique o código: `POST /api/v1/auth/verify-code` com `{email, code}`
3. Use o `accessToken` retornado: `Authorization: Bearer {accessToken}`
4. Quando o `accessToken` expirar, use `POST /api/v1/auth/refresh` com `{refreshToken}` para obter um novo `accessToken`

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

### Variáveis Obrigatórias

Certifique-se de preencher estas variáveis no arquivo `.env`:

```env
NODE_ENV=development
DATABASE_URL=postgresql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_secreta_super_segura
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
API_BASE_URL=http://localhost:8080
```

### Variáveis Opcionais

- **SMTP**: Para envio de emails (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)
- **CORS**: ALLOWED_ORIGINS (padrão: http://localhost:3000)
- **Rate Limiting**: FORM_RATE_LIMIT_WINDOW, FORM_RATE_LIMIT_MAX
- **Refresh Token**: REFRESH_TOKEN_EXPIRATION (padrão: 7d)
- **JWT**: JWT_EXPIRATION (padrão: 15m)
- **Prisma Log**: PRISMA_LOG_LEVEL (padrão: warn em dev, error em produção)

## 📄 Licença

ISC

