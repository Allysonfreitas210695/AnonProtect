<!-- refreshed: 2026-06-30 -->

# Architecture

**Analysis Date:** 2026-06-30

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    Browser / Client                                  │
│  React Server Components + Client Components (Next.js App Router)   │
├─────────────────────────────────────────────────────────────────────┤
│   (public) route group    │   (auth) route group  │ (admin) group   │
│  Landing, transparency,   │  Report submit/track  │ Protected dash  │
│  policies, how-it-works   │  No login required    │ RBAC-gated      │
│  `src/app/[locale]/(public)` │ `src/app/[locale]/(auth)` │ `src/app/[locale]/(admin)` │
└─────────────────────────────────────────────────────────────────────┘
                              │
                   Server Actions (mutations)
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                       Action Layer                                   │
│  `src/_actions/public/`   `src/_actions/admin/`   `src/_actions/upload/` │
│  next-safe-action clients: actionClient / authActionClient /        │
│  adminActionClient / supervisorActionClient                         │
│  `src/_shared/utils/safe-action.ts`                                 │
└──────────────────────────┬──────────────────────────────────────────┘
                            │ calls only
┌──────────────────────────▼──────────────────────────────────────────┐
│                      Data Access Layer (Modules)                     │
│  `src/_modules/report/`    `src/_modules/admin/`                    │
│  `src/_modules/category/`  `src/_modules/department/`               │
│  *.query.ts (reads, server-only)  *.data.ts (writes)                │
└──────────────────────────┬──────────────────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      Shared Singletons / Libs                        │
│  `src/_shared/lib/prisma.ts`  `src/_shared/lib/auth.ts`             │
│  `src/_shared/lib/ai.ts`      `src/_shared/lib/crypto.ts`           │
│  `src/_shared/lib/aws.ts`     `src/_shared/lib/ratelimit.ts`        │
│  `src/_shared/lib/logger.ts`                                        │
└──────────────────────────┬──────────────────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────────────────┐
│  PostgreSQL (Prisma)  │  S3 (AWS)  │  Redis (Upstash)  │  Gemini AI │
└─────────────────────────────────────────────────────────────────────┘
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

**Overall:** Layered Server Action architecture on Next.js App Router

**Key Characteristics:**

- Server Actions are the only mutation path — no REST API endpoints for app data
- Data access is split into read (`*.query.ts`) and write (`*.data.ts`) files per module
- Client components use custom hooks (`_hooks/`) that call Server Actions via `next-safe-action`
- RBAC is enforced at the action-client middleware layer, not in individual actions
- `Report.description` is encrypted at rest (AES-256-GCM) in all write paths

## Layers

**Routing / Pages:**

- Purpose: Next.js App Router pages and layouts
- Location: `src/app/[locale]/`
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `_components/` (page-local)
- Depends on: Server Actions (mutations), Module queries (direct reads in Server Components)
- Used by: End users via browser

**Server Actions:**

- Purpose: Validated mutation entry points, called from Client Components via hooks
- Location: `src/_actions/{public,admin,upload}/`
- Contains: `*.action.ts` files using `next-safe-action` clients
- Depends on: `_modules/*.data.ts` (writes), `_schemas/` (validation), `_shared/lib/` (singletons)
- Used by: Client components (via hooks) and Server Components

**Data Access Modules:**

- Purpose: All Prisma queries; segregated reads vs. writes
- Location: `src/_modules/{report,admin,category,department}/`
- Contains: `*.query.ts` (reads, tagged `server-only`), `*.data.ts` (writes)
- Depends on: `src/_shared/lib/prisma.ts`, `src/_shared/lib/crypto.ts`
- Used by: Server Actions exclusively

**Schemas:**

- Purpose: Single source of truth for input validation shared between server and client
- Location: `src/_schemas/`
- Contains: Zod v4 schemas for each domain (report, auth, category, ai, stats)
- Depends on: Nothing internal
- Used by: Server Actions (`.schema()`), React Hook Form on client

**Shared Libraries:**

- Purpose: Singleton clients and cross-cutting utilities
- Location: `src/_shared/lib/`, `src/_shared/utils/`
- Contains: `prisma.ts`, `auth.ts`, `ai.ts`, `crypto.ts`, `aws.ts`, `ratelimit.ts`, `logger.ts`, `safe-action.ts`, `formatters.ts`, `validators.ts`, `tracking.ts`, `viacep.ts`
- Depends on: External SDKs (Prisma, NextAuth, Gemini, AWS SDK, Upstash)
- Used by: All layers

**Hooks:**

- Purpose: React client wrappers that call Server Actions and manage loading/error state
- Location: `src/_hooks/{public,admin}/`
- Contains: `use-*.ts` files
- Depends on: Server Actions
- Used by: Client components in page `_components/` and `_components/shared/`

## Data Flow

### Report Submission (Primary Whistleblower Path)

1. User fills form in `src/app/[locale]/(auth)/report/new/_components/form.tsx`
2. `useNewReport` hook (`src/_hooks/public/use-new-report.ts`) calls `submitReportAction`
3. `submitReportAction` (`src/_actions/public/report.action.ts`):
   - Checks rate limit via `src/_shared/lib/ratelimit.ts`
   - Verifies Cloudflare Turnstile token
   - Generates tracking code via `src/_shared/utils/tracking.ts`
   - Encrypts description via `src/_shared/lib/crypto.ts`
   - Calls `reportData.createReport()` (`src/_modules/report/report.data.ts`)
   - Triggers AI analysis via `triggerAiAnalysis` (`src/_actions/public/ai-analysis.ts`)
