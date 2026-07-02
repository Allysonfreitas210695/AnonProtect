---
phase: 03-chat
plan: 01
subsystem: aws-ses-email
tags: [aws-ses, email, notifications, chat]
requires: []
provides:
  - sendEmail(to, subject, htmlBody) helper in src/_shared/lib/aws.ts
affects:
  - src/_actions/public/message.action.ts (plan 03-02 will call sendEmail for CHAT-07)
tech-stack:
  added: []
  patterns:
    - 'Graceful degradation (D-04): sendEmail never throws — logs warn when unconfigured, logs error and swallows SES failures'
key-files:
  created: []
  modified:
    - src/_shared/lib/aws.ts
    - src/_shared/lib/aws.test.ts
decisions:
  - 'sendEmail uses structured SendEmailCommand params (Source/Destination/Message.Subject/Message.Body.Html) — no raw SMTP header string built, so header/CRLF injection is not applicable (T-03-01, accepted)'
metrics:
  duration: '~15 minutes'
  completed: 2026-07-02
---

# Phase 3 Plan 1: AWS SES sendEmail Helper Summary

Added a non-throwing `sendEmail(to, subject, htmlBody)` helper to `src/_shared/lib/aws.ts` that wraps the existing `sesClient` singleton with structured `SendEmailCommand` params, mirroring the graceful-degradation shape of `getDownloadUrl`.

## What Was Built

- `src/_shared/lib/aws.ts`: extended `@aws-sdk/client-ses` import to include `SendEmailCommand`, added `logger` import, and appended `export async function sendEmail(to, subject, htmlBody)`.
  - Guard clause returns early (after `logger.warn`) when `sesClient` is null or `SES_FROM_EMAIL` is empty — never calls SES, never throws.
  - When configured, builds a `SendEmailCommand` with `Source`, `Destination.ToAddresses`, `Message.Subject.Data` (UTF-8), `Message.Body.Html.Data` (UTF-8), and awaits `sesClient.send(command)`.
  - `try/catch` around the send call: on rejection, logs via `logger.error({ to, error }, ...)` and resolves normally — never rethrows, per D-04.
- `src/_shared/lib/aws.test.ts`: added `@aws-sdk/client-ses` mock (hoisted `sesSend` fn) and hoisted `AWS_SES_FROM_EMAIL` env var, plus a `describe('sendEmail', ...)` block with 3 tests — success path (asserts `send` called with structured params), error-swallowing path (`send` rejects, `sendEmail` still resolves), and a second configured-client resolve check. Existing `getDownloadUrl` tests untouched and still passing.

## Verification

- `npx vitest run src/_shared/lib/aws.test.ts` — 5/5 tests passing (2 existing `getDownloadUrl` + 3 new `sendEmail`)
- `npx eslint src/_shared/lib/aws.ts src/_shared/lib/aws.test.ts` — clean, no errors/warnings
- `npx tsc --noEmit` — no errors related to `aws.ts`
- `grep -c 'export async function sendEmail' src/_shared/lib/aws.ts` → 1
- `grep -c 'SendEmailCommand' src/_shared/lib/aws.ts` → 2 (import + usage)
- No `throw` statement inside `sendEmail` body (verified by reading the function and by the error-swallowing test)

## Deviations from Plan

None - plan executed exactly as written.

## Threat Model Notes

- T-03-01 (Tampering, header/CRLF injection via Subject/To) — accepted disposition confirmed: `sendEmail` uses SES structured `Message.*.Data` params, no raw SMTP string concatenation, so injection via `to`/`subject`/`htmlBody` is not exploitable through this helper.
- T-03-02 (DoS via SES send failure/latency) — mitigated: helper swallows all send errors and never throws, so a caller (e.g. `sendMessageAction` in plan 03-02) cannot fail due to email delivery issues.

## Self-Check: PASSED

- FOUND: src/\_shared/lib/aws.ts (contains `sendEmail`)
- FOUND: src/\_shared/lib/aws.test.ts (contains `sendEmail` describe block)
- FOUND commit 9d5ce99 (feat(03-01): add sendEmail helper to aws.ts)
- FOUND commit 42510b9 (test(03-01): add sendEmail unit tests)
