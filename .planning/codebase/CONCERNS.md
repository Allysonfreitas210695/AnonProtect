# Codebase Concerns

**Analysis Date:** 2026-06-30

---

## Known Bugs

### Tracking Code Validator / Generator Mismatch

- **Symptoms:** `isValidTrackingCode()` rejects all valid tracking codes produced by the app
- **Files:** `src/_shared/utils/validators.ts` (expects `RPT-[A-Z0-9]{6}`), `src/_shared/utils/tracking.ts` (generates `AP-YYYY-XXXX`)
- **Trigger:** Any code path calling `isValidTrackingCode()` on a real tracking code will return `false`. A test comment at `src/_shared/utils/validators.test.ts:28` explicitly flags this: `// This is the new format, but validator expect RPT-`
- **Workaround:** The validator is not wired into the public tracking flow, so reports can still be looked up. The validator function itself is dead/incorrect.

### Duplicate Filter Parameter Overwrites Silently

- **Symptoms:** The `country` parameter in `getReportsPaginated()` is silently overwritten when `filterCountry` is also provided
- **Files:** `src/_modules/admin/admin.query.ts:103-107`
- **Trigger:** Both `country` and `filterCountry` set `where.country`, with `filterCountry` applied last. The `country` parameter is unreachable when `filterCountry` is set.
- **Workaround:** None; callers relying on `country` while passing `filterCountry` get wrong results silently.

---

## Security Considerations

### No Route-Level Middleware for Admin Protection

- **Risk:** Admin routes have no Next.js middleware protecting them. There is no `src/middleware.ts`. Protection depends entirely on layout-level session checks and server action clients.
- **Files:** `src/app/[locale]/(admin)/layout.tsx`, `src/_shared/utils/safe-action.ts`
- **Current mitigation:** `authActionClient` / `adminActionClient` / `supervisorActionClient` enforce role checks per action. Layout presumably calls `getCurrentUser()`.
- **Recommendations:** Add `src/middleware.ts` using `auth()` from NextAuth to redirect unauthenticated requests to `/admin/*` at the edge, before any server component renders.

### Turnstile Bot Protection is Silently Disabled Without Env Var

- **Risk:** If `TURNSTILE_SECRET_KEY` is not set, `verifyTurnstile()` returns `true` unconditionally. Additionally, `parsedInput.turnstileToken` is optional, so a caller omitting the token field entirely bypasses the check entirely (the `if (parsedInput.turnstileToken)` guard is skipped when token is absent).
- **Files:** `src/_actions/public/report.action.ts:14`, `src/_actions/public/report.action.ts:39`
- **Current mitigation:** Rate limiting still applies if Redis is configured.
- **Recommendations:** Require `turnstileToken` to be non-empty in `reportSchema` when `TURNSTILE_SECRET_KEY` is set. Log a warning at startup if neither Redis nor Turnstile is configured.

### Rate Limiting Uses Raw `x-forwarded-for` Header

- **Risk:** `x-forwarded-for` can contain a comma-separated list (e.g., `1.2.3.4, proxy1`). The entire string is used as the rate limit key, which can be spoofed by a client sending an arbitrary header value if the deployment is not behind a trusted reverse proxy that overwrites this header.
- **Files:** `src/_actions/public/report.action.ts:32`, `src/_components/shared/rate-limit-guard.tsx:11`
- **Current mitigation:** 10 reports/hour sliding window via Upstash.
- **Recommendations:** Parse only the first IP from the header: `ip.split(',')[0].trim()`. In production, configure the reverse proxy to set a trusted single-value header.

### Forgot Password Page is Non-Functional (Stub)

- **Risk:** Users who lose their password have no recovery mechanism. The UI falsely presents a success state without sending any email.
- **Files:** `src/app/[locale]/(auth)/forgot-password/page.tsx:21` — contains comment `// Simulação de envio`
- **Current mitigation:** None.
- **Recommendations:** Implement password reset using NextAuth email provider or a transactional email service (e.g., Resend). Generate a time-limited reset token, store it in `VerificationToken`, and send an email.

### Self-Registration Creates SUPERVISOR Accounts Without Invitation

- **Risk:** The `/register` route is publicly accessible and uses `actionClient` (unauthenticated). Anyone can create a `SUPERVISOR`-role account.
- **Files:** `src/_actions/public/register.action.ts:24` — hardcodes `role: 'SUPERVISOR'`
- **Current mitigation:** Admin routes still require `supervisorActionClient` to pass.
- **Recommendations:** Either remove the public registration route entirely and create accounts via an admin-only invite flow, or require an invite token to be validated before account creation.

### Message Sending is Unauthenticated with Weak Authorization

- **Risk:** `sendMessageAction` uses the unauthenticated `actionClient`. Any caller who knows a `reportId` (UUID) and `code` can append messages to any report — there is no proof of tracking code ownership.
- **Files:** `src/_actions/public/message.action.ts:14`
- **Current mitigation:** UUIDs are hard to guess. The `code` parameter is required but only used for cache revalidation — it is not validated against the `reportId`.
- **Recommendations:** Validate that `code` matches `reportId` via a DB lookup before creating the message.

