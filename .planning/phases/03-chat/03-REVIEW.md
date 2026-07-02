---
phase: 03-chat
reviewed: 2026-07-02T13:19:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/_shared/lib/aws.ts
  - src/_shared/lib/aws.test.ts
  - src/_actions/public/message.action.ts
  - src/_actions/public/message.action.test.ts
  - src/_modules/admin/admin.query.ts
  - src/_modules/admin/admin.query.test.ts
findings:
  critical: 1
  warning: 2
  info: 2
  total: 5
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-07-02T13:19:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the SES email-notification helper, its wiring into `sendMessageAction`, and the removal of the `take: 50` cap on the admin report-message query. `sendEmail` itself correctly never throws (graceful degradation confirmed by tests). The most significant defect is that `sendMessageAction` looks up the report by `id` without excluding soft-deleted reports (`deletedAt: null`), unlike every other read path in this codebase (`report.query.ts`), which lets whistleblowers keep messaging — and triggering admin email notifications on — reports that have been erased per LGPD. There is also no rate limiting on the unauthenticated message-send action, which combined with the newly uncapped message query and a live SES send per message, opens a cost/DoS vector that didn't exist in this form before this phase.

## Critical Issues

### CR-01: `sendMessageAction` does not exclude soft-deleted reports

**File:** `src/_actions/public/message.action.ts:20-23`
**Issue:** The lookup used to authorize a message send is:

```ts
const report = await prisma.report.findUnique({
  where: { id: reportId },
  select: { trackingCode: true, assignedTo: { select: { email: true } } },
})
```

This omits `deletedAt: null`, unlike every comparable read in `src/_modules/report/report.query.ts` (e.g. `where: { trackingCode: code, deletedAt: null }` at line 22) and `admin.query.ts#getReportById` (`where: { id, deletedAt: null }` at line 35). As a result, a whistleblower who retains their tracking code can continue to append messages to — and trigger SES email notifications about — a report that has been soft-deleted (e.g. for an LGPD erasure/right-to-be-forgotten request). This directly undermines the data-erasure guarantee the `deletedAt` column exists to provide, and admins will keep receiving notifications about a case they believed was closed/erased.
**Fix:**

```ts
const report = await prisma.report.findUnique({
  where: { id: reportId, deletedAt: null },
  select: { trackingCode: true, assignedTo: { select: { email: true } } },
})
```

## Warnings

### WR-01: No rate limiting on unauthenticated `sendMessageAction`, now paired with a live SES send per call

**File:** `src/_actions/public/message.action.ts:17-44`
**Issue:** `sendMessageAction` is served by the unauthenticated `actionClient` and has no call to `checkRateLimit` (used elsewhere, e.g. `src/_actions/public/report.action.ts`). Prior to this phase, spamming this endpoint only wrote rows to `Message`. Now every successful call also issues a live `SendEmailCommand` against SES (`aws.ts:43-63`). An attacker who knows (or brute-forces) a `reportId`/`trackingCode` pair can trigger unlimited SES sends, incurring AWS cost, risking SES sending-quota/reputation throttling, and flooding the assigned admin's inbox. This is compounded by `admin.query.ts` now fetching the entire message thread with no cap (see WR-02), so the same unauthenticated endpoint can also inflate the admin detail-page payload without bound.
**Fix:** Reuse the existing rate limiter, keyed by IP (and/or `reportId`) as `report.action.ts` does:

```ts
import { checkRateLimit } from '@/_shared/lib/ratelimit'
import { headers } from 'next/headers'
// ...
const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
const { success } = await checkRateLimit(ip)
if (!success) throw new ActionError('Muitas mensagens enviadas. Tente novamente mais tarde.')
```

### WR-02: `messages` include on `getReportById` has no upper bound, and the pairing with WR-01 means the admin detail page has no size guarantee

**File:** `src/_modules/admin/admin.query.ts:38`
**Issue:** The previous `take: 50` cap on `messages` was removed so admins can see the full thread (confirmed by the explicit test at `admin.query.test.ts:47-64`). Taken alone, uncapped reads for a single report are reasonable. However, since `sendMessageAction` (the write path that populates this same array) has no rate limiting or per-report message ceiling (WR-01), a malicious or automated whistleblower can grow a single report's thread unboundedly, and this query will now load and decrypt the entire thread on every admin page view with no ceiling. At minimum, pair the removed `take` with a write-side safeguard.
**Fix:** Add rate limiting/backpressure on the write path (see WR-01) rather than relying on the read path to bound response size; if a max thread length is desired, enforce it in `reportRepository.createMessage` or `sendMessageAction` rather than silently truncating reads.

## Info

### IN-01: Redundant try/catch around `sendEmail`, which already never throws

**File:** `src/_actions/public/message.action.ts:35-39`
**Issue:** `sendEmail` (`aws.ts:43-63`) internally catches all SES errors and logs them, resolving `undefined` in every case — it is documented/designed to never throw. Wrapping the call in another `try/catch` in the action is dead defensive code that adds noise without changing behavior, and could mislead future maintainers into thinking `sendEmail` is fallible at the call site.
**Fix:** Drop the redundant try/catch, or if defense-in-depth is desired, add a code comment noting `sendEmail` is guaranteed not to throw so the wrapping is intentional belt-and-braces rather than apparently-dead code.

```ts
if (report.assignedTo?.email) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const adminLink = `${baseUrl}/admin/report/${reportId}`
  const htmlBody = `<p>Nova mensagem recebida no relatório ${code}.</p><a href="${adminLink}">Acesse o painel para visualizar.</a>`
  await sendEmail(report.assignedTo.email, 'Nova mensagem no AnonProtect', htmlBody)
}
```

### IN-02: `aws.test.ts` "should handle missing client or bucket" test doesn't test that scenario

**File:** `src/_shared/lib/aws.test.ts:55-60`
**Issue:** The test is titled `'should handle missing client or bucket'` and asserts `expect(url).not.toBeNull()`, but AWS env vars are hoisted and set for the whole suite (lines 5-11), so `s3Client`/`BUCKET_NAME` are always truthy in this module instance — the `if (!s3Client || !BUCKET_NAME) return null` branch at `aws.ts:23` is never exercised. The assertion direction (`not.toBeNull()`) also contradicts the test name, which implies the missing-config path should be verified. This gives false confidence that the graceful-degradation branch is covered.
**Fix:** Either rename the test to reflect what it actually checks (a second successful call), or add a dedicated test using `vi.resetModules()` / module re-import with unset env vars to genuinely cover the null-client/null-bucket branch, mirroring how `sendEmail`'s "SES não configurado" branch would need a similar re-import test to be covered.

---

_Reviewed: 2026-07-02T13:19:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
