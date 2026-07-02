# Phase 3: Chat - Research

**Researched:** 2026-07-02
**Domain:** AWS SES transactional email (SDK v3) + Prisma pagination cap removal in a Next.js 16 Server Actions codebase
**Confidence:** HIGH

## Summary

This phase is narrow and well-scoped by CONTEXT.md: the chat UI is complete on both sides, and only three things are missing — (1) remove a `take: 50` cap on messages in `admin.query.ts`, (2) add a `sendEmail` helper in `src/_shared/lib/aws.ts` using `@aws-sdk/client-ses`'s `SendEmailCommand`, and (3) call that helper from `sendMessageAction` in fire-and-forget style, notifying only `report.assignedTo`. All code paths, patterns, and integration points already exist in the codebase; this research confirms exact library syntax and closes two open questions from CONTEXT.md: whether other pagination caps exist, and how to construct the admin panel link (no base-URL env var currently exists in the codebase — this is a gap the planner must address).

`@aws-sdk/client-ses` v3.1009.0 is already installed (package.json), and `sesClient` / `SES_FROM_EMAIL` are already initialized in `src/_shared/lib/aws.ts` with graceful degradation (`null` when AWS credentials absent) — the same pattern used for `s3Client`. The `SendEmailCommand` API confirmed against official AWS docs takes `Source`, `Destination.ToAddresses`, and `Message.{Subject,Body.{Text,Html}}` — straightforward to wrap in a single `sendEmail(to, subject, body)` helper.

**Primary recommendation:** Add `sendEmail(to: string, subject: string, htmlBody: string)` to `aws.ts` mirroring the null-check pattern of `getDownloadUrl`; call it from `sendMessageAction` via `after()` (Next.js background execution, same pattern as `triggerAiAnalysis`) or an inline `try/catch` that never throws, after fetching `report.assignedTo.email` in a dedicated query since `sendMessageAction` doesn't currently select that relation.

## Architectural Responsibility Map

| Capability                        | Primary Tier                        | Secondary Tier                   | Rationale                                                                                           |
| --------------------------------- | ----------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Message pagination cap removal    | Database / Storage (Prisma query)   | API / Backend (`admin.query.ts`) | Cap is a Prisma `take` option in the data-access layer; no UI change needed per D-01                |
| Email notification on new message | API / Backend (Server Action + lib) | External Service (AWS SES)       | `sendEmail` helper lives in `_shared/lib`, invoked from the Server Action after message persistence |
| Admin panel link construction     | API / Backend                       | Configuration (env var)          | Link must be built server-side from a base URL — currently no such env var exists in the codebase   |

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Remove `take: 50` from `getReportById` in `src/_modules/admin/admin.query.ts`. No pagination UI needed — fetch all messages, consistent with the public side.
- **D-02:** Notify only `report.assignedTo`. If `assignedTo` is null, do not send email.
- **D-03:** Email is generic — no message content. Body: "Nova mensagem recebida no relatório [trackingCode]. Acesse o painel para visualizar." Include a direct link to `/admin/report/[reportId]`.
- **D-04:** Graceful degradation — if `sesClient` is null or SES call throws, log with `logger.error` and let `sendMessageAction` succeed anyway. Mirrors S3's `if (!s3Client) return null` pattern.

### Claude's Discretion

- Email subject line, HTML vs plain text format, exact link construction.
- `sendEmail` helper location: `src/_shared/lib/aws.ts` (already decided location, but signature/implementation details are discretionary).

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

<phase_requirements>

## Phase Requirements

| ID      | Description                                              | Research Support                                                                                         |
| ------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| CHAT-01 | Whistleblower accesses message thread via tracking code  | Already implemented — `getReportByCode` in `report.query.ts`, no changes needed                          |
| CHAT-02 | Whistleblower can send new message in thread             | Already implemented — `sendMessageAction` in `message.action.ts`; this phase only adds email side-effect |
| CHAT-03 | Whistleblower views all messages chronologically         | Already implemented — `getReportByCode` has no `take` cap, `orderBy: { createdAt: 'asc' }`               |
| CHAT-04 | Thread displays >50 messages, no truncation              | Fix: remove `take: 50` in `admin.query.ts:38`. Public side already has no cap — verified below           |
| CHAT-05 | Admin/supervisor views full thread on report detail      | Blocked by CHAT-04 fix (same query); once cap removed, satisfied                                         |
| CHAT-06 | Admin/supervisor can send new message in thread          | Already implemented — `sendAdminReplyAction` in `report.action.ts`; no changes needed                    |
| CHAT-07 | Admin receives email via SES when whistleblower messages | New: `sendEmail` helper in `aws.ts` + wiring in `sendMessageAction`, per D-02/D-03/D-04                  |

