---
phase: 03-chat
plan: 02
subsystem: message-notification
tags: [chat, email, ses, server-action]
requires:
  - sendEmail(to, subject, htmlBody) helper in src/_shared/lib/aws.ts (plan 03-01)
provides:
  - sendMessageAction now notifies assigned admin via email on new whistleblower message
affects:
  - src/_actions/public/message.action.ts
tech-stack:
  added: []
  patterns:
    - 'Single round-trip select extension: assignedTo.email fetched in the same findUnique as trackingCode (Pitfall 3)'
    - 'Action-level try/catch around sendEmail guarantees resilience even when a caller/mock bypasses the helper internal swallow (belt-and-suspenders for D-04)'
key-files:
  created: []
  modified:
    - src/_actions/public/message.action.ts
    - src/_actions/public/message.action.test.ts
decisions:
  - 'Added a try/catch around the sendEmail call inside sendMessageAction, deviating from the plan action-block instruction that said not to. The must_haves truth "returns success even if the email side-effect fails" is a correctness requirement (Rule 2) and the plan own Task 2 test (mocking sendEmail to reject) would otherwise fail, since the action would let the rejection propagate to next-safe-action error handling.'
metrics:
  duration: '~20 minutes'
  completed: 2026-07-02
---

# Phase 3 Plan 2: Wire Email Notification into sendMessageAction Summary

Extended `sendMessageAction`'s existing `prisma.report.findUnique` select to include `assignedTo.email` in the same query, and after `createMessage` succeeds, sends a content-free notification email (tracking code + absolute `/admin/report/[reportId]` link) to the assigned admin via the `sendEmail` helper from plan 03-01. Email is best-effort: the action always returns success regardless of email outcome.

## What Was Built

- `src/_actions/public/message.action.ts`:
  - Imported `sendEmail` from `@/_shared/lib/aws` and `logger` from `@/_shared/lib/logger`.
  - Extended `select` from `{ trackingCode: true }` to `{ trackingCode: true, assignedTo: { select: { email: true } } }` — single DB round-trip preserved (`findUnique` still called exactly once).
  - Access check (`report.trackingCode !== code -> ActionError('Acesso negado')`) kept unchanged.
  - After `createMessage`, if `report.assignedTo?.email` is present, builds `baseUrl` from `process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'`, an admin link `${baseUrl}/admin/report/${reportId}`, and a content-free HTML body (tracking code only, no message text — D-03), then calls `sendEmail(...)` wrapped in `try/catch` (see Deviations).
  - Existing `revalidatePath` and success return unchanged.
- `src/_actions/public/message.action.test.ts`:
  - Added `vi.mock('@/_shared/lib/aws', () => ({ sendEmail: vi.fn() }))`.
  - Updated the existing "should send a message successfully" mock to include `assignedTo: { email: 'admin@sistema.com' }`.
  - Added 3 new cases: email sent when assignedTo present; email NOT sent when assignedTo is null; action still succeeds when `sendEmail` rejects.
  - Pre-existing access-denied cases untouched, still passing.

## Verification

- `npx vitest run src/_actions/public/message.action.test.ts` — 6/6 tests passing
- `npx eslint src/_actions/public/message.action.ts src/_actions/public/message.action.test.ts` — clean
- `npx tsc --noEmit` — clean
- `grep -c 'sendEmail(' src/_actions/public/message.action.ts` → 1
- `grep -c 'assignedTo' src/_actions/public/message.action.ts` → 3
- `grep -c 'findUnique' src/_actions/public/message.action.ts` → 1 (single round-trip preserved)
- `grep -c 'NEXT_PUBLIC_APP_URL'` → 1, `grep -c '/admin/report/'` → 1
- No `${content}` interpolated into the email body (D-03 confirmed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added try/catch around sendEmail in the action**

- **Found during:** Task 2, writing the "succeeds even if sendEmail rejects" test
- **Issue:** The plan's Task 1 action-block explicitly said not to wrap `sendEmail` in a try/catch, relying solely on the helper's internal error-swallowing (D-04). But the plan's own frontmatter `must_haves.truths` states "sendMessageAction returns success even if the email side-effect fails (D-04)" as a hard requirement, and Task 2 specifies a test that mocks `sendEmail` to reject and asserts the action still returns success. Running that test without an action-level try/catch caused the rejection to propagate through `next-safe-action`'s `handleServerError`, producing `serverError: 'SES down'` instead of the success payload — failing the must-have truth.
- **Fix:** Wrapped the `sendEmail` call in `try/catch` inside `sendMessageAction`, logging via `logger.error({ reportId, error }, ...)` on failure and continuing to the success return. This is defense-in-depth on top of the helper's own non-throwing guarantee — correct behavior whether the helper is the real implementation or a test double.
- **Files modified:** `src/_actions/public/message.action.ts`
- **Commit:** 692dc3d

## Threat Model Notes

- T-03-03 (Elevation of Privilege, access check) — confirmed unchanged: `report.trackingCode !== code` check still runs before any `createMessage`/`sendEmail` call, unaffected by the extended `select`.
- T-03-04 (Information Disclosure, email body) — confirmed: email body contains only the tracking code and a link, never `content`; verified by grep and by test assertions using `expect.any(String)` rather than asserting on message text.
- T-03-05 (Tampering, admin link) — accepted as planned: link path is a fixed internal route built server-side from a trusted `reportId`, not user input.

## Self-Check: PASSED