### Messages and Investigation Notes Are Stored Unencrypted

- **Risk:** `Message.content` and `InvestigationNote.content` are stored as plaintext in PostgreSQL. A DB compromise exposes all communication and internal investigation details even though report descriptions are AES-256-GCM encrypted.
- **Files:** `prisma/schema.prisma:162-170` (Message), `prisma/schema.prisma:187-199` (InvestigationNote), `src/_modules/report/report.data.ts:55-65`
- **Current mitigation:** Report descriptions are encrypted via `src/_shared/lib/crypto.ts`.
- **Recommendations:** Apply `encrypt()`/`decrypt()` to message and note content before persistence, consistent with how `description` is handled.

### Docker Compose Uses Hardcoded Weak Credentials; Redis Has No Password

- **Risk:** `POSTGRES_PASSWORD: anonprotect` is hardcoded in `docker-compose.yml`. Redis runs with no authentication (`requirepass` not set).
- **Files:** `docker-compose.yml:6-8`, `docker-compose.yml:19-30`
- **Current mitigation:** Only affects local/dev compose; production uses `env_file: .env`.
- **Recommendations:** Use `${POSTGRES_PASSWORD}` env substitution in compose. Add Redis password via `command: redis-server --requirepass ${REDIS_PASSWORD}` and update Upstash client config accordingly.

---

## Tech Debt

### `priority` Field is Untyped String (Not an Enum)

- **Issue:** `Report.priority` is `String?` in the Prisma schema despite the AI returning typed `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'` values. No DB-level constraint enforces valid values.
- **Files:** `prisma/schema.prisma:116`, `src/_shared/lib/ai.ts:67`
- **Impact:** Invalid priority values can be stored; query filters on priority are untyped.
- **Fix approach:** Create a `ReportPriority` enum in `schema.prisma` mirroring the AI schema, run `prisma migrate dev`, and update all references.

### JWT Callback Hits Database on Every Token Refresh

- **Issue:** The `jwt` callback in `src/_shared/lib/auth.ts:54-66` calls `prisma.user.findUnique` on every JWT use to read `role` and `country`. This adds a DB round-trip per authenticated request.
- **Files:** `src/_shared/lib/auth.ts:57`
- **Impact:** Performance degrades linearly with authenticated traffic. Under load this can exhaust connection pool.
- **Fix approach:** Cache role/country in the token at sign-in time and only re-fetch when the token is first created (check `!token.role`). Invalidate via `trigger: 'update'` when role changes.

### `generateTrackingCode()` Has Low Entropy and No Collision Check

- **Issue:** `Math.random().toString(36).substring(2, 6)` produces only 4 base-36 chars (~1.7M combinations per year). `Math.random()` is not cryptographically secure. No uniqueness check is performed before inserting.
- **Files:** `src/_shared/utils/tracking.ts`
- **Impact:** Risk of collisions as report volume grows. Codes are enumerable by brute force (~1.7M attempts/year).
- **Fix approach:** Use `crypto.randomBytes(6).toString('base36')` or similar CSPRNG with a DB uniqueness retry loop (attempt insert, catch unique constraint, retry).

### Mixed Logging: `console.*` and `logger` (Pino) Used Together

- **Issue:** Structured pino `logger` is used in some server actions (`src/_actions/public/report.action.ts`) but `console.error` / `console.warn` is used in `src/_shared/lib/ai.ts`, `src/_modules/admin/admin.query.ts`, `src/_actions/admin/profile.action.ts`, and others.
- **Files:** `src/_shared/lib/ai.ts:125,131,140`, `src/_modules/admin/admin.query.ts:68,76`, `src/_shared/utils/safe-action.ts:13`
- **Impact:** Production log aggregation misses events emitted via `console.*`.
- **Fix approach:** Replace all `console.error`/`console.warn`/`console.log` in non-test code with `logger.error`/`logger.warn`/`logger.info` from `src/_shared/lib/logger.ts`.

### Redundant Role Check in `deleteReportAction`

- **Issue:** `deleteReportAction` uses `adminActionClient` (which already enforces `ADMIN` role) and then repeats `if (user.role !== 'ADMIN')` inside the action body.
- **Files:** `src/_actions/admin/report.action.ts:106-119`
- **Impact:** No functional bug, but indicates uncertainty about what the action client enforces. Will cause confusion during maintenance.
- **Fix approach:** Remove the redundant inner role check.

### `@ts-expect-error` on Google Search Beta Tool

- **Issue:** Two suppressions in `src/_shared/lib/ai.ts:31` and `src/_shared/lib/ai.ts:84` suppress type errors for `googleSearch` tool. When the feature is stabilized and typed, the suppressions will turn into TypeScript errors (a `@ts-expect-error` on a line that is no longer an error becomes a compile failure).
- **Files:** `src/_shared/lib/ai.ts:31,84`
- **Fix approach:** Track `@google/generative-ai` release notes. When types are updated, remove the suppression and use the proper typed field.