</phase_requirements>

## Standard Stack

### Core

| Library               | Version                                                                                                 | Purpose                                        | Why Standard                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| `@aws-sdk/client-ses` | `^3.1009.0` (installed; latest `3.1078.0` [VERIFIED: npm registry] as of 2026-07-02, semver-compatible) | SES `SendEmailCommand` for transactional email | Already a project dependency; official AWS SDK v3 modular client |

No new packages need to be installed for this phase — `sesClient`, `@aws-sdk/client-ses`, and `logger` are all already present.

### Supporting

| Library                 | Version                     | Purpose                                                                  | When to Use                                                                                                             |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `next/server` (`after`) | bundled with Next.js 16.1.6 | Defer non-critical work (email send) until after the response is flushed | Already used in `triggerAiAnalysis` (`src/_actions/public/ai-analysis.ts`) — same pattern applies to email notification |

### Alternatives Considered

| Instead of                         | Could Use                      | Tradeoff                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SendEmailCommand` (formatted API) | `SendRawEmailCommand`          | Raw API needed only for attachments/custom MIME — not needed here, adds complexity                                                                                                                                                                                                                                                                                                                              |
| `after()` background execution     | Inline `await` before `return` | Inline is simpler and matches D-04's "fire-and-forget... log and continue" wording literally; `after()` adds an extra layer but guarantees the response isn't delayed by SES latency. Either satisfies requirements — recommend inline `try/catch` for simplicity, matching `sendAdminReplyAction`'s existing try/catch shape rather than introducing a second background-execution pattern for one email call. |

**Installation:** None required — all dependencies already present in `package.json`.

**Version verification:** `npm view @aws-sdk/client-ses version` → `3.1078.0` [VERIFIED: npm registry] confirms the installed `^3.1009.0` range is current and not deprecated.

## Package Legitimacy Audit

No new packages are being installed in this phase — `@aws-sdk/client-ses` is a pre-existing, already-vetted dependency (official AWS SDK). Package Legitimacy Gate is not applicable.

## Architecture Patterns

### System Architecture Diagram

```
Whistleblower (browser)
   │  submits message form
   ▼
message-form.tsx ──calls──▶ use-message.ts (hook)
   │
   ▼
sendMessageAction (message.action.ts)          [Server Action, actionClient]
   │
   ├─▶ 1. verify report.trackingCode === code (existing)
   ├─▶ 2. reportRepository.createMessage(reportId, content)   [existing: encrypt + persist]
   ├─▶ 3. NEW: fetch report.assignedTo.email (prisma.report.findUnique)
   ├─▶ 4. NEW: if assignedTo exists → sendEmail(assignedTo.email, subject, body)
   │         │
   │         ▼
   │    aws.ts: sendEmail()  ──▶  sesClient.send(SendEmailCommand)  ──▶  AWS SES  ──▶  Admin's inbox
   │         │ (on throw: logger.error, swallow — never rethrow)
   │
   └─▶ 5. revalidatePath(`/report/${code}`)
   ▼
returns { success: true } regardless of email outcome
```

### Recommended Project Structure

No new files or folders — all changes are edits to existing files:

```
src/_shared/lib/aws.ts                    # add sendEmail()
src/_actions/public/message.action.ts     # call sendEmail() after createMessage
src/_modules/admin/admin.query.ts         # remove take: 50
```

### Pattern 1: Graceful-degradation external client wrapper

**What:** A helper function checks if the client singleton is `null` (no credentials) before attempting the call, returning early instead of throwing.
**When to use:** Any call to `sesClient` or `s3Client`.
**Example:**

```typescript
// Source: existing code, src/_shared/lib/aws.ts (pattern already established)
export async function getDownloadUrl(key: string) {
  if (!s3Client || !BUCKET_NAME) return null
  // ...
}
```

Apply the same shape to `sendEmail`:

```typescript
// New addition to src/_shared/lib/aws.ts
import { SendEmailCommand } from '@aws-sdk/client-ses'
import { logger } from '@/_shared/lib/logger'

