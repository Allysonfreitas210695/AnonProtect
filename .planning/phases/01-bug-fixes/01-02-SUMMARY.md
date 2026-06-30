---
phase: 01-bug-fixes
plan: 02
subsystem: admin-query, i18n, public-pages
tags: [bug-fix, filter, i18n, tos, lgpd]
dependency_graph:
  requires: []
  provides: [getReportsPaginated-single-country-param, tos-expanded-i18n]
  affects: [admin/report/page.tsx, admin/page.tsx, terms-of-service/page.tsx]
tech_stack:
  added: []
  patterns: [single-param-filter, i18n-key-expansion]
key_files:
  created: []
  modified:
    - src/_modules/admin/admin.query.ts
    - src/app/[locale]/(admin)/admin/report/page.tsx
    - src/app/[locale]/(admin)/admin/page.tsx
    - src/app/[locale]/(public)/terms-of-service/page.tsx
    - messages/pt-BR.json
    - messages/en.json
    - messages/es.json
decisions:
  - 'Consolidar filterCountry em country como parametro unico em getReportsPaginated elimina sobrescrita silenciosa mantendo precedencia de SUPERVISOR via filterCountry || country || undefined nos callers'
  - 'Manter typo responsibilityDesc inalterado para evitar regressao de consistencia entre page.tsx e os 3 JSONs'
metrics:
  duration: ~12min
  completed_date: '2026-06-30'
  tasks_completed: 2
  files_modified: 7
---

# Phase 01 Plan 02: Consolidar filtro de país e expandir ToS Summary

**One-liner:** Filtro de país consolidado em parâmetro único com precedência SUPERVISOR + página ToS expandida com 4 seções LGPD/TCC nos três idiomas.

## Tasks Completed

| Task | Name                                                          | Commit  | Files                                                   |
| ---- | ------------------------------------------------------------- | ------- | ------------------------------------------------------- |
| 1    | Consolidar filtro de país em getReportsPaginated (BUG-02)     | 779ecd8 | admin.query.ts, report/page.tsx, admin/page.tsx         |
| 2    | Expandir conteúdo ToS e chaves i18n nos três idiomas (BUG-03) | 561d1c4 | terms-of-service/page.tsx, pt-BR.json, en.json, es.json |

## What Was Built

### Task 1 — BUG-02: Consolidar filtro de país

`getReportsPaginated` tinha dois parâmetros para filtro de país (`country` e `filterCountry`), onde a linha `if (filterCountry) where.country = filterCountry` sobrescrevia silenciosamente qualquer valor já atribuído por `if (country)`. O parâmetro `filterCountry` foi removido da assinatura da função.

Os dois callers foram atualizados:

- `admin/report/page.tsx`: passa `filterCountry || country || undefined` no argumento 7 (SUPERVISOR tem precedência sobre searchParam de URL)
- `admin/page.tsx`: move `filterCountry || undefined` da posição 9 para a posição 7 (country), remove o nono argumento

`getReportsLocations`, `getQuickStats`, `getReportStats` e `getGlobalActivityLogs` mantêm seus próprios parâmetros `filterCountry` independentes — não foram modificados.

### Task 2 — BUG-03: Expandir página ToS

Adicionadas 4 pares de chaves i18n em `Compliance.terms` nos três arquivos de mensagens:

- `object`/`objectDesc` — propósito e objeto da plataforma TCC
- `lgpd`/`lgpdDesc` — privacidade, criptografia AES-256-GCM, conformidade LGPD
- `limitation`/`limitationDesc` — limitação de responsabilidade acadêmica
- `contact`/`contactDesc` — canal de contato institucional

Página `terms-of-service/page.tsx` expandida com 4 novos Cards usando ícones FileText, Lock, Info, Mail do lucide-react, seguindo exatamente o padrão de card existente.

## Verification Results

- `node .planning/phases/01-bug-fixes/check-tos-i18n.cjs` → "all i18n keys present" (exit 0)
- `npx tsc --noEmit` → sem erros nos arquivos modificados
- `npm run lint` (via lint-staged no commit) → passou em todos os arquivos
- `grep -c "filterCountry" src/_modules/admin/admin.query.ts` → 8 ocorrências apenas em funções distintas de getReportsPaginated

## Deviations from Plan

None — plano executado exatamente como especificado.

## Known Stubs

None — todas as chaves i18n foram adicionadas com conteúdo real; nenhum placeholder ou TODO.

## Threat Flags

None — nenhuma nova superfície de segurança introduzida. Mudanças consolidam parâmetro existente (T-01-03 mitigado) e adicionam conteúdo estático a rota pública (T-01-05 aceito).

## Self-Check: PASSED

- [x] `src/_modules/admin/admin.query.ts` modificado — sem `filterCountry` em `getReportsPaginated`
- [x] `src/app/[locale]/(admin)/admin/report/page.tsx` — contém `filterCountry || country || undefined`
- [x] `src/app/[locale]/(admin)/admin/page.tsx` — `filterCountry` na posição 7
- [x] `src/app/[locale]/(public)/terms-of-service/page.tsx` — 4 novos cards + importações
- [x] `messages/pt-BR.json`, `messages/en.json`, `messages/es.json` — 8 novas chaves cada
- [x] Commit 779ecd8 existe
- [x] Commit 561d1c4 existe
