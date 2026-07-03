---
phase: quick-260703-h2y
plan: 01
subsystem: report-query
tags: [security, lgpd, decrypt, bugfix]
dependency-graph:
  requires: []
  provides: [decrypted-redacted-description-public-tracking]
  affects: [src/_components/shared/report-card.tsx]
tech-stack:
  added: []
  patterns: [decrypt-with-fallback-sentinel]
key-files:
  created: []
  modified:
    - src/_modules/report/report.query.ts
    - src/_modules/report/report.query.test.ts
decisions:
  - 'Replicated the exact decrypt+fallback pattern from admin.query.ts getReportById for consistency'
metrics:
  duration: '~15min'
  completed: 2026-07-03
---

# Phase quick-260703-h2y Plan 01: Descriptografar redactedDescription na tracking Summary

Fixed `getReportByCode` to decrypt `redactedDescription` with a `[DECRYPT_FAILED]` fallback, so the public `/report/[code]` page never displays raw AES-256-GCM ciphertext to whistleblowers.

## What Was Built

`src/_modules/report/report.query.ts`: `getReportByCode` now decrypts `report.redactedDescription` (when present) using the same try/catch + `logger.error` + `[DECRYPT_FAILED]` sentinel pattern already used in `src/_modules/admin/admin.query.ts`'s `getReportById`. Null/undefined `redactedDescription` (AI analysis not yet run) is left unchanged — no decrypt attempt. `description` and `messages` decryption behavior is unchanged.

Added `logger` import from `@/_shared/lib/logger`.

## Tests Added

`src/_modules/report/report.query.test.ts` — 3 new cases in `getReportByCode` describe block:

- Decrypts `redactedDescription` to plaintext when present and valid.
- Returns `[DECRYPT_FAILED]` when decryption throws.
- Leaves `redactedDescription` as `null` unchanged (and doesn't call `decrypt` for it) when the AI hasn't run yet.

## Verification Results

- `npx vitest run src/_modules/report/report.query.test.ts`: **9/9 passed** (6 pre-existing + 3 new).
- `npm run lint`: **passed** (0 errors, 5 pre-existing warnings in unrelated files).
- `npx tsc --noEmit`: **passed**, no output/errors.

## Deviations from Plan

None - plan executed exactly as written.

## Commits

- `5100201`: fix(quick-260703-h2y): decrypt redactedDescription in public report tracking

## Self-Check: PASSED

- FOUND: src/\_modules/report/report.query.ts (redactedDescription decrypt block present)
- FOUND: src/\_modules/report/report.query.test.ts (3 new test cases present)
- FOUND: commit 5100201 in git log
