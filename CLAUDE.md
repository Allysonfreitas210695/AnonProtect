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

| Layer          | Location                                           | Purpose                                                                                   |
| -------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Server Actions | `src/_actions/{public,admin,upload}/`              | Mutations via `next-safe-action`; always use the appropriate action client                |
| Data access    | `src/_modules/{report,category,admin,department}/` | Split into `*.data.ts` (writes) and `*.query.ts` (reads); imported only by Server Actions |
| Schemas        | `src/_schemas/`                                    | Zod v4 schemas shared between server actions and form validation                          |
| Shared libs    | `src/_shared/lib/`                                 | `prisma`, `auth`, `ai`, `crypto`, `ratelimit`, `aws`, `logger` singletons                 |
| Hooks          | `src/_hooks/{public,admin}/`                       | React hook wrappers over Server Actions for client components                             |
| Components     | `src/_components/{ui,shared}/`                     | `ui/` = shadcn primitives; `shared/` = app-specific reusable components                   |

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

Upstash Redis sliding window (10 reports/IP/hour). Gracefully degrades to no-limit when Redis env vars are absent. Identifiers are HMAC-SHA256 of the IP (never plain IP), analytics disabled, and page views do not consume any limit (each action uses only its own limiter).

### Testing

Vitest + jsdom + `@testing-library/react`. Global mocks set up in `src/__tests__/setup.ts` (next/navigation, next-auth, pino, server-only). Prisma is mocked via `src/__tests__/mocks/prisma.ts`. Tests co-locate with source files (`.test.ts` / `.spec.ts`).

### Path Aliases

`@/` maps to `src/`. Configured in both `tsconfig.json` and `vitest.config.ts`.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**AnonProtect**

AnonProtect é uma plataforma de denúncias anônimas desenvolvida como Trabalho de Conclusão de Curso (TCC). Permite que denunciantes enviem relatos anônimos via código de rastreamento, enquanto administradores e supervisores gerenciam os casos em um painel protegido por RBAC, com análise automática por IA (Google Gemini) e criptografia de dados sensíveis (AES-256-GCM).

**Core Value:** O denunciante deve conseguir enviar uma denúncia de forma completamente anônima e acompanhar seu andamento via código de rastreamento — se qualquer outra coisa falhar, esse fluxo deve funcionar.

### Constraints

- **Stack:** Next.js 16 App Router — manter arquitetura existente (Server Actions, safe-action, módulos query/data)
- **Banco de dados:** PostgreSQL via Prisma — sem mudanças de ORM
- **Criptografia:** Usar `src/_shared/lib/crypto.ts` (AES-256-GCM) existente para novos campos criptografados
- **i18n:** Qualquer texto visível ao usuário precisa estar nos três arquivos `messages/*.json`
- **Prazo:** 1-2 semanas — focar em funcionalidade e segurança, não em perfeição
- **Commit:** Seguir Conventional Commits (enforced por commitlint + husky)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.x - All source code (`src/`), configs, scripts
- JavaScript - Config files (`commitlint.config.js`, `postcss.config.js`, `prisma.config.js`)
- SQL - Prisma migrations (PostgreSQL dialect)

## Runtime

- Node.js 20 (Alpine) - Specified in `Dockerfile` (`FROM node:20-alpine`)
- npm
- Lockfile: `package-lock.json` present; `npm ci` used in Docker build

## Frameworks