export async function sendEmail(to: string, subject: string, htmlBody: string) {
  if (!sesClient || !SES_FROM_EMAIL) {
    logger.warn({ to }, 'SES não configurado — email não enviado')
    return
  }

  try {
    const command = new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: { Html: { Charset: 'UTF-8', Data: htmlBody } },
      },
    })
    await sesClient.send(command)
  } catch (error) {
    logger.error({ to, error }, 'Falha ao enviar email via SES')
  }
}
```

Note: `SendEmailCommand` shape verified against official AWS docs [CITED: docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/ses-examples-sending-email.html]. `Source`, `Destination.ToAddresses`, `Message.Subject`, `Message.Body.Html`/`.Text` are the correct field names for v3.

### Pattern 2: Fire-and-forget side effect in a Server Action

**What:** Non-critical async work (AI analysis, email) is invoked but never allowed to fail the primary mutation.
**When to use:** `sendMessageAction` calling the new email helper.
**Example:**

```typescript
// Source: existing code, src/_modules/report/report.data.ts (processAiAnalysis)
export async function processAiAnalysis(reportId: string, description: string, country?: string) {
  logger.debug({ reportId }, 'Iniciando análise de IA em background')
  try {
    // ... work
  } catch (error) {
    logger.error({ reportId, error }, 'Falha no processamento de IA em background')
  }
}
```

Because `sendEmail` itself already swallows its own errors (Pattern 1), `sendMessageAction` does not need an additional try/catch around the call — the helper guarantees it never throws. This is simpler than the AI-analysis pattern (which needed `after()` because AI calls are slow); SES calls are cheap enough to await inline before `return`, matching D-04's plain-language description ("log the error... and let sendMessageAction succeed anyway") without introducing `after()` for a single email call. If response latency becomes a concern, `after()` from `next/server` is the documented Next.js mechanism (already used in `ai-analysis.ts`) and can be substituted with no interface change.

### Anti-Patterns to Avoid

- **Rethrowing SES errors up to the action:** D-04 requires the action to succeed regardless of email outcome. Do not let `sendEmail`'s internal try/catch leak — never call `sendEmail` inside an unguarded `await` if the helper itself doesn't already catch (it does, per Pattern 1, so no extra guarding is needed in the caller).
- **Adding pagination UI/cursor logic for CHAT-04:** D-01 explicitly rejects this — just remove the `take: 50`. Do not build `skip`/`cursor` pagination.
- **Fetching `assignedTo.email` via the existing `getReportById` (admin.query.ts):** That function returns a fully decrypted, heavyweight report object meant for the admin detail page. `sendMessageAction` should do a minimal `prisma.report.findUnique({ where: { id }, select: { trackingCode: true, assignedTo: { select: { email: true } } } })` — extend the existing lookup (which already fetches `trackingCode` for the access check) rather than adding a second query or importing the admin module into a public action.

## Don't Hand-Roll

| Problem                      | Don't Build                          | Use Instead                                                                                                             | Why                                                                                                       |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Email MIME formatting        | Custom string templates for raw SMTP | `SendEmailCommand`'s structured `Message.Body.Html`/`.Text` fields                                                      | SES handles MIME encoding, charset headers, and delivery — hand-rolling raw email risks malformed headers |
| Retry/backoff on SES failure | Custom retry loop                    | None needed — per D-04, a single failed attempt is logged and the action proceeds; no retry required for this MVP scope | Requirement explicitly wants best-effort, not guaranteed delivery                                         |

**Key insight:** This phase's scope is intentionally minimal (per CONTEXT.md) — resist the urge to add retry logic, queueing, or templating engines. The existing graceful-degradation pattern (`s3Client` → `null` check) is the correct level of robustness for a TCC-scoped deployment.

## Common Pitfalls

### Pitfall 1: SES sandbox mode blocks unverified recipient addresses

**What goes wrong:** AWS accounts default to the SES sandbox, which only allows sending to verified email addresses/domains. If the assigned admin's email isn't verified in SES, `sesClient.send()` throws `MessageRejected` and the email silently fails (per D-04, this is caught and logged — but it will look like "SES is broken" during testing).
**Why it happens:** New AWS accounts start in sandbox mode by default; production access must be requested.
**How to avoid:** Document this in the plan as a manual verification step — the assigned admin's email address (and `SES_FROM_EMAIL`) must be verified in the AWS SES console before end-to-end testing. STATE.md already flags this: "AWS SES must be verified/activated in AWS console before Phase 3 (CHAT-07)... can be tested end-to-end."
**Warning signs:** `logger.error` output containing `MessageRejected` or `Email address not verified` during manual testing.

### Pitfall 2: No base URL environment variable exists for constructing the admin panel link

**What goes wrong:** D-03 requires the email body to "include a direct link to `/admin/report/[reportId]`" — but a full URL needs a scheme+host prefix (e.g., `https://anonprotect.example.com`), and no such env var (`NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, `AUTH_URL`, etc.) exists anywhere in the codebase (confirmed via grep across `src/` and `.env`).
**Why it happens:** The app has never needed to construct absolute URLs server-side before (all links are relative, rendered client-side via Next.js routing).
**How to avoid:** The plan must introduce a new env var (e.g., `NEXT_PUBLIC_APP_URL` or `APP_BASE_URL`) with a documented default/fallback (e.g., `http://localhost:3000` for local dev), read it in `aws.ts` or `message.action.ts`, and add it to deployment documentation. This is a small but necessary addition not mentioned in CONTEXT.md's canonical refs — flagging it here so the planner creates an explicit task for it.
**Warning signs:** Email link renders as `undefined/admin/report/...` or a bare relative path that doesn't work when clicked from an email client.

