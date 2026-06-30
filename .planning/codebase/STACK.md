# Technology Stack

**Analysis Date:** 2026-06-30

## Languages

**Primary:**

- TypeScript 5.x - All source code (`src/`), configs, scripts
- JavaScript - Config files (`commitlint.config.js`, `postcss.config.js`, `prisma.config.js`)

**Secondary:**

- SQL - Prisma migrations (PostgreSQL dialect)

## Runtime

**Environment:**

- Node.js 20 (Alpine) - Specified in `Dockerfile` (`FROM node:20-alpine`)

**Package Manager:**

- npm
- Lockfile: `package-lock.json` present; `npm ci` used in Docker build

## Frameworks

**Core:**

- Next.js 16.1.6 - App Router, RSC, Server Actions, standalone output (`next.config.ts`)
- React 19.2.3 - UI rendering
- next-intl 4.8.3 - i18n with locales `pt-BR`, `en`, `es` (`src/i18n/request.ts`)

**Auth:**

- next-auth 5.0.0-beta.30 - JWT strategy, Credentials + Google OAuth (`src/_shared/lib/auth.ts`)
- @auth/prisma-adapter 2.11.1 - NextAuth database adapter

**Actions:**

- next-safe-action 8.0.12 - Type-safe Server Actions with tiered clients (`src/_shared/utils/safe-action.ts`)

**Forms:**

- react-hook-form 7.71.2 - Form state management
- @hookform/resolvers 5.2.2 - Zod v4 resolver integration

**Validation:**

- zod 4.3.6 - Schema validation, shared between server and client (`src/_schemas/`)

**UI:**

- Tailwind CSS 4.x - Utility CSS (`tailwind.config.ts`)
- shadcn (3.8.5 CLI) + Radix UI primitives - Component library (`src/_components/ui/`)
- framer-motion 12.37.0 - Animations
- lucide-react 0.575.0 - Icons
- recharts 2.15.1 - Admin dashboard charts
- next-themes 0.4.6 - Dark/light theme
- sonner 2.0.7 - Toast notifications
- react-markdown 10.1.0 + remark-gfm 4.0.1 - Markdown rendering

**Testing:**

- Vitest 4.0.18 - Test runner (`vitest.config.ts`)
- @testing-library/react 16.3.2 + @testing-library/dom 10.4.1 - React component tests
- @testing-library/jest-dom 6.9.1 - DOM matchers
- jsdom 28.1.0 - Browser environment
- vitest-mock-extended 3.1.0 - Typed Prisma mocks

**Build/Dev:**

- Husky 9.1.7 - Git hooks
- lint-staged 16.2.7 - Pre-commit linting (config: `.lintstagedrc.json`)
- commitlint 20.4.4 + @commitlint/config-conventional - Commit message enforcement
- ESLint 9.x - Linting (`eslint.config.mjs`)
- Prettier 3.8.1 + prettier-plugin-tailwindcss 0.7.2 - Formatting
- eslint-plugin-simple-import-sort 12.1.1 - Import ordering
- tsx 4.20.6 - TypeScript execution for Prisma seed (`prisma/seed.ts`)
- babel-plugin-react-compiler 1.0.0 - React compiler optimization

## Key Dependencies

**Critical:**

- `@prisma/client` 7.4.1 - Database ORM client (generated to `src/_generated/prisma/`)
- `prisma` 7.4.1 - Schema management and migrations
- `@prisma/adapter-pg` 7.4.1 - pg Pool adapter for Prisma (`src/_shared/lib/prisma.ts`)
- `pg` 8.18.0 - PostgreSQL connection pool
- `bcryptjs` 3.0.3 - Password hashing for Credentials auth
- `server-only` 0.0.1 - Prevents server modules from being imported client-side

**Infrastructure:**

- `@upstash/ratelimit` 2.0.8 - Sliding window rate limiter (10 req/IP/hour)
- `@upstash/redis` 1.37.0 - Redis client via Upstash REST API
- `@aws-sdk/client-s3` 3.1009.0 - File uploads to S3
- `@aws-sdk/client-ses` 3.1009.0 - Email via SES
- `@aws-sdk/s3-request-presigner` 3.1009.0 - Pre-signed S3 download URLs
- `@google/generative-ai` 0.24.1 - Gemini 2.5 Flash AI integration
- `@marsidev/react-turnstile` 1.4.2 - Cloudflare Turnstile bot protection widget
- `pino` 10.3.1 + `pino-pretty` 13.1.3 - Structured logging (`src/_shared/lib/logger.ts`)

## Configuration

**Environment:**

- All secrets via environment variables; `.env` file present (never read)
- Required vars: `DATABASE_URL`, `ENCRYPTION_KEY` (32-byte hex, 64 chars), `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_SES_FROM_EMAIL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- AWS and Upstash integrations gracefully degrade when env vars are absent

**Build:**

- `next.config.ts` - Next.js config with `output: 'standalone'` and next-intl plugin
- `tsconfig.json` - ES2017 target, strict mode, `@/` alias → `src/`
- `tailwind.config.ts` - CSS variables-based color tokens, `@tailwindcss/typography`
- `postcss.config.js` - PostCSS for Tailwind
- `vitest.config.ts` - jsdom environment, `@vitejs/plugin-react`, `@/` alias

## Platform Requirements

**Development:**

- Node.js 20
- PostgreSQL database
- Optional: Upstash Redis account, AWS account, Google Cloud project, Cloudflare account

**Production:**

- Docker (multi-stage build in `Dockerfile`, `docker-compose.yml` present)
- Standalone Next.js output served by `node server.js` on port 3000
- PostgreSQL (required), Redis/AWS/Google/Cloudflare (optional but degraded without)

---

_Stack analysis: 2026-06-30_
