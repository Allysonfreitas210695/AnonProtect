# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Next.js)
npm run build        # production build
npm run lint         # ESLint
npm test             # run all tests (Vitest, one-shot)
npm run test:watch   # Vitest in watch mode

# Single test file
npx vitest run src/_actions/public/report.action.test.ts

# Database
npx prisma generate             # regenerate client after schema changes
npx prisma migrate dev          # apply migrations
npx prisma db seed              # seed default users (admin@sistema.com / admin123, supervisor@sistema.com / super123)
```

Commit messages must follow Conventional Commits (enforced by commitlint + husky).

## Architecture

**Next.js 16 App Router** with `next-intl` for i18n. All routes live under `src/app/[locale]/` and are namespaced into three route groups:
- `(public)` — unauthenticated pages (landing, transparency, policies)
- `(auth)` — report submission/tracking (no login required, but Cloudflare Turnstile bot protection)
- `(admin)` — protected dashboard (NextAuth session + RBAC)

### Key Layers

| Layer | Location | Purpose |
|---|---|---|
| Server Actions | `src/_actions/{public,admin,upload}/` | Mutations via `next-safe-action`; always use the appropriate action client |
| Data access | `src/_modules/{report,category,admin,department}/` | Split into `*.data.ts` (writes) and `*.query.ts` (reads); imported only by Server Actions |
| Schemas | `src/_schemas/` | Zod v4 schemas shared between server actions and form validation |
| Shared libs | `src/_shared/lib/` | `prisma`, `auth`, `ai`, `crypto`, `ratelimit`, `aws`, `logger` singletons |
| Hooks | `src/_hooks/{public,admin}/` | React hook wrappers over Server Actions for client components |
| Components | `src/_components/{ui,shared}/` | `ui/` = shadcn primitives; `shared/` = app-specific reusable components |

### Action Clients (safe-action)

Three tiered clients in `src/_shared/utils/safe-action.ts`:
- `actionClient` — unauthenticated
- `authActionClient` — requires valid session
- `adminActionClient` — requires `ADMIN` role
- `supervisorActionClient` — requires `SUPERVISOR` or `ADMIN` role

Always use the most restrictive client that fits the action.

### Auth

NextAuth v5 (beta) with JWT strategy. Supports Credentials + Google OAuth. Session exposes `user.id`, `user.role`, `user.country`. Config at `src/_shared/lib/auth.ts`.

### Database

PostgreSQL via Prisma. Client generated to `src/_generated/prisma/` (do not edit manually). Run `npx prisma generate` after any schema change. Main models: `User`, `Report`, `Category`, `Department`, `Message`, `Attachment`, `InvestigationNote`, `ActivityLog`.

`Report.description` is encrypted at rest via AES-256-GCM (`src/_shared/lib/crypto.ts`). `Report.trackingCode` is the public identifier given to whistleblowers.

### AI Integration

Google Gemini (`gemini-2.5-flash`) via `@google/generative-ai`. Two uses:
1. **Whistleblower assistant** — conversational chat to help classify reports
2. **Auto-analysis** (`analyzeReport`) — classifies category, priority, and produces a LGPD-redacted description (PII replaced with `[DADO PROTEGIDO]`)

### i18n

`next-intl` with locales `['pt-BR', 'en', 'es']` defined in `src/i18n/request.ts`. Translation files at `messages/{pt-BR,en,es}.json`. When adding new i18n keys, update all three files.

### Rate Limiting

Upstash Redis sliding window (10 reports/IP/hour). Gracefully degrades to no-limit when Redis env vars are absent.

### Testing

Vitest + jsdom + `@testing-library/react`. Global mocks set up in `src/__tests__/setup.ts` (next/navigation, next-auth, pino, server-only). Prisma is mocked via `src/__tests__/mocks/prisma.ts`. Tests co-locate with source files (`.test.ts` / `.spec.ts`).

### Path Aliases

`@/` maps to `src/`. Configured in both `tsconfig.json` and `vitest.config.ts`.
