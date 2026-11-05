---
phase: quick-261104-vov
plan: 01
subsystem: security
tags: [tracking-code, rate-limit, ip-extraction, logging, crypto-randint, upstash]

requires: []
provides:
  - 'generateTrackingCode em Base32 ~80 bits (AP-AAAA-XXXX-XXXX-XXXX-XXXX)'
  - 'getClientIp() helper centralizado (cf-connecting-ip -> ultimo x-forwarded-for -> 127.0.0.1)'
  - 'trackingRateLimit + checkTrackingRateLimit dedicado a consulta por codigo'
  - 'Pagina de consulta com rate limit antes do fetch e 404 indistinguivel'
  - 'Logs sem trackingCode em texto claro'
affects: [report-submission, report-tracking, rate-limiting]

tech-stack:
  added: []
  patterns:
    - "crypto.randomInt para geracao de credenciais (substitui randomBytes().toString('hex'))"
    - 'Helper unico para extracao de IP reutilizado em actions + Server Components'

key-files:
  created:
    - src/_shared/lib/get-client-ip.ts
    - src/_shared/lib/get-client-ip.test.ts
  modified:
    - src/_shared/utils/tracking.ts
    - src/_shared/utils/tracking.test.ts
    - src/_shared/utils/validators.ts
    - src/_shared/utils/validators.test.ts
    - src/_hooks/public/use-track-report.ts
    - src/_shared/lib/ratelimit.ts
    - src/_actions/public/report.action.ts
    - src/_actions/public/message.action.ts
    - src/_actions/public/login.action.ts
    - src/_actions/upload/s3.action.ts
    - src/_components/shared/rate-limit-guard.tsx
    - src/app/[locale]/(auth)/report/[code]/page.tsx

key-decisions:
  - 'isValidTrackingCode aceita APENAS o novo formato de 4 blocos (sem compatibilidade retroativa) pois nao ha codigos antigos relevantes em producao'
  - 'trackSchema no hook de consulta manteve regex [A-Z0-9-]+ e apenas subiu .max(12) para .max(30), preservando min(8) para seeds curtos de teste'
  - 'Pagina de consulta: rate limit e checado ANTES do fetch, mas a decisao final (notFound) so ocorre APOS buscar o report, garantindo que invalido/bloqueado/inexistente cheguem sempre ao mesmo 404'
  - 'prisma/schema.prisma NAO foi alterado — trackingCode ja e coluna text sem limite, confirmado na analise; nenhuma migration foi executada'

patterns-established:
  - 'getClientIp(hdrs: Headers) como unica fonte de verdade para extracao de IP client-side-forjavel, usada por actions e RSC'

requirements-completed: [ITEM-3.1, ITEM-3.2, ITEM-3.3]

duration: ~35min
completed: 2026-11-04
---

# Quick Task 261104-vov: Fortalecer código de rastreamento (Item 3 da banca) Summary

**Código de rastreamento elevado para ~80 bits em Base32 legível, consulta pelo código protegida por rate limit dedicado com resposta 404 indistinguível, e `trackingCode` removido de todos os logs.**

## Performance

- **Duration:** ~35 min
- **Tasks:** 3/3 completed
- **Files modified:** 12 (2 created, 10 modified)

## Accomplishments

- `generateTrackingCode()` agora gera `AP-${ano}-XXXX-XXXX-XXXX-XXXX` (16 símbolos Base32 sem caracteres ambíguos, ~79 bits de entropia) via `crypto.randomInt`
- `isValidTrackingCode` e `trackSchema` atualizados para aceitar apenas o novo formato
- Novo helper `getClientIp()` centraliza a extração de IP (antes duplicada de forma inconsistente em 5 lugares) e é usado por `report`, `message`, `login`, `s3` actions e `rate-limit-guard`
- Novo `trackingRateLimit`/`checkTrackingRateLimit` (20 consultas/IP/10min, fail-open, prefix próprio, `analytics: false`)
- Página `report/[code]` verifica rate limit antes de buscar o relatório; código inválido, inexistente e bloqueado por rate limit convergem para o mesmo 404
- Logs de `report.action.ts` não gravam mais `trackingCode` — warn de colisão loga `attempts`, info de sucesso loga apenas `reportId`

## Task Commits

1. **Task 1 (3.1): Elevar entropia do código de rastreamento** - `fe5fe55` (feat)
2. **Task 2 (3.2): Rate limit dedicado + getClientIp centralizado** - `a0ccc4a` (feat)
3. **Task 3 (3.3): Remover trackingCode dos logs** - `98f43d0` (fix)

## Files Created/Modified

- `src/_shared/lib/get-client-ip.ts` - Helper centralizado de extração de IP
- `src/_shared/lib/get-client-ip.test.ts` - Cobertura dos 3 caminhos (cf-connecting-ip, x-forwarded-for, fallback)
- `src/_shared/utils/tracking.ts` - Geração Base32 ~80 bits via `crypto.randomInt`
- `src/_shared/utils/tracking.test.ts` - Regex atualizado + teste de ausência de caracteres ambíguos
- `src/_shared/utils/validators.ts` - `isValidTrackingCode` aceita novo formato de 4 blocos
- `src/_shared/utils/validators.test.ts` - Casos válidos/inválidos atualizados
- `src/_hooks/public/use-track-report.ts` - `trackSchema.max(12)` → `.max(30)`
- `src/_shared/lib/ratelimit.ts` - `trackingRateLimit` + `checkTrackingRateLimit`
- `src/_actions/public/report.action.ts` - usa `getClientIp`; logs sem `trackingCode`
- `src/_actions/public/message.action.ts` - usa `getClientIp`
- `src/_actions/public/login.action.ts` - usa `getClientIp`
- `src/_actions/upload/s3.action.ts` - usa `getClientIp`
- `src/_components/shared/rate-limit-guard.tsx` - usa `getClientIp` (antes só lia `x-forwarded-for` crua)
- `src/app/[locale]/(auth)/report/[code]/page.tsx` - rate limit antes do fetch, 404 indistinguível

## Decisions Made

- Não houve necessidade de migração de schema: `trackingCode` já é `text` ilimitado no Postgres (confirmado, nenhum `prisma migrate` executado)
- `isValidTrackingCode` quebra compatibilidade retroativa com o formato antigo de propósito — não há dependentes em código de produção fora dos próprios testes de validators/tracking

## Deviations from Plan

None - plan executado exatamente como escrito.

## Issues Encountered

None.

## User Setup Required

None - nenhuma configuração externa necessária.

## Next Phase Readiness

- Item 3 do parecer da banca (código de rastreamento) está fechado: entropia, oráculo de enumeração e vazamento em logs tratados
- Nenhum bloqueio identificado para os demais itens do parecer

## Self-Check: PASSED

All created/modified files verified present on disk; all 3 task commit hashes (fe5fe55, a0ccc4a, 98f43d0) verified in git log.

---

_Plan: quick-261104-vov_
_Completed: 2026-11-04_
