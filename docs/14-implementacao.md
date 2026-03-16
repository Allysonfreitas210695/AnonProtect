# 14 - Implementação

## 14.1 Organização do Código

O projeto segue a estrutura padrão do Next.js (src folder), mas adota convenções de nomenclatura com prefixo underscore (`_`) para pastas privadas que não representam rotas:

- `src/_actions/`: Server Actions segregadas por domínio (Public/Admin).
- `src/_components/`: Biblioteca de componentes reutilizáveis (UI, Layout, Shared).
- `src/_hooks/`: Lógica de UI extraída em hooks customizados para melhor legibilidade.
- `src/_lib/`: Utilitários globais e instâncias de clientes (Prisma, Auth).
- `src/app/`: Definição de rotas e layouts utilizando o sistema de grupos `(admin)` e `(auth)`.

## 14.3 Principais Componentes e Tecnologias

- **AI Analysis Engine**: Integração com Gemini 1.5 Flash para triagem automática.
- **Security Middleware**: Proteção contra bots via Cloudflare Turnstile e DoS via Upstash Redis.
- **Admin Dashboard**: Visualização de dados com Recharts e gerenciamento em massa de denúncias.
- **Transparency Portal**: Página pública para visualização de estatísticas agregadas.
- **System Status Page**: Monitoramento proativo da saúde de todos os serviços externos.
- **Framer Motion**: Micro-interações e transições fluidas para percepção de sistema "premium".
