---
phase: 02-security-hardening
plan: '02'
subsystem: server-actions-public
tags: [security, turnstile, rate-limit, idor, ownership, sec-02, sec-05, sec-06]
dependency_graph:
  requires: []
  provides: [turnstile-fail-closed, ip-normalization, message-ownership-check]
  affects: [src/_actions/public/report.action.ts, src/_actions/public/message.action.ts]
tech_stack:
  added: []
  patterns: [ActionError-ownership, fail-closed-guard, ip-normalization]
key_files:
  created: []
  modified:
    - src/_actions/public/report.action.ts
    - src/_actions/public/message.action.ts
    - src/_actions/public/message.action.test.ts
decisions:
  - "Usar mensagem genérica 'Acesso negado' para mismatch e report inexistente (evita information leakage T-02-08)"
  - 'Verificar ownership via prisma.report.findUnique na própria action antes de delegar ao data layer'
metrics:
  duration: '~15 minutos'
  completed: '2026-06-30'
  tasks_completed: 2
  files_modified: 3
---

# Phase 2 Plan 02: Turnstile fail-closed, IP normalization, e ownership de mensagens

Fechamento de SEC-05 (turnstile bypass), SEC-06 (rate limit bypass via IP spoofing) e SEC-02 (IDOR em sendMessageAction): fail-closed em verifyTurnstile, normalização do IP antes do rate limiter, e ownership check trackingCode/reportId antes de criar mensagem.

## Tasks Completed

| #         | Name                                                         | Commit  | Files                                       |
| --------- | ------------------------------------------------------------ | ------- | ------------------------------------------- |
| 1         | Turnstile fail-closed (SEC-05) e normalização de IP (SEC-06) | 5b08e69 | src/\_actions/public/report.action.ts       |
| 2 (RED)   | Testes de ownership sendMessageAction (SEC-02)               | 9fc672f | src/\_actions/public/message.action.test.ts |
| 2 (GREEN) | Implementação de ownership em sendMessageAction (SEC-02)     | bffd36d | src/\_actions/public/message.action.ts      |

## Decisions Made

- Mensagem de erro genérica `'Acesso negado'` única para report inexistente e mismatch de trackingCode (T-02-08: evita information leakage sobre qual campo falhou)
- Ownership check feito via `prisma.report.findUnique` diretamente na action, antes de delegar ao `reportRepository.createMessage` — mantém a separação de responsabilidades sem adicionar query ao data layer

## Deviations from Plan

None — plano executado exatamente como escrito, seguindo o padrão TDD RED/GREEN para Task 2.

## Deferred Issues

- `src/_modules/report/report.query.test.ts` — `getPublicStats > should calculate statistics and timeline` falha com `expected 12, received 11` — teste sensível a data (gera meses retroativos, junho sendo fim de mês altera o resultado). Falha **pré-existente** confirmada no main, não causada por este plano.

## Known Stubs

None.

## Threat Flags

None — nenhuma nova superfície de ataque introduzida. Este plano fecha ameaças existentes.

## Verification

- `npx vitest run src/_actions/public/report.action.test.ts` — 2/2 passando
- `npx vitest run src/_actions/public/message.action.test.ts` — 3/3 passando (sucesso, mismatch, inexistente)
- `grep -n "TURNSTILE_SECRET_KEY) return false" src/_actions/public/report.action.ts` — linha 14 ✓
- `grep -n "split(',')[0].trim()" src/_actions/public/report.action.ts` — linha 32 ✓
- `grep -n "trackingCode !== code" src/_actions/public/message.action.ts` — presente ✓

## Self-Check: PASSED

- src/\_actions/public/report.action.ts: FOUND
- src/\_actions/public/message.action.ts: FOUND
- src/\_actions/public/message.action.test.ts: FOUND
- Commits 5b08e69, 9fc672f, bffd36d: FOUND
