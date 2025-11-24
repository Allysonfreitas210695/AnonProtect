# Sistema de Denúncias Anônimas

Sistema completo de denúncias anônimas com autenticação, dashboard administrativo e gerenciamento de categorias.

## 🚀 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via Prisma ORM v6
- **Autenticação**: bcryptjs
- **UI**: Tailwind CSS + Shadcn UI
- **Forms**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Notificações**: Sonner

## 📁 Estrutura do Projeto

```
├── app/                    # Rotas Next.js
│   ├── admin/             # Área administrativa
│   ├── login/             # Autenticação
│   └── report/            # Área pública
├── components/            # Componentes React
│   ├── ui/               # Shadcn components
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── shared/           # Shared components
├── lib/                   # Utilitários e lógica
│   ├── actions/          # Server actions
│   ├── schemas/          # Zod schemas
│   ├── types/            # TypeScript types
│   └── utils/            # Utilities
└── prisma/               # Database schema e seed
```

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npx prisma db push

# Popular com dados de exemplo
npx tsx prisma/seed.ts

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🔐 Credenciais de Teste

```
Admin:
  Email: admin@sistema.com
  Senha: admin123

Supervisor:
  Email: supervisor@sistema.com
  Senha: super123
```

## 📝 Funcionalidades

### Área Pública
- ✅ Submissão anônima de denúncias
- ✅ Rastreamento por código
- ✅ Chat anônimo com administração
- ✅ Categorias dinâmicas

### Área Administrativa
- ✅ Dashboard com gráficos
- ✅ Gerenciamento de denúncias
- ✅ Atualização de status
- ✅ Chat com denunciantes
- ✅ Gerenciamento de categorias
- ✅ Controle de acesso (Admin/Supervisor)

## 🏗️ Arquitetura

### Server Actions
Todas as ações do servidor estão centralizadas em `lib/actions/`:
- `reports.ts` - Criar e atualizar denúncias
- `messages.ts` - Enviar mensagens
- `categories.ts` - Gerenciar categorias

### Schemas
Validação com Zod em `lib/schemas/`:
- `report.ts` - Validação de denúncias
- `auth.ts` - Validação de autenticação
- `category.ts` - Validação de categorias

### Componentes Reutilizáveis
- `MessageList` - Lista de mensagens (user/admin)
- `ReportCard` - Card de denúncia
- `StatusChart` - Gráfico de status
- `CategoryChart` - Gráfico de categorias

## 🧪 Testes

```bash
# Testar criação de denúncia
curl -X POST http://localhost:3000/report/new

# Testar login
curl -X POST http://localhost:3000/login
```

## 📊 Dashboard

O dashboard administrativo inclui:
- Cards de estatísticas (Total, Pendentes, Em Análise, Resolvidas)
- Gráfico de pizza (distribuição por status)
- Gráfico de barras (denúncias por categoria)
- Gráfico de linha (timeline dos últimos 30 dias)

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- Cookies HTTP-only
- Validação de dados com Zod
- Proteção de rotas admin
- Sanitização de inputs

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Variáveis de Ambiente

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="production"
```

## 📚 Documentação

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Recharts](https://recharts.org)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

Desenvolvido como TCC - Sistema de Denúncias Anônimas

## 🙏 Agradecimentos

- Shadcn UI pela biblioteca de componentes
- Vercel pelo Next.js
- Prisma pela ORM