- Next.js 16.1.6 - App Router, RSC, Server Actions, standalone output (`next.config.ts`)
- React 19.2.3 - UI rendering
- next-intl 4.8.3 - i18n with locales `pt-BR`, `en`, `es` (`src/i18n/request.ts`)
- next-auth 5.0.0-beta.30 - JWT strategy, Credentials + Google OAuth (`src/_shared/lib/auth.ts`)
- @auth/prisma-adapter 2.11.1 - NextAuth database adapter
- next-safe-action 8.0.12 - Type-safe Server Actions with tiered clients (`src/_shared/utils/safe-action.ts`)
- react-hook-form 7.71.2 - Form state management
- @hookform/resolvers 5.2.2 - Zod v4 resolver integration
- zod 4.3.6 - Schema validation, shared between server and client (`src/_schemas/`)
- Tailwind CSS 4.x - Utility CSS (`tailwind.config.ts`)
- shadcn (3.8.5 CLI) + Radix UI primitives - Component library (`src/_components/ui/`)
- framer-motion 12.37.0 - Animations
- lucide-react 0.575.0 - Icons
- recharts 2.15.1 - Admin dashboard charts
- next-themes 0.4.6 - Dark/light theme
- sonner 2.0.7 - Toast notifications
- react-markdown 10.1.0 + remark-gfm 4.0.1 - Markdown rendering
- Vitest 4.0.18 - Test runner (`vitest.config.ts`)
- @testing-library/react 16.3.2 + @testing-library/dom 10.4.1 - React component tests
- @testing-library/jest-dom 6.9.1 - DOM matchers
- jsdom 28.1.0 - Browser environment
- vitest-mock-extended 3.1.0 - Typed Prisma mocks
- Husky 9.1.7 - Git hooks
- lint-staged 16.2.7 - Pre-commit linting (config: `.lintstagedrc.json`)
- commitlint 20.4.4 + @commitlint/config-conventional - Commit message enforcement
- ESLint 9.x - Linting (`eslint.config.mjs`)
- Prettier 3.8.1 + prettier-plugin-tailwindcss 0.7.2 - Formatting
- eslint-plugin-simple-import-sort 12.1.1 - Import ordering
- tsx 4.20.6 - TypeScript execution for Prisma seed (`prisma/seed.ts`)
- babel-plugin-react-compiler 1.0.0 - React compiler optimization

## Key Dependencies

- `@prisma/client` 7.4.1 - Database ORM client (generated to `src/_generated/prisma/`)
- `prisma` 7.4.1 - Schema management and migrations
- `@prisma/adapter-pg` 7.4.1 - pg Pool adapter for Prisma (`src/_shared/lib/prisma.ts`)
- `pg` 8.18.0 - PostgreSQL connection pool
- `bcryptjs` 3.0.3 - Password hashing for Credentials auth
- `server-only` 0.0.1 - Prevents server modules from being imported client-side
- `@upstash/ratelimit` 2.0.8 - Sliding window rate limiter (10 req/IP/hour)
- `@upstash/redis` 1.37.0 - Redis client via Upstash REST API
- `@aws-sdk/client-s3` 3.1009.0 - File uploads to S3
- `@aws-sdk/client-ses` 3.1009.0 - Email via SES
- `@aws-sdk/s3-request-presigner` 3.1009.0 - Pre-signed S3 download URLs
- `@google/generative-ai` 0.24.1 - Gemini 2.5 Flash AI integration
- `@marsidev/react-turnstile` 1.4.2 - Cloudflare Turnstile bot protection widget
- `pino` 10.3.1 + `pino-pretty` 13.1.3 - Structured logging (`src/_shared/lib/logger.ts`)

## Configuration