---

## Missing Critical Features

### Terms of Service Page

- **Problem:** `src/app/[locale]/(auth)/register/page.tsx:112` links to `/terms-of-service` but no such route exists in `src/app/[locale]/(public)/`. Only `privacy-policy` is implemented.
- **Blocks:** Regulatory compliance (linked in registration flow). Users clicking the link hit a 404.

### Password Recovery Email Infrastructure

- **Problem:** No email sending capability exists. The forgot-password page is a stub. No SMTP/transactional email service is integrated.
- **Blocks:** Any user who loses credentials is locked out permanently.

---

## Performance Bottlenecks

### `getPublicStats()` Fetches All Report Timestamps for Timeline

- **Problem:** `src/_modules/report/report.query.ts:59-66` fetches every `createdAt` from all reports in the past year into memory for client-side grouping.
- **Files:** `src/_modules/report/report.query.ts:59`
- **Cause:** Manual grouping by month in TypeScript instead of a DB-level `date_trunc` / `GROUP BY` query.
- **Improvement path:** Replace with a Prisma `$queryRaw` using `date_trunc('month', created_at)` and `COUNT(*)` — pushes aggregation to PostgreSQL.

### Signed URL Generation Serializes Per Attachment

- **Problem:** `src/_modules/admin/admin.query.ts:55-60` calls `getDownloadUrl()` for every attachment sequentially inside a `Promise.all` on the attachment list, but the outer call is still awaited one report at a time.
- **Files:** `src/_modules/admin/admin.query.ts:55`
- **Cause:** `Promise.all` is used but only within the single report's attachments; if paginated calls retrieve many reports each with multiple attachments, signed URL generation multiplies.
- **Improvement path:** Consider pre-generating signed URLs at upload time and storing them with a TTL, or batching S3 presign calls.

---

## Fragile Areas

### Decryption Silently Falls Back to Ciphertext

- **Files:** `src/_modules/admin/admin.query.ts:62-77`, `src/_modules/report/report.query.ts:31-36`
- **Why fragile:** If `ENCRYPTION_KEY` is rotated or absent, decryption silently fails and the raw ciphertext is returned to the caller. The UI will then display garbage data to admins/reporters without any visible error.
- **Safe modification:** Add a visible sentinel in the returned value (e.g., `'[DECRYPT_FAILED]'`) so UIs can display a user-friendly error. Log the failure with a report ID for ops visibility.
- **Test coverage:** No tests for the key-rotation / missing-key decryption fallback path.

### AI Analysis Passes Plaintext Description to External API

- **Files:** `src/_actions/public/report.action.ts:67`
- **Why fragile:** `triggerAiAnalysis()` receives `parsedInput.description` (plaintext) after it has been encrypted for DB storage. This is intentional, but means unredacted PII from the report is sent to Google Gemini before LGPD redaction occurs. Redaction is the _output_ of the AI call, not a pre-condition.
- **Safe modification:** Document this explicitly in `ai-analysis.ts`. Consider whether LGPD compliance requires consent or data processing agreements with Google before sending data to their API.

### `messages` Relation Hard-Capped at 50 Records

- **Files:** `src/_modules/admin/admin.query.ts:38` — `take: 50`
- **Why fragile:** Long-running investigations will silently miss messages beyond the 50th. No pagination or indicator is provided to the UI.
- **Safe modification:** Add a message count field to the response and implement pagination in the message thread UI.

---

## Test Coverage Gaps

### Forgot Password / Password Reset Flow

- **What's not tested:** The entire reset flow (because it's a stub). No tests exist for token generation, email delivery, or token expiry.
- **Files:** `src/app/[locale]/(auth)/forgot-password/page.tsx`
- **Risk:** When implemented, untested code ships to production handling credential recovery.
- **Priority:** High

### Tracking Code Collision and Generation

- **What's not tested:** No test verifies uniqueness of generated codes or behavior when a collision occurs.
- **Files:** `src/_shared/utils/tracking.ts`, `src/__tests__/` (absent)
- **Risk:** Silent duplicate tracking code insertion would be caught by DB unique constraint but not handled gracefully in `createReport`.
- **Priority:** Medium

### Middleware / Route Protection

- **What's not tested:** No integration tests verify that unauthenticated requests to `/admin/*` are redirected. This is a gap because there is also no middleware file.
- **Risk:** A regression could expose admin pages to unauthenticated users.
- **Priority:** High

### Message Authorization

- **What's not tested:** No test verifies that message sending requires proof of tracking code ownership.
- **Files:** `src/_actions/public/message.action.ts`
- **Risk:** Security regression if the code/reportId relationship is never validated.
- **Priority:** High

---

_Concerns audit: 2026-06-30_
