---
phase: 02-security-hardening
plan: '01'
subsystem: auth
tags: [security, middleware, oauth, registration-block]
dependency_graph:
  requires: []
  provides: [SEC-01]
  affects: [proxy.ts, auth.ts, register.action.ts, login-client.tsx, use-register.ts]
tech_stack:
  added: []
  patterns: [ActionError, signIn-callback, middleware-redirect]
key_files:
  modified:
    - src/proxy.ts
    - src/_shared/lib/auth.ts
    - src/_actions/public/register.action.ts
    - src/_actions/public/register.action.test.ts
    - src/_hooks/public/use-register.ts
    - src/app/[locale]/(auth)/login/login-client.tsx
decisions:
  - 'Defense-in-depth em 4 camadas: middleware redirect, action desabilitada, signIn callback, remoção de UI'
  - 'use-register.ts simplificado (router.push removido) pois action nunca retorna sucesso'
metrics:
  duration: '25 minutos'
  completed: '2026-06-30T18:09:53Z'
---

# Phase 02 Plan 01: Bloquear Criação Pública de Contas (SEC-01) Summary

Defense-in-depth em 4 camadas: middleware redireciona /register, action lança ActionError, signIn callback bloqueia Google OAuth com email não cadastrado, link de registro removido da UI de login.

## Tasks Completed

| Task | Description                                                                 | Commit  |
| ---- | --------------------------------------------------------------------------- | ------- |
| 1    | Bloquear /register no middleware e desabilitar register action (D-01, D-02) | 142993d |
| 2    | Bloquear Google OAuth auto-criação e remover link de registro (D-03, D-04)  | 6033beb |

## What Was Built

**SEC-01 satisfeito** — nenhuma conta pode ser criada publicamente:

- **proxy.ts (D-01):** Novo bloco de redirect antes de `isPublicRoute` — qualquer acesso a `/register` (com ou sem locale prefix) é redirecionado para `/${locale}/login`. A rota foi removida da lista `isPublicRoute` e do bloco `isLogged && isPublicRoute`.

- **register.action.ts (D-02):** Corpo da action substituído por `throw new ActionError('Registro desabilitado')`. Defense-in-depth contra POST direto ignorando o middleware. Imports de `prisma`, `bcryptjs` e `hash` removidos — action não cria mais usuários.

- **auth.ts (D-04):** Callback `signIn` adicionado antes de `session`. Quando o provider é `google`, verifica `prisma.user.findUnique` por email — se o usuário não existir, retorna `false`, bloqueando a auto-criação de conta OAuth.

- **login-client.tsx (D-03):** Elemento `<Link href="/register">` e o `<div>` "Não tem conta?" removidos completamente. Nenhum texto alternativo adicionado.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript error em use-register.ts após desabilitar action**

- **Found during:** Task 2 (npm run build)
- **Issue:** `use-register.ts` referenciava `data?.success` e `data?.error` no `onSuccess` handler; como a action agora sempre lança (nunca retorna), o tipo inferido é `never`, causando erro de tipo.
- **Fix:** Hook simplificado — removido `onSuccess` (nunca dispara), mantido apenas `onError` que exibe o `serverError`. Também removido `router.push('/login')` (desnecessário pois a rota é bloqueada no middleware).
- **Files modified:** `src/_hooks/public/use-register.ts`
- **Commit:** 6033beb

## Pre-existing Issues (Out of Scope)

- `report.query.test.ts > getPublicStats > timeline length`: Falha `expected 12 but got 11` — pré-existente, não relacionada a esta fase. Nenhum arquivo de report.query.ts foi modificado.

## Verification Results

- `npx vitest run src/_actions/public/register.action.test.ts`: PASSED (1/1)
- `npm run build` TypeScript: PASSED (compiled successfully in 24s)
- `npm test` suite completa: 128/129 passed (falha pré-existente em report.query.test.ts)
- Acceptance criteria proxy.ts: `startsWith('/register')` aparece somente no novo bloco de redirect
- Acceptance criteria auth.ts: `async signIn` e `provider === 'google'` presentes
- Acceptance criteria login-client.tsx: `href="/register"` count = 0

## Known Stubs

Nenhum — todas as mudanças são bloqueios definitivos, sem placeholders.

## Threat Flags

Nenhuma nova superfície de segurança introduzida. As mudanças reduzem a superfície (remoção de endpoint de criação de conta, bloqueio de OAuth auto-criação).

## Self-Check: PASSED

- [x] src/proxy.ts modificado com redirect /register
- [x] src/\_actions/public/register.action.ts sem `role: 'SUPERVISOR'` nem `prisma.user.create`
- [x] src/\_shared/lib/auth.ts com signIn callback
- [x] src/app/[locale]/(auth)/login/login-client.tsx sem href="/register"
- [x] Commits 142993d e 6033beb existem no histórico