4. AI analysis (`src/_actions/public/ai-analysis.ts`) calls `processAiAnalysis` in `src/_modules/report/report.data.ts`
5. `processAiAnalysis` calls `analyzeReport` (`src/_shared/lib/ai.ts`) → Google Gemini
6. AI results written back via `updateReportAiResults()` in `src/_modules/report/report.data.ts`
7. User redirected to success page with tracking code

### Admin Report Management

1. Admin opens report detail: `src/app/[locale]/(admin)/admin/report/[id]/page.tsx`
2. Page is a Server Component that calls module queries directly
3. Status/message mutations use Client Components → hooks (`src/_hooks/admin/`) → Server Actions (`src/_actions/admin/report.action.ts`)
4. `adminActionClient` / `supervisorActionClient` enforces RBAC before action logic runs

### Authentication Flow

1. `src/proxy.ts` runs as Next.js middleware on every non-static request
2. Calls `auth()` from `src/_shared/lib/auth.ts` to read JWT session
3. Redirects unauthenticated users to `/{locale}/login`
4. Redirects already-logged-in users away from `/login` to `/admin`
5. Admin layout `src/app/[locale]/(admin)/layout.tsx` double-checks `getCurrentUser()`

**State Management:**

- No global client state store; Server Components fetch directly from DB
- Client mutation state managed per-hook with `useAction` from `next-safe-action`
- Toast notifications via `sonner` (`<Toaster>` in root layout)

## Key Abstractions

**Safe Action Clients:**

- Purpose: Tiered authorization middleware for Server Actions
- Examples: `src/_shared/utils/safe-action.ts`
- Pattern: Each client wraps the previous; RBAC checked in `.use()` middleware before action handler runs

**Module Split (query/data):**

- Purpose: Enforce read/write separation and `server-only` on reads
- Examples: `src/_modules/report/report.query.ts`, `src/_modules/report/report.data.ts`
- Pattern: `*.query.ts` files import `'server-only'` at top; `*.data.ts` do not (both are server-side only in practice)

**Encrypted Fields:**

- Purpose: LGPD compliance — PII never stored in plaintext
- Examples: `Report.description`, `Report.redactedDescription` encrypted via `src/_shared/lib/crypto.ts`
- Pattern: Encrypt on write in Server Action/data layer; decrypt on read in query layer

## Entry Points

**Root Middleware:**

- Location: `src/proxy.ts`
- Triggers: Every non-static HTTP request
- Responsibilities: i18n locale redirect, auth session check, protected-route redirect

**Locale Root Layout:**

- Location: `src/app/[locale]/layout.tsx`
- Triggers: Every page render under a locale
- Responsibilities: Font, theme, i18n provider, toast provider

**NextAuth API Route:**

- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: Auth callbacks (OAuth redirect, credentials sign-in)
- Responsibilities: Session management, JWT issue

**Health Check:**

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

**What happens:** A `'use client'` component imports from `src/_modules/*/report.query.ts`
**Why it's wrong:** `query.ts` files carry `'server-only'` — this causes a build error and leaks DB access patterns to the client bundle
**Do this instead:** Read data in a parent Server Component and pass as props, or add a Server Action that wraps the query

### Instantiating PrismaClient Outside the Singleton

**What happens:** A file does `new PrismaClient()` directly
**Why it's wrong:** Creates multiple DB connection pools in development (hot-reload), exhausts connections
**Do this instead:** Always import from `src/_shared/lib/prisma.ts`

### Using `actionClient` for Admin Mutations

**What happens:** An admin-only mutation uses `actionClient` instead of `adminActionClient`
**Why it's wrong:** Bypasses RBAC — any unauthenticated user can invoke the action
**Do this instead:** Use `adminActionClient` or `supervisorActionClient` from `src/_shared/utils/safe-action.ts`

## Error Handling

**Strategy:** Centralized via `next-safe-action` `handleServerError` callback in `actionClient`; thrown `Error` instances are caught and returned as action error strings to the client

**Patterns:**

- Server Actions throw `Error` or `ActionError` — `next-safe-action` serializes these
- Hooks check `result.serverError` and `result.validationErrors` from `useAction`
- AI failures are caught internally in `processAiAnalysis` and logged; report creation succeeds regardless
- Rate limit and Turnstile failures throw inside the action (surfaced as `serverError` to client)

## Cross-Cutting Concerns

**Logging:** `pino` logger singleton at `src/_shared/lib/logger.ts`; structured JSON logs with context objects
**Validation:** Zod v4 schemas in `src/_schemas/`; applied at action boundary via `.schema()`
**Authentication:** NextAuth v5 JWT strategy; `auth()` in middleware, `getCurrentUser()` in layouts/actions
**Encryption:** AES-256-GCM via `src/_shared/lib/crypto.ts`; mandatory for `Report.description` and `Report.redactedDescription`
**Rate Limiting:** Upstash Redis sliding window (10/IP/hour) in `src/_shared/lib/ratelimit.ts`; degrades gracefully when Redis env vars absent
**i18n:** `next-intl` wrapping all pages; locale prefix `[locale]` in every route; messages in `messages/{pt-BR,en,es}.json`

---

_Architecture analysis: 2026-06-30_
