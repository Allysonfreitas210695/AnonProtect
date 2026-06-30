# External Integrations

**Analysis Date:** 2026-06-30

## APIs & External Services

**AI / LLM:**

- Google Gemini 2.5 Flash - Report auto-analysis (category, priority, LGPD PII redaction) and whistleblower conversational assistant
  - SDK/Client: `@google/generative-ai` 0.24.1
  - Auth: `GOOGLE_GENERATIVE_AI_API_KEY`
  - Implementation: `src/_shared/lib/ai.ts` — `getChatCompletion()` (chat), `analyzeReport()` (batch)
  - Feature: googleSearch beta tool enabled on all model calls
  - Degrades gracefully: returns `null` when key absent

**Bot Protection:**

- Cloudflare Turnstile - Human verification on public report submission
  - SDK/Client: `@marsidev/react-turnstile` 1.4.2 (widget), native `fetch` for server-side verify
  - Verify endpoint: `https://challenges.cloudflare.com/turnstile/v0/siteverify`
  - Auth: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client), `TURNSTILE_SECRET_KEY` (server)
  - Implementation: `src/_actions/public/report.action.ts` — `verifyTurnstile()`
  - Degrades gracefully: verification skipped when `TURNSTILE_SECRET_KEY` absent

## Data Storage

**Databases:**

- PostgreSQL - Primary datastore for all application data
  - Connection: `DATABASE_URL`
  - Client: Prisma 7.4.1 with `@prisma/adapter-pg` + `pg` connection pool
  - Singleton: `src/_shared/lib/prisma.ts`
  - Schema: `prisma/schema.prisma`
  - Generated client: `src/_generated/prisma/` (do not edit manually)
  - Migrations: `prisma/migrations/`
  - Seed: `prisma/seed.ts` (creates admin@sistema.com / supervisor@sistema.com)

**File Storage:**

- AWS S3 - Attachment uploads for whistleblower evidence files
  - SDK/Client: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
  - Auth: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
  - Config: `AWS_S3_BUCKET_NAME`
  - Implementation: `src/_shared/lib/aws.ts` — `s3Client`, `getDownloadUrl()`
  - Degrades gracefully: `s3Client` is `null` when credentials absent

**Caching / Rate Limiting:**

- Upstash Redis - Sliding window rate limiting (10 reports/IP/hour)
  - SDK/Client: `@upstash/redis` 1.37.0, `@upstash/ratelimit` 2.0.8
  - Auth: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Implementation: `src/_shared/lib/ratelimit.ts` — `reportRateLimit`, `checkRateLimit()`
  - Prefix key: `anonprotect_ratelimit`
  - Degrades gracefully: unlimited when Redis env vars absent

## Authentication & Identity

**Auth Provider:**

- NextAuth v5 (beta) - Session management, JWT strategy
  - Implementation: `src/_shared/lib/auth.ts`
  - Strategy: JWT (not database sessions)
  - Session exposes: `user.id`, `user.role`, `user.country`

**Identity Providers:**

- Google OAuth 2.0
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Adapter: `@auth/prisma-adapter` writes OAuth accounts to `accounts` table
- Credentials (email + password)
  - Password hashing: `bcryptjs`
  - Validation: `loginSchema` from `src/_schemas/auth.ts`

**RBAC:**

- Two roles: `ADMIN`, `SUPERVISOR` (defined in Prisma enum `UserRole`)
- Enforced in Server Action clients (`src/_shared/utils/safe-action.ts`):
  - `authActionClient` — any authenticated user
  - `adminActionClient` — `ADMIN` role only
  - `supervisorActionClient` — `SUPERVISOR` or `ADMIN`

## Email

**Provider:**

- AWS SES - Transactional email
  - SDK/Client: `@aws-sdk/client-ses`
  - Auth: same AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
  - Config: `AWS_SES_FROM_EMAIL`
  - Implementation: `src/_shared/lib/aws.ts` — `sesClient`
  - Degrades gracefully: `sesClient` is `null` when credentials absent

## Monitoring & Observability

**Error Tracking:**

- Not detected (no Sentry, Datadog, or similar SDK found)

**Logs:**

- Pino structured logging (`src/_shared/lib/logger.ts`)
  - Dev: pino-pretty with colorized output, `LOG_LEVEL` env var
  - Production: JSON output to stdout

## Encryption

**At-Rest Encryption:**

- `Report.description` encrypted with AES-256-GCM via Node.js built-in `node:crypto`
  - Implementation: `src/_shared/lib/crypto.ts` — `encrypt()`, `decrypt()`
  - Key: `ENCRYPTION_KEY` — must be a 32-byte hex string (64 characters)
  - Format: `iv:authTag:ciphertext` (hex-encoded, colon-delimited)

## CI/CD & Deployment

**Hosting:**

- Docker containers (multi-stage `Dockerfile`, `docker-compose.yml`)
- Next.js standalone output on port 3000

**CI Pipeline:**

- Not detected (no GitHub Actions, CircleCI, or similar config found)

**Pre-commit:**

- Husky + lint-staged (`.lintstagedrc.json`) — runs ESLint + Prettier before commits
- commitlint enforces Conventional Commits on commit messages

## Webhooks & Callbacks

**Incoming:**

- Cloudflare Turnstile verification is a server-to-server POST call from the Next.js action to Cloudflare (outgoing, not a webhook)

**Outgoing:**

- None detected

## Environment Configuration

**Required env vars:**

- `DATABASE_URL` - PostgreSQL connection string
- `ENCRYPTION_KEY` - 32-byte hex (64 chars) for AES-256-GCM
- `AUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API

**Optional env vars (graceful degradation):**

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Rate limiting (unlimited without)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET_NAME` / `AWS_SES_FROM_EMAIL` - File storage and email (features disabled without)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` - Bot protection (skipped without)
- `LOG_LEVEL` - Pino log level override

**Secrets location:**

- `.env` file (local only, not committed); Docker/prod via container env injection

---

_Integration audit: 2026-06-30_