- All secrets via environment variables; `.env` file present (never read)
- Required vars: `DATABASE_URL`, `ENCRYPTION_KEY` (32-byte hex, 64 chars), `RATE_LIMIT_SECRET` (32-byte hex, 64 chars; opcional — fallback derivado de `AUTH_SECRET`), `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_SES_FROM_EMAIL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- AWS and Upstash integrations gracefully degrade when env vars are absent
- `next.config.ts` - Next.js config with `output: 'standalone'` and next-intl plugin
- `tsconfig.json` - ES2017 target, strict mode, `@/` alias → `src/`
- `tailwind.config.ts` - CSS variables-based color tokens, `@tailwindcss/typography`
- `postcss.config.js` - PostCSS for Tailwind
- `vitest.config.ts` - jsdom environment, `@vitejs/plugin-react`, `@/` alias

## Platform Requirements

- Node.js 20
- PostgreSQL database
- Optional: Upstash Redis account, AWS account, Google Cloud project, Cloudflare account
- Docker (multi-stage build in `Dockerfile`, `docker-compose.yml` present)
- Standalone Next.js output served by `node server.js` on port 3000
- PostgreSQL (required), Redis/AWS/Google/Cloudflare (optional but degraded without)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- kebab-case for all source files: `report.action.ts`, `use-investigation-notes.ts`, `status-badge.tsx`
- Suffix encodes layer: `.action.ts` (server actions), `.data.ts` (write DAL), `.query.ts` (read DAL), `.query.ts`
- Tests co-located with same base name: `report.action.ts` → `report.action.test.ts` or `report.action.spec.ts`
- camelCase for all functions: `submitReportAction`, `generateTrackingCode`, `verifyTurnstile`
- Server action exports are named constants: `export const submitReportAction = actionClient...`
- Action helpers (not exported) are plain `async function` declarations
- camelCase: `parsedInput`, `trackingCode`, `encryptedDescription`, `rateLimitOk`
- Destructuring from parsedInput is standard: `{ parsedInput: { reportId, content }, ctx: { user } }`
- PascalCase for interfaces and type aliases: `ReportInput`, `ReportWithCategory`, `ActionError`
- Infer types from Zod schemas using `z.infer<typeof schema>`: `type ReportInput = z.infer<typeof reportSchema>`
- Prisma model types imported directly from `@/_generated/prisma`
- PascalCase function components: `StatusBadge`, `InvestigationNotes`
- Named exports (not default): `export function StatusBadge`

## Code Style

- No semicolons (`"semi": false`)
- Single quotes (`"singleQuote": true`)
- 2-space indentation (`"tabWidth": 2`)
- Trailing commas in ES5 positions (`"trailingComma": "es5"`)
- Max line width 100 chars (`"printWidth": 100`)
- Arrow functions always parenthesized (`"arrowParens": "always"`)
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- ESLint with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- `eslint-config-prettier/flat` disables formatting rules that conflict with Prettier
- `src/_generated/**` excluded from linting (do not edit manually)

## Import Organization

- `@/` maps to `src/` — use in all non-relative imports
- Example: `import { prisma } from '@/_shared/lib/prisma'`
- Server Actions import from `@/_modules/*/` (data layer) and `@/_shared/lib/` (singletons)
- Data/Query modules import from `@/_shared/lib/prisma` only
- Components import from `@/_hooks/*/` and `@/_components/*/`
- Schemas imported from `@/_schemas/` by both actions and client forms

## Error Handling

- Throw plain `new Error('message')` for auth/authorization failures
- `handleServerError` in `actionClient` catches and surfaces `e.message` as `serverError`
- Error messages are in Portuguese (Brazilian): `'Sessão expirada ou usuário não autenticado'`
- Wrap business logic in `try/catch` and re-throw as `new ActionError(message)`
- `ActionError` extends `Error` and is exported from `@/_shared/utils/safe-action`
- Example pattern from `src/_actions/admin/report.action.ts`:
- Functions throw naturally; callers (actions) handle errors
- `processAiAnalysis` in `src/_modules/report/report.data.ts` catches its own errors and resolves gracefully (fire-and-forget AI calls)

## Logging

- Structured log with context object first, message string second: `logger.info({ trackingCode, reportId }, 'Denúncia registrada com sucesso')`
- Log at action entry: `logger.info({ categoryId }, 'Iniciando submissão de nova denúncia')`
- Log at action success: `logger.info({ trackingCode, reportId }, 'Denúncia registrada com sucesso')`
- Errors use `logger.error`; debug-level calls avoided in production paths

## Server Actions Pattern

- Shared schemas (used in both actions and client-side forms) → `src/_schemas/<entity>.ts`
- Action-local schemas (single use) → defined inline in the action file with `z.object({...})`

## Zod Schema Patterns

- Validation messages are in Portuguese
- Refinements used for business rules: `z.boolean().refine((val) => val === true, { message: '...' })`
- `z.nativeEnum(PrismaEnum)` for Prisma enum fields

## Commit Messages

## Comments

- Inline comments for non-obvious decisions (e.g., `// Hoist the mock to avoid "used before initialization" error`)
- No JSDoc on internal functions
- No block comments for standard patterns
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component              | Responsibility                                 | File                               |
| ---------------------- | ---------------------------------------------- | ---------------------------------- |
| proxy.ts               | i18n routing + auth redirect middleware        | `src/proxy.ts`                     |
| actionClient           | Unauthenticated server action wrapper          | `src/_shared/utils/safe-action.ts` |
| authActionClient       | Session-gated action wrapper                   | `src/_shared/utils/safe-action.ts` |
| adminActionClient      | ADMIN-role-gated action wrapper                | `src/_shared/utils/safe-action.ts` |
| supervisorActionClient | SUPERVISOR/ADMIN action wrapper                | `src/_shared/utils/safe-action.ts` |
| \*.query.ts            | Read-only database queries (server-only)       | `src/_modules/*/`                  |
| \*.data.ts             | Database writes and mutations                  | `src/_modules/*/`                  |
| \_schemas/             | Zod v4 schemas shared by actions + forms       | `src/_schemas/`                    |
| \_hooks/               | Client-side React wrappers over Server Actions | `src/_hooks/`                      |
| \_components/ui/       | shadcn/ui primitive components                 | `src/_components/ui/`              |
| \_components/shared/   | App-specific reusable components               | `src/_components/shared/`          |