### Pitfall 3: `sendMessageAction`'s existing `prisma.report.findUnique` doesn't select `assignedTo`

**What goes wrong:** The current action only selects `trackingCode` for the access check. A naive implementation might add a second `prisma.report.findUnique` call for `assignedTo.email`, causing two DB round-trips per message send.
**Why it happens:** The existing code was written before this requirement existed.
**How to avoid:** Extend the existing `select` clause to include `assignedTo: { select: { email: true } }` in the same query — single round-trip, no schema/query duplication.
**Warning signs:** Code review shows two separate `prisma.report.findUnique({ where: { id: reportId } })` calls in the same action.

## Code Examples

### Extending the existing access-check query to also fetch assignee email

```typescript
// Source: extends existing pattern in src/_actions/public/message.action.ts
const report = await prisma.report.findUnique({
  where: { id: reportId },
  select: {
    trackingCode: true,
    assignedTo: { select: { email: true } },
  },
})

if (!report || report.trackingCode !== code) {
  throw new ActionError('Acesso negado')
}

await reportRepository.createMessage(reportId, content)

if (report.assignedTo?.email) {
  await sendEmail(
    report.assignedTo.email,
    'Nova mensagem no AnonProtect',
    `<p>Nova mensagem recebida no relatório ${code}.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/report/${reportId}">Acesse o painel para visualizar.</a></p>`
  )
}

revalidatePath(`/report/${code}`)
return { success: true, message: 'Mensagem enviada com sucesso!' }
```

### Removing the pagination cap

```typescript
// Source: src/_modules/admin/admin.query.ts, line 38 — before/after
// Before:
messages: { orderBy: { createdAt: 'asc' }, take: 50 },
// After:
messages: { orderBy: { createdAt: 'asc' } },
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact                                                                                  |
| ------------ | ---------------- | ------------ | --------------------------------------------------------------------------------------- |
| N/A          | N/A              | N/A          | This is a small surgical fix, not a technology migration — no "old vs new" axis applies |

**Deprecated/outdated:** None relevant — `@aws-sdk/client-ses` v3 is the current, actively maintained AWS SDK generation (v2 `aws-sdk` package is legacy and not used in this project).

## Assumptions Log

