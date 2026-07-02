---
phase: 03-chat
plan: 04
subsystem: chat-abuse-mitigation
tags: [rate-limiting, dos-prevention, sendMessageAction, upstash]
dependency-graph:
  requires:
    [checkRateLimit pattern in ratelimit.ts, sendMessageAction, report.data.ts createMessage]
  provides: [checkMessageRateLimit, per-report message cap]
  affects: [src/_actions/public/message.action.ts]
tech-stack:
  added: []
  patterns: [Upstash sliding-window rate limiter per-purpose isolation, write-side backpressure cap]
key-files:
  created: []
  modified:
    - src/_shared/lib/ratelimit.ts
    - src/_actions/public/message.action.ts
    - src/_actions/public/message.action.test.ts
decisions:
  - 'Dedicated chat rate limiter (10/min) instead of reusing reportRateLimit (10/h) — avoids starving legitimate chat with report-submission quota'
  - 'Per-report hard cap of 1000 messages provides write-side backpressure for the intentionally-uncapped admin read (D-01)'
metrics:
  duration: '~15 min'
  completed: 2026-07-02
---

# Phase 03 Plan 04: Chat abuse mitigation (rate limit + message cap) Summary

Dedicated per-IP message rate limiter (10/min) and a per-report hard cap (1000 messages) added to `sendMessageAction`, closing review findings WR-01 and WR-02 without adding pagination.

## What Was Built

- `checkMessageRateLimit(identifier)` in `src/_shared/lib/ratelimit.ts` — a second Upstash sliding-window limiter (`10, '1 m'`, prefix `anonprotect_message_ratelimit`), fully isolated from the existing `reportRateLimit` (`10, '1 h'`). Degrades gracefully (`{ success: true, ... }`) when Redis env vars are absent, mirroring `checkRateLimit`.
- `sendMessageAction` in `src/_actions/public/message.action.ts` now runs gates in order: (1) resolve IP via `cf-connecting-ip` → last `x-forwarded-for` entry → `127.0.0.1`, then `checkMessageRateLimit(ip)` — throws `ActionError` before the `findUnique` auth lookup if exceeded; (2) existing trackingCode/reportId match check; (3) `prisma.message.count({ where: { reportId } })` against `MAX_MESSAGES_PER_REPORT = 1000` — throws `ActionError` before `createMessage` if reached. Neither rejection path calls `createMessage` or `sendEmail`.
- Test suite extended from 6 to 8 tests: mocked `next/headers` and `@/_shared/lib/ratelimit`, extended the prisma mock with `message.count`, defaulted both to pass-through in `beforeEach`, and added dedicated tests for rate-limit rejection and cap rejection — both assert `createMessage`/`sendEmail` were never called.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx vitest run src/_actions/public/message.action.test.ts` → 8/8 passing
- `npx tsc --noEmit -p tsconfig.json` → no new type errors in ratelimit.ts / message.action.ts
- Manual read confirms rate-limit gate precedes `findUnique`, cap gate precedes `createMessage`

## Self-Check: PASSED
