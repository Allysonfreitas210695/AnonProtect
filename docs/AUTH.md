# Sistema de Autenticação (NextAuth.js v5)

Foi implementada a versão mais recente do **NextAuth.js (Auth.js v5)** para gerenciar a segurança da área administrativa.

## Fluxo de Autenticação

1. **Providers**: Credenciais (Email/Senha).
2. **Segurança**: Senhas criptografadas com `bcryptjs`.
3. **Sessão**: Estratégia **JWT** para compatibilidade com Edge e Middleware.
4. **Roles**: O sistema diferencia `ADMIN` (acesso total) e `SUPERVISOR` (atendimento e notas).

## Configuração Centralizada (`src/auth.ts`)

O arquivo `src/auth.ts` exporta os métodos `signIn`, `signOut` e o objeto `auth` para uso em Server Components.

### Proteção de Rotas (`middleware.ts`)

O middleware atua em nível de proxy, interceptando requisições para `/admin/*` e redirecionando usuários não autenticados para `/login`.

## Persistência de Sessão

Utilizamos o `@auth/prisma-adapter` para persistir contas, sessões e tokens de verificação no banco de dados, caso futuramente seja necessário migrar para sessões em banco (Database Sessions).
