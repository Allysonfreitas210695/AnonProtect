# 🛡️ AnonProtect - Sistema de Denúncias Anônimas

Plataforma de alta performance para submissão e gestão de denúncias sob absoluto anonimato, integrada com Inteligência Artificial para triagem automática.

## 🔗 Atalhos do Sistema (URLs)

### 🌍 Área Pública

- **Página Inicial**: `http://localhost:3000/pt-BR`
- **Nova Denúncia**: `http://localhost:3000/pt-BR/report/new` (Protegida por Turnstile)
- **Acompanhar Denúncia**: `http://localhost:3000/pt-BR/report/track`
- **Portal da Transparência**: `http://localhost:3000/pt-BR/transparency` (Gráficos públicos)

### 🔐 Área Administrativa (Login necessário)

- **Dashboard Principal**: `http://localhost:3000/pt-BR/admin/dashboard`
- **Lista de Denúncias**: `http://localhost:3000/pt-BR/admin/report` (Ações em massa)
- **Status do Sistema**: `http://localhost:3000/pt-BR/admin/status` (Monitoramento de APIs)

---

## ⚙️ Configuração das Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto e preencha os seguintes campos:

### 1. Banco de Dados e Segurança

```env
# URL do Neon.tech ou PostgreSQL local
DATABASE_URL="sua_url_aqui"

# Chave para criptografia de cookies do Auth.js
# Gere uma com: openssl rand -base64 32
AUTH_SECRET="sua_chave_secreta"
AUTH_URL="http://localhost:3000"
```

### 2. Autenticação Social (Google Cloud)

```env
GOOGLE_CLIENT_ID="seu_id_no_google_cloud"
GOOGLE_CLIENT_SECRET="sua_secret_no_google_cloud"
```

### 3. Inteligência Artificial (Gemini)

```env
# Pegue em: https://aistudio.google.com/
GOOGLE_GENERATIVE_AI_API_KEY="sua_chave_gemini"
```

### 4. Proteção contra Bots (Cloudflare Turnstile)

```env
# Pegue em: https://dash.cloudflare.com/
NEXT_PUBLIC_TURNSTILE_SITE_KEY="sua_site_key_aqui"
TURNSTILE_SECRET_KEY="sua_secret_key_aqui"
```

### 5. Escalabilidade e Rate Limit (Upstash Redis)

```env
# Pegue em: https://console.upstash.com/
UPSTASH_REDIS_REST_URL="sua_url_redis_aqui"
UPSTASH_REDIS_REST_TOKEN="seu_token_redis_aqui"
```

### 6. Armazenamento e E-mail (AWS)

```env
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="sua_key_id"
AWS_SECRET_ACCESS_KEY="sua_secret"
AWS_S3_BUCKET="nome-do-seu-bucket"
AWS_SES_FROM_EMAIL="seu-email-verificado"
```

---

## 🚀 Como Iniciar

1. `npm install`
2. `npx prisma generate`
3. `npx prisma migrate dev`
4. `npm run dev`

---

## 🛠️ Credenciais Padrão (Seed)

- **Admin**: `admin@sistema.com` / `admin123`
- **Supervisor**: `supervisor@sistema.com` / `super123`

---

## 🌟 Diferenciais Técnicos

- **Triagem por IA**: Classificação automática de denúncias via Gemini AI.
- **Segurança Blindada**: Rate limiting por IP e proteção contra bots automática.
- **Design Premium**: Interface totalmente responsiva com suporte nativo a Dark Mode e animações Framer Motion.
- **Monitoramento**: Página de status para verificar se os serviços de terceiros estão online.
