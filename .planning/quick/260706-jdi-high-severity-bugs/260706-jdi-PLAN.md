---
phase: quick-260706-jdi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - next.config.ts
  - src/_shared/lib/ratelimit.ts
  - src/_shared/lib/ratelimit.test.ts
  - src/_actions/upload/s3.action.ts
  - src/_actions/upload/s3.action.test.ts
  - src/_hooks/public/use-s3-upload.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - 'next/image renders S3-hosted evidence photos in production without a hostname-not-configured error'
    - 'Anonymous upload requests are rate-limited per IP the same way report submission is'
    - 'Anonymous upload requests are rejected when fileType is outside the allowed whitelist or fileSize exceeds the limit'
  artifacts:
    - path: 'next.config.ts'
      provides: 'images.remotePatterns entry matching the S3 virtual-hosted-style hostname'
      contains: 'remotePatterns'
    - path: 'src/_shared/lib/ratelimit.ts'
      provides: 'uploadRateLimit + checkUploadRateLimit, mirroring checkRateLimit/checkMessageRateLimit'
      contains: 'checkUploadRateLimit'
    - path: 'src/_actions/upload/s3.action.ts'
      provides: 'getPresignedUrlAction with IP rate limiting + Zod whitelist/size validation'
      contains: 'checkUploadRateLimit'
  key_links:
    - from: 'src/_actions/upload/s3.action.ts'
      to: 'src/_shared/lib/ratelimit.ts'
      via: 'checkUploadRateLimit(ip) call before generating the presigned URL'
      pattern: 'checkUploadRateLimit'
    - from: 'src/_hooks/public/use-s3-upload.ts'
      to: 'src/_actions/upload/s3.action.ts'
      via: 'fileSize now passed in the getPresignedUrlAction payload'
      pattern: 'fileSize: file.size'
---

<objective>
Fix two high-severity bugs found in code audit:

1. `next.config.ts` has no `images.remotePatterns`, so `next/image` in `evidence-gallery.tsx` breaks in production for S3-hosted evidence photos.
2. `getPresignedUrlAction` (`src/_actions/upload/s3.action.ts`) is public, unauthenticated, unrate-limited, and accepts any `fileType`/size — allowing S3 bucket abuse by anonymous visitors.

