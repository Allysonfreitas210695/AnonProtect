---
phase: quick-260706-jdi
plan: 01
subsystem: upload-security-and-image-config
tags: [security, rate-limiting, zod-validation, next-image, s3]
requires: []
provides:
  - checkUploadRateLimit
  - hardened-getPresignedUrlAction
affects:
  - next.config.ts
  - src/_shared/lib/ratelimit.ts
  - src/_actions/upload/s3.action.ts
  - src/_hooks/public/use-s3-upload.ts
tech-stack:
  added: []
  patterns:
    - 'Fail-open rate limiting via Upstash Ratelimit.slidingWindow, mirrored across report/message/upload limiters'
    - 'Zod enum whitelist + numeric .max() for untrusted anonymous input'
key-files:
  created: []
  modified:
    - next.config.ts
    - src/_shared/lib/ratelimit.ts
    - src/_shared/lib/ratelimit.test.ts
    - src/_actions/upload/s3.action.ts
    - src/_actions/upload/s3.action.test.ts
    - src/_hooks/public/use-s3-upload.ts
decisions:
  - '20 uploads/IP/hour for uploadRateLimit (vs 10/hour for reports) to accommodate multi-attachment submissions'
  - 'Whitelist: image/jpeg, image/png, image/webp, image/gif, application/pdf; 10MB max'
metrics:
  duration: '~25 min'
  completed: '2026-07-06'
---

# Phase quick-260706-jdi Plan 01: High-Severity Bug Fixes Summary

Fixed a production-breaking `next/image` config gap for S3 evidence photos and closed an anonymous-abuse gap in `getPresignedUrlAction` (no rate limiting, no fileType/fileSize validation) by adding `checkUploadRateLimit` and a Zod whitelist/size schema.

## What Was Built

### Task 1: next.config.ts remotePatterns

Added `images.remotePatterns` to `nextConfig`, scoped to the exact S3 virtual-hosted-style hostname (`{bucket}.s3.{region}.amazonaws.com`, https only, `pathname: '/**'`), built the same way `src/_shared/lib/aws.ts` builds `publicUrl`. `npm run build` succeeds.

### Task 2: checkUploadRateLimit (TDD)

Added `uploadRateLimit` (Upstash `Ratelimit.slidingWindow(20, '1 h')`, prefix `anonprotect_upload_ratelimit`) and `checkUploadRateLimit(identifier)` to `src/_shared/lib/ratelimit.ts`, mirroring `checkMessageRateLimit`'s fail-open try/catch exactly. Added 3 tests (not-configured, fail-open on Redis error, pass-through on success) following the existing `describe` block pattern. RED confirmed before implementation, GREEN after.

### Task 3: Hardened getPresignedUrlAction (TDD)

- `uploadSchema` now requires `fileType` to be one of `ALLOWED_UPLOAD_MIME_TYPES` (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`) via `z.enum`, and `fileSize` to be a positive number `<= MAX_UPLOAD_FILE_SIZE` (10MB).
- Action resolves client IP with the same precedence as `submitReportAction` (`cf-connecting-ip` → last `x-forwarded-for` entry → `127.0.0.1`), calls `checkUploadRateLimit(ip)`, and throws `'Limite de uploads atingido. Tente novamente mais tarde.'` before touching S3 if the limit is hit.
- `use-s3-upload.ts` now sends `fileSize: file.size` in the action payload.
- Test file's `actionClient` mock was rewritten to actually run `schema.safeParse(input)` and return a `validationErrors`-shaped result on failure, so schema rejection is exercised for real instead of bypassed by the old passthrough mock.
- 4 tests: valid request succeeds, non-whitelisted fileType rejected, oversized fileSize rejected, rate-limited request throws serverError and never calls `getSignedUrl`.

## Deviations from Plan

None — plan executed exactly as written, including the test-file mock rewrite the plan anticipated as a likely necessity.

## Verification

- `npm run build` — succeeds, no image config schema error
- `npx vitest run src/_shared/lib/ratelimit.test.ts src/_actions/upload/s3.action.test.ts` — 13/13 pass
- `npm test` (full suite) — 163/163 pass across 36 files
- `npm run lint` — 0 errors, 6 pre-existing warnings unrelated to files modified in this plan

## Commits

- `7ec77e8` fix(quick-260706-jdi): add images.remotePatterns for S3 evidence photos
- `a626556` test(quick-260706-jdi): add failing tests for checkUploadRateLimit
- `4e70c84` feat(quick-260706-jdi): add checkUploadRateLimit for anonymous uploads
- `b579d91` test(quick-260706-jdi): add failing tests for hardened getPresignedUrlAction
- `471f56b` feat(quick-260706-jdi): harden getPresignedUrlAction against anonymous abuse

## TDD Gate Compliance

Both TDD tasks (2 and 3) have confirmed RED commits (`test(...)`) preceding GREEN commits (`feat(...)`), with RED failures verified via `vitest run` output before implementation.

## Self-Check: PASSED

- FOUND: next.config.ts (remotePatterns present)
- FOUND: src/\_shared/lib/ratelimit.ts (checkUploadRateLimit exported)
- FOUND: src/\_actions/upload/s3.action.ts (checkUploadRateLimit imported/called, Zod whitelist)
- FOUND: src/\_hooks/public/use-s3-upload.ts (fileSize sent)
- FOUND commit 7ec77e8, a626556, 4e70c84, b579d91, 471f56b in git log
