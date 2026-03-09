# Guia de Contribuição e Padrões

Para manter a qualidade e a padronização sênior do código, siga estas diretrizes.

## Padrões de Código

### 1. TypeScript Strict

- Evite o uso de `any`.
- Utilize interfaces e tipos exportados de `@/_schemas/` ou gerados pelo Prisma.

### 2. Server Actions Primeiro

- Priorize Server Actions em vez de Web APIs (`/api/*`) para operações que não requerem acesso externo.
- Use `authActionClient` para ações administrativas.

### 3. Validação Centralizada

- Nunca defina um schema Zod dentro de um componente. Defina-o em `src/_schemas/` e importe-o no hook e na action.

### 4. Estilização

- Use classes Tailwind.
- Siga as variáveis de cores definidas em `src/app/globals.css`.

## Comandos Úteis

- `npm run dev`: Inicia ambiente de desenvolvimento.
- `npx prisma generate`: Gera o cliente Prisma (necessário após mudanças no schema).
- `npx prisma db push`: Sincroniza o banco local com o schema.
- `npm run build`: Valida tipos e gera build de produção.

## Git Hooks

O projeto utiliza **Husky** para garantir que o código esteja formatado e sem erros de lint antes de cada commit.