| #   | Claim                                                                                                                                                                     | Section                  | Risk if Wrong                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | A new env var (e.g. `NEXT_PUBLIC_APP_URL`) needs to be introduced to construct the absolute admin panel link                                                              | Pitfall 2, Code Examples | If wrong (e.g., project prefers a hardcoded domain or a different existing var was missed), planner creates an unnecessary env var — low risk, easily corrected in plan review                                       |
| A2  | Inline `await sendEmail(...)` (not wrapped in `next/server`'s `after()`) is sufficient to satisfy D-04's "fire-and-forget" framing, since `sendEmail` itself never throws | Pattern 2                | If the planner/user actually wants true background execution (response returns before SES completes), an `after()` wrapper should be added — low risk, both satisfy the functional requirement, only latency differs |

## Open Questions (RESOLVED)

1. **Should the email use HTML or plain text body?**
   - What we know: D-03 gives exact body copy in Portuguese; CONTEXT.md leaves format to Claude's discretion.
   - What's unclear: Nothing blocking — HTML with a clickable link is the natural choice given the requirement to "include a direct link."
   - RESOLVED: Use `Message.Body.Html` with a plain anchor tag; optionally include `Text` as a fallback for non-HTML email clients (SES supports both simultaneously in one `SendEmailCommand`). Adopted by plan 03-02.

2. **What value should the new base-URL env var default to in `.env`?**
   - What we know: No `.env.example` file exists in the repo to document required vars; `.env` itself is present but not readable per tool policy.
   - What's unclear: Whether the user already has a production domain to hardcode as fallback, or wants `http://localhost:3000` as the only default.
   - RESOLVED: Planner added `NEXT_PUBLIC_APP_URL` with a `http://localhost:3000` fallback for local dev; production value to be confirmed with user before deploy. Adopted by plan 03-02.

## Environment Availability

| Dependency                                    | Required By                | Available                                      | Version                                                           | Fallback                                                                                              |
| --------------------------------------------- | -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@aws-sdk/client-ses`                         | CHAT-07 email sending      | ✓                                              | `^3.1009.0` installed, `3.1078.0` latest [VERIFIED: npm registry] | —                                                                                                     |
| AWS SES verified sender/recipient             | CHAT-07 end-to-end testing | ✗ (unknown — must be confirmed in AWS console) | —                                                                 | Graceful degradation already built in (D-04): logs and continues if `sesClient` is null or send fails |
| `NEXT_PUBLIC_APP_URL` (or equivalent) env var | Admin panel link in email  | ✗ (does not exist in codebase)                 | —                                                                 | Must be added as part of this phase's plan; no fallback exists today                                  |

**Missing dependencies with no fallback:**

- Base URL env var for absolute links in emails — must be added (see Pitfall 2).

**Missing dependencies with fallback:**

- SES sandbox/verified-sender status — already has graceful degradation per D-04; testing may show "email not sent" in sandbox mode, but the action still succeeds.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Framework          | Vitest 4.0.18 + `@testing-library/react` + `vitest-mock-extended` (Prisma mocks)                                               |
| Config file        | `vitest.config.ts`                                                                                                             |
| Quick run command  | `npx vitest run src/_actions/public/message.action.test.ts src/_modules/admin/admin.query.test.ts src/_shared/lib/aws.test.ts` |
| Full suite command | `npm test`                                                                                                                     |

Note: `message.action.test.ts`, `admin.query.test.ts`, and `aws.test.ts` do not currently exist — confirmed no matches found for these filenames in the codebase during research. These are Wave 0 gaps.

### Phase Requirements → Test Map

| Req ID  | Behavior                                                                | Test Type | Automated Command                                           | File Exists?                                                             |
| ------- | ----------------------------------------------------------------------- | --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| CHAT-04 | `getReportById` returns >50 messages without truncation                 | unit      | `npx vitest run src/_modules/admin/admin.query.test.ts`     | ❌ Wave 0                                                                |
| CHAT-07 | `sendMessageAction` triggers `sendEmail` when `assignedTo` exists       | unit      | `npx vitest run src/_actions/public/message.action.test.ts` | ❌ Wave 0 (existing `message.action.ts` has no `.test.ts` sibling found) |
| CHAT-07 | `sendMessageAction` does NOT call `sendEmail` when `assignedTo` is null | unit      | `npx vitest run src/_actions/public/message.action.test.ts` | ❌ Wave 0 (same file)                                                    |
| CHAT-07 | `sendEmail` returns early (no throw) when `sesClient` is null           | unit      | `npx vitest run src/_shared/lib/aws.test.ts`                | ❌ Wave 0                                                                |
| CHAT-07 | `sendMessageAction` succeeds even when `sendEmail` throws internally    | unit      | `npx vitest run src/_actions/public/message.action.test.ts` | ❌ Wave 0 (same file)                                                    |

### Sampling Rate

- **Per task commit:** `npx vitest run <touched test files>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/_actions/public/message.action.test.ts` — covers CHAT-07 (email wiring, graceful degradation)
- [ ] `src/_modules/admin/admin.query.test.ts` — covers CHAT-04 (no message cap)
- [ ] `src/_shared/lib/aws.test.ts` — covers `sendEmail` helper (null client, SES throw, success path); follow existing mock patterns from `src/__tests__/mocks/prisma.ts` for structuring an SES client mock

## Security Domain

### Applicable ASVS Categories

| ASVS Category         | Applies | Standard Control                                                                                                                                                               |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| V2 Authentication     | no      | Not touched by this phase — `sendMessageAction` uses `actionClient` (unauthenticated by design, whistleblower flow)                                                            |
| V3 Session Management | no      | Not touched                                                                                                                                                                    |
| V4 Access Control     | yes     | Existing check (`report.trackingCode !== code` → `ActionError`) already gates message creation — no change needed, but must not be weakened when extending the `select` clause |
| V5 Input Validation   | yes     | Existing `sendMessageSchema` (Zod) validates `reportId`, `code`, `content` — email address is never user input (`assignedTo.email` comes from DB), so no new injection surface |
| V6 Cryptography       | no      | `Message.content` encryption already handled by `reportRepository.createMessage` (Phase 2, SEC-03) — unaffected by this phase                                                  |

### Known Threat Patterns for this stack

| Pattern                                                 | STRIDE                 | Standard Mitigation                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email header injection (CRLF injection into Subject/To) | Tampering              | Not applicable here — `to` is a DB-sourced admin email, `subject`/`body` are hardcoded/templated strings, not raw user input. If future work ever includes user-controlled content in email fields, use SES's structured `Message.Subject.Data`/`Message.Body.*.Data` fields (already the approach here) rather than raw string concatenation into SMTP headers — SES's SDK-level structured params inherently prevent header injection since there's no raw header string being built |
| Information disclosure via email content                | Information Disclosure | D-03 already mitigates this by design — no message content or PII in the email body, only a generic notification + link requiring authenticated admin panel access                                                                                                                                                                                                                                                                                                                     |
| Open redirect via link parameter                        | Tampering              | Not applicable — the link is a fixed internal path (`/admin/report/[reportId]`) built from a trusted server-side `reportId`, not a user-supplied redirect target                                                                                                                                                                                                                                                                                                                       |

## Sources

### Primary (HIGH confidence)

- [AWS SDK for JavaScript v3 — Sending email using Amazon SES](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/ses-examples-sending-email.html) - Official `SendEmailCommand` TypeScript example, param shapes (`Destination`, `Message`, `Source`), sandbox/verification requirements, size/recipient limits
- npm registry (`npm view @aws-sdk/client-ses version`) - Confirmed current published version `3.1078.0`, installed range `^3.1009.0` is current and non-deprecated

### Secondary (MEDIUM confidence)

- Codebase inspection (`src/_shared/lib/aws.ts`, `src/_actions/public/message.action.ts`, `src/_modules/admin/admin.query.ts`, `src/_modules/report/report.query.ts`, `src/_modules/report/report.data.ts`, `src/_actions/public/ai-analysis.ts`, `src/_actions/admin/report.action.ts`) - Confirmed existing patterns, cap locations, and absence of a base-URL env var (grep across `src/` and `.env*`)

### Tertiary (LOW confidence)

- None used — all findings verified against official docs or direct codebase inspection.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - no new dependencies; `@aws-sdk/client-ses` API verified against official AWS docs
- Architecture: HIGH - all integration points read directly from the existing codebase, not inferred
- Pitfalls: MEDIUM - SES sandbox behavior and missing base-URL env var confirmed via direct grep/inspection, but real-world AWS account sandbox status is unknown until manually verified in AWS console (already flagged as a project blocker in STATE.md)

**Research date:** 2026-07-02
**Valid until:** 2026-08-01 (30 days — stable AWS SDK API, low churn risk)