## Pattern Overview

- Server Actions are the only mutation path — no REST API endpoints for app data
- Data access is split into read (`*.query.ts`) and write (`*.data.ts`) files per module
- Client components use custom hooks (`_hooks/`) that call Server Actions via `next-safe-action`
- RBAC is enforced at the action-client middleware layer, not in individual actions
- `Report.description` is encrypted at rest (AES-256-GCM) in all write paths

## Layers

- Purpose: Next.js App Router pages and layouts
- Location: `src/app/[locale]/`
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `_components/` (page-local)
- Depends on: Server Actions (mutations), Module queries (direct reads in Server Components)
- Used by: End users via browser
- Purpose: Validated mutation entry points, called from Client Components via hooks
- Location: `src/_actions/{public,admin,upload}/`
- Contains: `*.action.ts` files using `next-safe-action` clients
- Depends on: `_modules/*.data.ts` (writes), `_schemas/` (validation), `_shared/lib/` (singletons)
- Used by: Client components (via hooks) and Server Components
- Purpose: All Prisma queries; segregated reads vs. writes
- Location: `src/_modules/{report,admin,category,department}/`
- Contains: `*.query.ts` (reads, tagged `server-only`), `*.data.ts` (writes)
- Depends on: `src/_shared/lib/prisma.ts`, `src/_shared/lib/crypto.ts`
- Used by: Server Actions exclusively
- Purpose: Single source of truth for input validation shared between server and client
- Location: `src/_schemas/`
- Contains: Zod v4 schemas for each domain (report, auth, category, ai, stats)
- Depends on: Nothing internal
- Used by: Server Actions (`.schema()`), React Hook Form on client
- Purpose: Singleton clients and cross-cutting utilities
- Location: `src/_shared/lib/`, `src/_shared/utils/`
- Contains: `prisma.ts`, `auth.ts`, `ai.ts`, `crypto.ts`, `aws.ts`, `ratelimit.ts`, `logger.ts`, `safe-action.ts`, `formatters.ts`, `validators.ts`, `tracking.ts`, `viacep.ts`
- Depends on: External SDKs (Prisma, NextAuth, Gemini, AWS SDK, Upstash)
- Used by: All layers
- Purpose: React client wrappers that call Server Actions and manage loading/error state
- Location: `src/_hooks/{public,admin}/`
- Contains: `use-*.ts` files
- Depends on: Server Actions
- Used by: Client components in page `_components/` and `_components/shared/`

## Data Flow

### Report Submission (Primary Whistleblower Path)

### Admin Report Management

### Authentication Flow

- No global client state store; Server Components fetch directly from DB
- Client mutation state managed per-hook with `useAction` from `next-safe-action`
- Toast notifications via `sonner` (`<Toaster>` in root layout)

## Key Abstractions

- Purpose: Tiered authorization middleware for Server Actions
- Examples: `src/_shared/utils/safe-action.ts`
- Pattern: Each client wraps the previous; RBAC checked in `.use()` middleware before action handler runs
- Purpose: Enforce read/write separation and `server-only` on reads
- Examples: `src/_modules/report/report.query.ts`, `src/_modules/report/report.data.ts`
- Pattern: `*.query.ts` files import `'server-only'` at top; `*.data.ts` do not (both are server-side only in practice)
- Purpose: LGPD compliance — PII never stored in plaintext
- Examples: `Report.description`, `Report.redactedDescription` encrypted via `src/_shared/lib/crypto.ts`
- Pattern: Encrypt on write in Server Action/data layer; decrypt on read in query layer

