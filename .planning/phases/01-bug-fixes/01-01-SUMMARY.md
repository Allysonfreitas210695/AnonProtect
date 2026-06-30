---
phase: 01-bug-fixes
plan: 01
subsystem: validators, admin-actions
tags: [bug-fix, security, tdd, tracking-code, rbac]
dependency_graph:
  requires: []
  provides: [valid-tracking-code-AP-format, clean-deleteReportAction-auth]
  affects: [src/_shared/utils/validators.ts, src/_actions/admin/report.action.ts]
tech_stack:
  added: []
  patterns: [TDD red-green, single-source-of-truth RBAC]
key_files:
  created: []
  modified:
    - src/_shared/utils/validators.ts
    - src/_shared/utils/validators.test.ts
    - src/_actions/admin/report.action.ts
decisions:
  - 'D-01: Regex sem flag /i — generateTrackingCode() em tracking.ts aplica .toUpperCase(), então lowercase nunca é gerado e deve ser rejeitado'
  - 'D-07: Remoção do check user.role !== ADMIN — adminActionClient já garante ADMIN no middleware; check interno era código morto'
metrics:
  duration: 8min
  completed_date: '2026-06-30'
  tasks_completed: 2
  files_changed: 3
---

# Phase 01 Plan 01: Correção de Regex de Tracking Code e Role Check Redundante

**One-liner:** Regex `/^AP-\d{4}-[A-Z0-9]{4}$/` substitui RPT-pattern e eliminado if-role morto em deleteReportAction.

## Tasks Completed

| #         | Name                              | Commit  | Files              |
| --------- | --------------------------------- | ------- | ------------------ |
| 1 (RED)   | Failing tests para formato AP     | 6d7a3b2 | validators.test.ts |
| 1 (GREEN) | Implementar regex AP no validador | 87d2d0d | validators.ts      |
| 2         | Remover role check redundante     | df10df1 | report.action.ts   |

## What Was Built

**BUG-01 — Validador de tracking code:** A função `isValidTrackingCode` em `validators.ts` usava `/^RPT-[A-Z0-9]{6}$/i`, rejeitando todos os códigos `AP-YYYY-XXXX` gerados pela aplicação. A regex foi corrigida para `/^AP-\d{4}-[A-Z0-9]{4}$/` (sem flag `/i`, pois `generateTrackingCode()` em `tracking.ts` aplica `.toUpperCase()` — lowercase é input inválido).

**BUG-04 — Role check duplicado:** `deleteReportAction` verificava `user.role !== 'ADMIN'` internamente após o `adminActionClient` já ter garantido essa restrição via middleware. O bloco foi removido junto com a desestruturação `ctx: { user }` (que ficou sem referência).

## Verification Results

- `npx vitest run src/_shared/utils/validators.test.ts` — 9/9 testes verdes
- `npx eslint src/_shared/utils/validators.ts src/_actions/admin/report.action.ts` — sem erros
- `npx tsc --noEmit` — sem erros em report.action.ts

## Deviations from Plan

None — plano executado exatamente como escrito.

## TDD Gate Compliance

- RED commit: `6d7a3b2` — `test(01-01): add failing tests for AP tracking code format`
- GREEN commit: `87d2d0d` — `feat(01-01): fix tracking code validator to accept AP-YYYY-XXXX format`

## Known Stubs

None.

## Threat Flags

None — mudanças reduzem superfície de ataque (T-01-01: regex estrita sem flag permissiva; T-01-02: única fonte de verdade RBAC no middleware).

## Self-Check: PASSED

- [x] `src/_shared/utils/validators.ts` existe e contém `/^AP-\d{4}-[A-Z0-9]{4}$/`
- [x] `src/_shared/utils/validators.test.ts` existe sem comentário TODO sobre RPT
- [x] `src/_actions/admin/report.action.ts` existe sem `Somente administradores podem excluir`
- [x] Commits 6d7a3b2, 87d2d0d, df10df1 existem no log
