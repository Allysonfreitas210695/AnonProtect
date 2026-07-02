---
phase: quick
plan: 260702-o0y
subsystem: admin-stats
tags: [performance, prisma, sql]
requires: []
provides: [getReportStats-sql-timeline-aggregation]
affects: [admin-dashboard-charts]
tech-stack:
  added: []
  patterns: [Prisma.sql parameterized $queryRaw, Prisma.join for conditional WHERE clauses]
key-files:
  created: []
  modified:
    - src/_modules/admin/admin.query.ts
    - src/_modules/admin/admin.query.test.ts
decisions:
  - 'Mirrored the existing getPublicStats $queryRaw pattern (report.query.ts) instead of inventing a new one'
  - 'Used Prisma.sql + Prisma.join for conditional WHERE fragments to keep startDate/filterCountry as bound parameters, never string-interpolated'
metrics:
  duration: '~15 min'
  completed: 2026-07-02
---

# Phase quick Plan 260702-o0y: Fix getReportStats SQL aggregation Summary

Replaced `getReportStats`'s unbounded `findMany({ select: { createdAt: true } })` + in-memory `Map` bucketing with a parameterized `prisma.$queryRaw` using `date_trunc('day', created_at)` aggregation, matching the pattern already used by `getPublicStats`.

## What Changed

- `src/_modules/admin/admin.query.ts`: `getReportStats` now runs a `$queryRaw` query (bound to `rawTimeline`) inside the existing `Promise.all`, replacing the old `reports` findMany binding and the trailing `timelineMap`/`forEach` block. Conditional WHERE fragments (`deleted_at IS NULL`, optional `created_at >= ${startDate}`, optional `country = ${filterCountry}`) are built with `Prisma.sql` and joined via `Prisma.join(conditions, ' AND ')` — no string interpolation of dynamic values. `timelineData` is mapped from the raw rows: `date: r.day.toISOString().split('T')[0]`, `count: Number(r.count)`, preserving the exact prior output shape.
- `src/_modules/admin/admin.query.test.ts`: Added `$queryRaw: vi.fn()` to the prisma mock, imported `getReportStats`, and added a `describe('getReportStats', ...)` block asserting `$queryRaw` is invoked and `timelineData` correctly maps a mocked `{ day: Date, count: BigInt(3) }` row to `{ date: '2026-07-01', count: 3 }`.

## Verification

- `npx tsc --noEmit` — passes
- `npx vitest run src/_modules/admin/admin.query.test.ts` — 6/6 tests pass
- `grep "date_trunc('day'"` confirms new SQL aggregation present; old `timelineMap`/`reports.forEach` block removed

## Deviations from Plan

None - plan executed exactly as written. One incidental fix: the test's `count: 3n` BigInt literal syntax failed `tsc --noEmit` (project targets ES2017, which doesn't support BigInt literals) — changed to `BigInt(3)` (Rule 1 - bug, part of Task 2's own verification loop, not a separate deviation from another task).

## Commits

- `1441c62`: fix(quick-260702-o0y): replace in-memory timeline with SQL aggregation
- `c80d03c`: test(quick-260702-o0y): cover getReportStats SQL timeline path

## Self-Check: PASSED
