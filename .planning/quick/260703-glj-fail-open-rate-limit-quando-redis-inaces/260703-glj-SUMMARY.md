---
phase: quick-260703-glj
plan: 01
subsystem: rate-limiting
tags: [bugfix, resilience, upstash-redis]
dependency-graph:
  requires: []
  provides: [fail-open-ratelimit]
  affects: [rate-limit-guard, report-submission, login]
tech-stack:
  added: []
  patterns: [try/catch fail-open, structured logging via pino]
key-files:
  created: []
  modified:
    - src/_shared/lib/ratelimit.ts
    - src/_shared/lib/ratelimit.test.ts
decisions:
  - 'Fail open (allow request) rather than fail closed when Redis is unreachable, per Core Value: whistleblower flow must always succeed even if infra fails'
metrics:
  duration: '~15 min'
  completed: 2026-07-03
---

# Phase quick-260703-glj Plan 01: Fail-open rate limit when Redis unreachable Summary

Wrapped `checkRateLimit` and `checkMessageRateLimit` Redis calls in try/catch so a reachable-but-broken Upstash instance (DNS failure, network outage, deleted instance) logs the error and fails open instead of throwing and crashing `/report/new`, `/report/track`, `/report/[code]`, and `/login`.

## What Was Built

- `src/_shared/lib/ratelimit.ts`: imported the `logger` singleton; wrapped `await reportRateLimit.limit(identifier)` and `await messageRateLimit.limit(identifier)` each in try/catch. On error, logs `logger.error({ err }, 'Rate limit check failed, failing open')` and returns `{ success: true, limit: 0, remaining: 0, reset: 0 }` — same shape as the existing "env vars absent" fallback. No changes to the null-check path, `Ratelimit`/`Redis` config, or the 10/hour and 10/minute limits.
- `src/_shared/lib/ratelimit.test.ts`: extended the existing single test into a full suite (6 tests) covering both `checkRateLimit` and `checkMessageRateLimit`:
  - returns fail-open when env vars are absent (pre-existing behavior, preserved)
  - returns fail-open when Redis is configured but `.limit()` rejects (new)
  - passes through the real result unchanged when Redis responds normally (new)
  - Mocking approach: `vi.mock('@upstash/ratelimit')` with a function-based constructor mock (arrow functions can't be used with `new`) returning `{ limit: mockLimit }`; `vi.mock('@upstash/redis')`; `vi.mock('@/_shared/lib/logger')`. Uses `vi.resetModules()` + dynamic `import('./ratelimit')` per test so each test can control `process.env.UPSTASH_REDIS_REST_URL`/`TOKEN` before the module's top-level `redis`/`reportRateLimit`/`messageRateLimit` singletons are constructed.

## Verification Results

- `npx vitest run src/_shared/lib/ratelimit.test.ts` — 6/6 passed
- `npm run lint` — 0 errors, 5 pre-existing unrelated warnings (unused imports/vars in other files, `<img>` usage) — untouched by this change
- `npx tsc --noEmit` — no output, passes

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- FOUND: src/\_shared/lib/ratelimit.ts (contains `catch`)
- FOUND: src/\_shared/lib/ratelimit.test.ts (contains fail-open test cases)
- FOUND commit: b061239 fix(quick-260703-glj): fail open rate limit when Redis unreachable