Purpose: Close a production-breaking image bug and an anonymous-abuse security gap without breaking the intentionally anonymous (no-login) report/upload flow.
Output: `next.config.ts` with correct `remotePatterns`; a new `checkUploadRateLimit` in `src/_shared/lib/ratelimit.ts` following the existing `checkRateLimit`/`checkMessageRateLimit` pattern; `getPresignedUrlAction` hardened with IP rate limiting + Zod whitelist/size validation; `use-s3-upload.ts` updated to send `fileSize`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@src/_actions/upload/s3.action.ts
@src/_actions/upload/s3.action.test.ts
@src/_shared/lib/aws.ts
@src/_shared/lib/ratelimit.ts
@src/_shared/lib/ratelimit.test.ts
@src/_actions/public/report.action.ts
@src/_hooks/public/use-s3-upload.ts
@next.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Configure next/image remotePatterns for the S3 bucket</name>
  <files>next.config.ts</files>
  <action>
    Add an `images.remotePatterns` array to `nextConfig` in next.config.ts. Build the hostname the same way `src/_shared/lib/aws.ts` builds `publicUrl` (virtual-hosted-style: `{bucket}.s3.{region}.amazonaws.com`), reading `process.env.AWS_S3_BUCKET_NAME` and `process.env.AWS_REGION` (fallback `'us-east-1'` to match `aws.ts`'s existing fallback). Use `protocol: 'https'`, `hostname: \`${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com\``, and `pathname: '/**'` to allow any object key under `evidence/`. Keep `output: 'standalone'` and the `withNextIntl` wrapper unchanged.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -30</automated>
  </verify>
  <done>next.config.ts exports remotePatterns containing the S3 virtual-hosted-style hostname; build succeeds (or fails only for unrelated/expected reasons like missing DATABASE_URL, not a config schema error).</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Add checkUploadRateLimit to the shared rate limiter</name>
  <files>src/_shared/lib/ratelimit.ts, src/_shared/lib/ratelimit.test.ts</files>
  <behavior>
    - Test 1: `checkUploadRateLimit` returns `{ success: true, limit: 0, remaining: 0, reset: 0 }` when Redis env vars are absent (matches `checkRateLimit`/`checkMessageRateLimit` fail-open-when-unconfigured behavior).
    - Test 2: `checkUploadRateLimit` fails open (`success: true`) when Redis is configured but `limit()` rejects.
    - Test 3: `checkUploadRateLimit` passes through the Redis result unchanged when `limit()` resolves normally.
  </behavior>
  <action>
    In `src/_shared/lib/ratelimit.ts`, add a new `uploadRateLimit` Ratelimit instance (same `redis ? new Ratelimit({...}) : null` pattern as `messageRateLimit`) using `Ratelimit.slidingWindow(20, '1 h')` (20 uploads per IP per hour — generous for a multi-attachment report submission, tight enough to block automated bucket-filling abuse) and `prefix: 'anonprotect_upload_ratelimit'`. Add `checkUploadRateLimit(identifier: string)` mirroring `checkMessageRateLimit`'s try/catch fail-open structure exactly (same JSDoc style, same log message `'Rate limit check failed, failing open'`). Add the three behavior tests to `ratelimit.test.ts` following the existing `describe('checkMessageRateLimit', ...)` block structure and mocks (no new mocks needed — reuse the existing `mockLimit`/`vi.mock` setup at the top of the file).
  </action>
  <verify>
    <automated>npx vitest run src/_shared/lib/ratelimit.test.ts</automated>
  </verify>
  <done>checkUploadRateLimit exported from ratelimit.ts; all 3 new tests plus existing tests pass.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Harden getPresignedUrlAction with rate limiting, mime whitelist, and size limit</name>
  <files>src/_actions/upload/s3.action.ts, src/_actions/upload/s3.action.test.ts, src/_hooks/public/use-s3-upload.ts</files>
  <behavior>
    - Test 1: valid request (whitelisted `fileType`, `fileSize` under the max) still returns `{ url, key, publicUrl }` as before (existing test, updated to pass `fileSize`).
    - Test 2: request with a `fileType` outside the whitelist (e.g. `'application/x-msdownload'`) is rejected by schema validation (result has `validationErrors`, no `data`).
    - Test 3: request with `fileSize` exceeding the max is rejected by schema validation.
    - Test 4: when `checkUploadRateLimit` resolves `{ success: false, ... }`, the action throws/returns a Portuguese `serverError` (e.g. `'Limite de uploads atingido. Tente novamente mais tarde.'`) and never calls `getSignedUrl`.
  </behavior>
  <action>
    In `src/_actions/upload/s3.action.ts`: define `ALLOWED_UPLOAD_MIME_TYPES` as a readonly tuple of common image types (`'image/jpeg'`, `'image/png'`, `'image/webp'`, `'image/gif'`) plus `'application/pdf'`, and `MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024` (10MB). Change `uploadSchema` to `z.object({ fileName: z.string().min(1, 'Nome do arquivo é obrigatório'), fileType: z.enum(ALLOWED_UPLOAD_MIME_TYPES, { message: 'Tipo de arquivo não permitido' }), fileSize: z.number().positive('Tamanho de arquivo inválido').max(MAX_UPLOAD_FILE_SIZE, 'Arquivo excede o tamanho máximo permitido (10MB)') })`. Import `headers` from `next/headers`, `checkUploadRateLimit` from `@/_shared/lib/ratelimit`, and `logger` from `@/_shared/lib/logger`. At the top of the action handler (before building the S3 command), resolve the IP using the exact same precedence as `submitReportAction` in `report.action.ts` (`cf-connecting-ip` header, then last entry of `x-forwarded-for`, then `'127.0.0.1'`), call `checkUploadRateLimit(ip)`, and if `!success` throw `new Error('Limite de uploads atingido. Tente novamente mais tarde.')`. Keep the existing `s3Client` null-check and the rest of the presigned-URL logic unchanged. Update `src/_actions/upload/s3.action.test.ts`: pass `fileSize` in the existing successful-request test call, and add the three new test cases described in `<behavior>` (mock `checkUploadRateLimit` via `vi.mock('@/_shared/lib/ratelimit', ...)` for test 4; rely on real Zod validation for tests 2-3 since the mocked `actionClient.schema()` in the test file currently bypasses validation — if so, replace the test-file's `actionClient` mock `schema()` to actually run `uploadSchema.safeParse(input)` and return a `validationErrors`-shaped result on failure, matching how `next-safe-action` behaves, keeping the mock's action-invocation behavior identical to today for valid input). Finally, update `src/_hooks/public/use-s3-upload.ts`'s `uploadFiles` to pass `fileSize: file.size` in the `getPresignedUrlAction(...)` call alongside the existing `fileName`/`fileType`.
  </action>
  <verify>
    <automated>npx vitest run src/_actions/upload/s3.action.test.ts</automated>
  </verify>
  <done>getPresignedUrlAction rejects non-whitelisted fileType and oversized fileSize via Zod, rate-limits by IP using checkUploadRateLimit before issuing a presigned URL, and use-s3-upload.ts sends fileSize; all tests in s3.action.test.ts pass.</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary                                      | Description                                                                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Anonymous browser -> getPresignedUrlAction    | Fully untrusted input (fileName, fileType, fileSize) from any internet visitor, no session required (report flow is intentionally anonymous) |
| Anonymous browser -> S3 PUT via presigned URL | Client uploads raw bytes directly to S3 using the URL returned by the action                                                                 |

## STRIDE Threat Register

| Threat ID  | Category                   | Component                            | Disposition | Mitigation Plan                                                                                                          |
| ---------- | -------------------------- | ------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| T-quick-01 | Denial of Service          | getPresignedUrlAction                | mitigate    | Add `checkUploadRateLimit` (20/IP/hour via Upstash sliding window), same fail-open pattern as report/message rate limits |
| T-quick-02 | Tampering                  | getPresignedUrlAction fileType input | mitigate    | Zod `z.enum(ALLOWED_UPLOAD_MIME_TYPES)` restricts to images + PDF; rejects arbitrary/executable content types            |
| T-quick-03 | Repudiation/Resource abuse | getPresignedUrlAction fileSize input | mitigate    | Zod `.max(MAX_UPLOAD_FILE_SIZE)` caps declared size at 10MB before a presigned URL is issued                             |
| T-quick-04 | Information Disclosure     | next/image loading S3 evidence URLs  | mitigate    | `images.remotePatterns` scoped to the exact S3 virtual-hosted-style hostname (https only, no wildcard domains)           |
| T-quick-SC | Tampering                  | npm installs                         | accept      | No new package installs in this plan                                                                                     |

</threat_model>

<verification>
- `npm run build` succeeds with next.config.ts remotePatterns present (no Next.js image config schema error)
- `npx vitest run src/_shared/lib/ratelimit.test.ts src/_actions/upload/s3.action.test.ts` all pass
- `npm run lint` passes on modified files
</verification>

<success_criteria>

- Evidence gallery photos hosted on the configured S3 bucket render via next/image in production without a "hostname not configured" error
- Anonymous upload requests are rate-limited per IP (fails closed with a Portuguese error message once the limit is hit, fails open if Redis is unreachable/unconfigured, matching existing rate-limit conventions)
- Anonymous upload requests with a non-whitelisted fileType or oversized fileSize are rejected before a presigned URL is generated
  </success_criteria>

<output>
Create `.planning/quick/260706-jdi-high-severity-bugs/260706-jdi-SUMMARY.md` when done
</output>
