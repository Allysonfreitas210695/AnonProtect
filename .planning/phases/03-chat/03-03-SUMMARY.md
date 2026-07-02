---
phase: 03-chat
plan: 03
subsystem: admin-report-query
tags: [chat, messages, admin, prisma]
requires: []
provides:
  - 'getReportById message thread fetch with no 50-message cap'
affects:
  - 'src/_modules/admin/admin.query.ts'
tech-stack:
  added: []
  patterns:
    - 'Prisma include without take: fetch all related rows, rely on orderBy for ordering'
key-files:
  created: []
  modified:
    - src/_modules/admin/admin.query.ts
    - src/_modules/admin/admin.query.test.ts
decisions:
  - 'D-01 (from CONTEXT.md): no pagination/cursor UI added — fetch all messages, matching the already-uncapped public getReportByCode'
metrics:
  duration: '~10 min'
  completed: '2026-07-02'
---

# Phase 3 Plan 3: Remove admin message thread 50-cap Summary

Removed the `take: 50` truncation on `getReportById`'s `messages` include in `src/_modules/admin/admin.query.ts`, so admins/supervisors now see the complete chronological message thread instead of silently losing messages beyond the 50th.

## What Was Built

- **Task 1:** Changed `messages: { orderBy: { createdAt: 'asc' }, take: 50 }` to `messages: { orderBy: { createdAt: 'asc' } }` in `getReportById`. No other includes touched.
- **Task 2:** Added a regression test in `admin.query.test.ts` asserting the `include.messages` argument passed to `prisma.report.findUnique` deep-equals `{ orderBy: { createdAt: 'asc' } }` (no `take` key), guarding against the cap's reintroduction.

## Verification

- `grep -v '^\s*//' src/_modules/admin/admin.query.ts | grep -c 'take: 50'` → 0
- `npx vitest run src/_modules/admin/admin.query.test.ts` → 4/4 passed
- `npx tsc --noEmit` → clean
- `npm run lint` → 1 pre-existing error + 3 pre-existing warnings, all in files unrelated to this plan (out of scope, not introduced by this change)

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- FOUND: src/\_modules/admin/admin.query.ts (take:50 removed)
- FOUND: src/\_modules/admin/admin.query.test.ts (regression test added)
- FOUND commit fe74deb: fix(03-03): remove take:50 cap on admin message thread fetch
- FOUND commit 8b00eb6: test(03-03): guard against reintroducing take:50 on message thread