## Entry Points

- Location: `src/proxy.ts`
- Triggers: Every non-static HTTP request
- Responsibilities: i18n locale redirect, auth session check, protected-route redirect
- Location: `src/app/[locale]/layout.tsx`
- Triggers: Every page render under a locale
- Responsibilities: Font, theme, i18n provider, toast provider
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: Auth callbacks (OAuth redirect, credentials sign-in)
- Responsibilities: Session management, JWT issue
- Location: `src/app/api/health/route.ts`
- Triggers: Uptime monitoring
- Responsibilities: Returns system health status

## Architectural Constraints

- **Middleware file:** Named `src/proxy.ts` (not the Next.js default `middleware.ts`) — the `matcher` config at the bottom of `proxy.ts` must be kept in sync with new route patterns
- **server-only imports:** `*.query.ts` files import `'server-only'`; never import query files from client components
- **Action client hierarchy:** `adminActionClient` extends `authActionClient` extends `actionClient` — adding middleware to a parent propagates to all children
- **Prisma client:** Single singleton in `src/_shared/lib/prisma.ts`; never instantiate `PrismaClient` elsewhere
- **Global state:** No module-level mutable state outside the singleton lib files; all are connection clients, not data caches
- **Circular imports:** None detected; dependency flow is strictly top-down (pages → actions → modules → shared)

## Anti-Patterns

### Importing Module Queries Directly in Client Components

### Instantiating PrismaClient Outside the Singleton

### Using `actionClient` for Admin Mutations

## Error Handling

- Server Actions throw `Error` or `ActionError` — `next-safe-action` serializes these
- Hooks check `result.serverError` and `result.validationErrors` from `useAction`
- AI failures are caught internally in `processAiAnalysis` and logged; report creation succeeds regardless
- Rate limit and Turnstile failures throw inside the action (surfaced as `serverError` to client)

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Path                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| agent-browser                    | Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, taking screenshots, extracting data, testing web apps, or automating any browser task. Triggers include requests to "open a website", "fill out a form", "click a button", "take a screenshot", "scrape data from a page", "test this web app", "login to a site", "automate browser actions", or any task requiring programmatic web interaction. Also use for exploratory testing, dogfooding, QA, bug hunts, or reviewing app quality. Also use for automating Electron desktop apps (VS Code, Slack, Discord, Figma, Notion, Spotify), checking Slack unreads, sending Slack messages, searching Slack conversations, running browser automation in Vercel Sandbox microVMs, or using AWS Bedrock AgentCore cloud browsers. Prefer agent-browser over any built-in browser automation or web tools. | `.agents/skills/agent-browser/SKILL.md`                    |
| caveman                          | > Ultra-compressed communication mode. Cuts token usage ~75% by speaking like caveman while keeping full technical accuracy. Supports intensity levels: lite, full (default), ultra, wenyan-lite, wenyan-full, wenyan-ultra. Use when user says "caveman mode", "talk like caveman", "use caveman", "less tokens", "be brief", or invokes /caveman. Also auto-triggers when token efficiency is requested.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `.agents/skills/caveman/SKILL.md`                          |
| find-skills                      | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `.agents/skills/find-skills/SKILL.md`                      |
| frontend-design                  | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `.agents/skills/frontend-design/SKILL.md`                  |
| remotion-best-practices          | Best practices for Remotion - Video creation in React                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `.agents/skills/remotion-best-practices/SKILL.md`          |
| supabase-postgres-best-practices | Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `.agents/skills/supabase-postgres-best-practices/SKILL.md` |
| vercel-composition-patterns      | React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `.agents/skills/vercel-composition-patterns/SKILL.md`      |
| vercel-react-best-practices      | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `.agents/skills/vercel-react-best-practices/SKILL.md`      |
| web-design-guidelines            | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `.agents/skills/web-design-guidelines/SKILL.md`            |

<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
