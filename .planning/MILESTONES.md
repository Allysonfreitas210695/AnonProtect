# Milestones

## v1.0 MVP (Shipped: 2026-07-02)

**Phases completed:** 5 phases (Bug Fixes, Security Hardening, Chat, Password Recovery, Performance & Quality), 10 plans, 27/27 v1 requirements

**Key accomplishments:**

- Fixed 4 critical bugs in the whistleblower/admin flow: tracking-code validator regex mismatch, silently-overridden country filter, missing `/terms-of-service` page, redundant role check in `deleteReportAction`
- Closed 6 security gaps: blocked public SUPERVISOR self-registration, message/reportId ownership validation, AES-256-GCM encryption of `Message.content` and `InvestigationNote.content`, Turnstile fail-closed on missing secret, Cloudflare-aware rate limiting (`cf-connecting-ip` + rightmost XFF fallback)
- Shipped a complete bidirectional chat between whistleblowers and admins: full uncapped thread, AWS SES email notifications, per-IP rate limiting (10/min) and a 1000-message-per-report hard cap to close the abuse surface opened by the new write/email path
- Activated password recovery via AWS SES: CSPRNG single-use reset tokens with 1-hour expiry, invalidated on first use
- Closed performance and quality debt: JWT-cached `role`/`country` (no per-request DB query), SQL aggregation (`date_trunc`+`GROUP BY`) for public stats, CSPRNG tracking-code generation with collision retry, `ReportPriority` as a DB-level Prisma enum, `[DECRYPT_FAILED]` sentinel on all decrypt paths (public and admin), structured `pino` logging server-side plus a client-safe logger shim eliminating all remaining `console.*` calls

---
