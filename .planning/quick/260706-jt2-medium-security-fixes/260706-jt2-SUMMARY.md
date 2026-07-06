---
phase: quick-260706-jt2
plan: 01
subsystem: security
tags: [authorization, zod, s3, rate-limiting, next-safe-action, upstash]

requires:
  - phase: quick-260706-jdi
    provides: checkUploadRateLimit fail-open pattern reused for checkLoginRateLimit
provides:
  - Authorship/role-gated deleteInvestigationNote
  - S3-bucket-domain-restricted attachment URL schema validation
  - Login credentials rate limiting (10/IP/15min, fail-open)
affects: [admin-investigation-notes, report-submission, auth]

tech-stack:
  added: []
  patterns:
    - 'Fetch-then-authorize before mutating (findUnique -> check -> $transaction)'
    - 'Shared hostname helper (getBucketHostname) reused by schema validation instead of duplicating region/bucket logic'
    - 'Rate limiter fail-open pattern (checkLoginRateLimit) matching existing checkUploadRateLimit/checkRateLimit'

key-files:
  created:
    - src/_actions/public/login.action.test.ts
  modified:
    - src/_modules/admin/admin.data.ts
    - src/_actions/admin/report.action.ts
    - src/_modules/admin/admin.data.test.ts
    - src/_actions/admin/report.action.test.ts
    - src/_schemas/report.ts
    - src/_shared/lib/aws.ts
    - src/_actions/public/report.action.test.ts
    - src/_shared/lib/ratelimit.ts
    - src/_shared/lib/ratelimit.test.ts
    - src/_actions/public/login.action.ts

key-decisions:
  - 'Role passed from session ctx (user.role) into deleteInvestigationNote rather than trusting client-supplied input, to avoid privilege spoofing'
  - 'getBucketHostname() added to aws.ts and reused by the schema instead of duplicating region-resolution logic already in s3.action.ts'
  - "loginAction returns { error: ... } instead of throwing, to stay consistent with the action's existing AuthError-mapping return convention"

patterns-established:
  - 'Authorization checks for note-like resources: fetch resource first, compare authorship, allow ADMIN override, throw Portuguese Error otherwise'

requirements-completed: []

duration: 35min
completed: 2026-07-06
---

# Phase quick-260706-jt2: Medium Security Fixes Summary

**Closed three medium-severity audit findings: note-deletion authorization bypass, phishing-vector attachment URLs, and unthrottled login brute-force surface.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-07-06T17:18:00Z
- **Completed:** 2026-07-06T17:26:00Z
- **Tasks:** 3
- **Files modified:** 10 (1 created, 9 modified)

## Accomplishments

- `deleteInvestigationNote` now requires the caller be the note's author or an ADMIN before deletion; non-author SUPERVISORs get a Portuguese authorization error and no delete/activityLog write occurs.
- `reportSchema.attachments[].url` is restricted to the exact configured S3 bucket hostname via a new shared `getBucketHostname()` helper in `aws.ts`, closing a phishing/spoofing vector in the admin evidence gallery.
- `loginAction` is now gated by `checkLoginRateLimit` (10 attempts/IP/15min sliding window, fail-open on Redis outage), returning a Portuguese rate-limit message before ever calling `signIn`.

## Task Commits

Each task followed RED -> GREEN TDD and was committed atomically:

1. **Task 1: Enforce authorship/role check on deleteInvestigationNote**
   - `96109a1` test: add failing tests for note authorization check
   - `96ecd89` feat: enforce authorship/role check on deleteInvestigationNote
2. **Task 2: Restrict attachment URL domain to configured S3 bucket host**
   - `b583810` test: add failing tests for attachment url domain restriction
   - `dd07989` feat: restrict attachment url domain to configured S3 bucket host
3. **Task 3: Add checkLoginRateLimit and wire into loginAction**
   - `f2f7a6f` test: add failing tests for login rate limiting
   - `5c669b5` feat: add checkLoginRateLimit and wire into loginAction

_Note: Each task's test commit was verified RED (failing for the right reason) before its GREEN implementation commit._

## Files Created/Modified

- `src/_modules/admin/admin.data.ts` - `deleteInvestigationNote` fetches note, throws on not-found or non-author/non-ADMIN, then proceeds with existing `$transaction`
- `src/_actions/admin/report.action.ts` - `deleteInvestigationNoteAction` passes `user.role` from session ctx as the 4th arg
- `src/_modules/admin/admin.data.test.ts` - 4 new cases: not-found, non-author-blocked, author-allowed, ADMIN-override
- `src/_actions/admin/report.action.test.ts` - covers role pass-through and serverError surfacing of the authorization error
- `src/_shared/lib/aws.ts` - new exported `getBucketHostname()` reusing existing `region`/`BUCKET_NAME`
- `src/_schemas/report.ts` - attachment `url` field gets a `.refine()` hostname check against `getBucketHostname()`
- `src/_actions/public/report.action.test.ts` - 3 new schema-level cases: same-bucket accept, external-domain reject, malformed-url reject
- `src/_shared/lib/ratelimit.ts` - new `loginRateLimit` + `checkLoginRateLimit` mirroring `checkUploadRateLimit`'s fail-open pattern
- `src/_shared/lib/ratelimit.test.ts` - 3 new cases for `checkLoginRateLimit` (not-configured, fails-open, passthrough)
- `src/_actions/public/login.action.ts` - resolves IP, calls `checkLoginRateLimit`, returns rate-limit error before `signIn`
- `src/_actions/public/login.action.test.ts` (new) - covers rate-limited early return, normal `signIn` call, and existing `CredentialsSignin` error mapping (no regression)

## Decisions Made

- Role for the authorization check is sourced from `ctx.user.role` (server-verified session), never from client input, preventing a privilege-escalation vector where a client could self-report `ADMIN`.
- Did not modify `s3.action.ts`'s inline hostname construction to reuse `getBucketHostname()` — left as-is per plan guidance to avoid risking its passing test suite; only `report.ts` schema consumes the new helper.
- `loginAction`'s rate-limit rejection returns `{ error: ... }` (matching the action's existing `AuthError`-branch return shape) rather than throwing, preserving the established client-side handling contract.

## Deviations from Plan

None - plan executed exactly as written. All three tasks implemented per their `<action>` and `<behavior>` blocks with no architectural changes, missing dependencies, or scope adjustments needed.

## Issues Encountered

- Vitest's `vi.mock` hoisting initially broke a test helper class (`MockAuthError`) declared as a top-level `const` and referenced inside a `vi.mock('next-auth', ...)` factory ("Cannot access before initialization"). Fixed by wrapping the class definition in `vi.hoisted()` in `login.action.test.ts` — no production code affected.

## User Setup Required

None - no external service configuration required. Existing `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` and `AWS_S3_BUCKET_NAME`/`AWS_REGION` env vars (already required by the project) are reused; the login rate limiter fails open gracefully if Redis is not configured, matching all other rate limiters in the codebase.

## Next Phase Readiness

- All three medium-severity findings from the security audit are closed and covered by automated tests.
- Full suite: `npm test` → 37 files, 178 tests, all passing.
- `npm run lint` → 0 errors, 6 pre-existing warnings unrelated to this plan.
- No blockers for subsequent phases.

---

_Phase: quick-260706-jt2_
_Completed: 2026-07-06_

## Self-Check: PASSED
