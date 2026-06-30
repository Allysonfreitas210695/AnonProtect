# Codebase Structure

**Analysis Date:** 2026-06-30

## Directory Layout

```
AnonProtect/
├── src/
│   ├── _actions/           # Server Actions (mutations only)
│   │   ├── admin/          # Admin-gated mutations
│   │   ├── public/         # Unauthenticated / user mutations
│   │   └── upload/         # S3 pre-signed URL actions
│   ├── _components/        # Reusable React components
│   │   ├── shared/         # App-specific shared components
│   │   └── ui/             # shadcn/ui primitives
│   ├── _constants/         # App-wide constants
│   ├── _generated/         # Prisma generated client (DO NOT EDIT)
│   │   └── prisma/
│   ├── _hooks/             # React hooks wrapping Server Actions
│   │   ├── admin/          # Admin-specific hooks
│   │   └── public/         # Public/whistleblower hooks
│   ├── _modules/           # Data access layer (DB queries)
│   │   ├── admin/          # admin.query.ts / admin.data.ts
│   │   ├── category/       # category.query.ts / category.data.ts
│   │   ├── department/     # department.query.ts / department.data.ts
│   │   └── report/         # report.query.ts / report.data.ts
│   ├── _schemas/           # Zod v4 validation schemas
│   ├── _shared/
│   │   ├── lib/            # Singleton clients and services
│   │   └── utils/          # Pure utility functions
│   ├── __tests__/          # Global test setup and integration tests
│   │   ├── integration/
│   │   ├── mocks/          # Prisma mock and global mocks
│   │   └── setup.ts        # Vitest global setup
│   ├── app/                # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   └── health/     # Health check endpoint
│   │   └── [locale]/       # All i18n-namespaced routes
│   │       ├── (admin)/    # Protected admin dashboard
│   │       ├── (auth)/     # Report submit/track (no login)
│   │       ├── (public)/   # Marketing/info pages
│   │       ├── layout.tsx  # Root locale layout
│   │       └── page.tsx    # Landing page
│   ├── i18n/               # next-intl config
│   ├── next-auth.d.ts      # NextAuth type augmentation
│   └── proxy.ts            # Next.js middleware (i18n + auth routing)
├── messages/               # i18n translation files
│   ├── pt-BR.json
│   ├── en.json
│   └── es.json
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                 # Static assets
├── .planning/              # GSD planning documents
│   └── codebase/
├── CLAUDE.md               # Project instructions for Claude
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Directory Purposes

**`src/_actions/`:**

- Purpose: All Server Actions — the only mutation path in the app
- Contains: `*.action.ts` files using `next-safe-action` clients; co-located `.test.ts` / `.spec.ts` files
- Key files: `src/_actions/public/report.action.ts`, `src/_actions/admin/report.action.ts`, `src/_actions/upload/s3.action.ts`

**`src/_components/ui/`:**

- Purpose: shadcn/ui primitive components
- Contains: One file per primitive (`button.tsx`, `input.tsx`, `card.tsx`, etc.)
- Key files: Any shadcn component — do not modify manually; regenerate via shadcn CLI

**`src/_components/shared/`:**

- Purpose: App-specific reusable components used across multiple pages
- Contains: Composite components built on top of `ui/` primitives
- Key files: `src/_components/shared/sidebar.tsx`, `src/_components/shared/status-badge.tsx`, `src/_components/shared/report-card.tsx`

**`src/_modules/`:**

- Purpose: Data access layer — all Prisma queries live here exclusively
- Contains: `*.query.ts` (reads, `server-only`) and `*.data.ts` (writes) per domain
- Key files: `src/_modules/report/report.query.ts`, `src/_modules/report/report.data.ts`

**`src/_schemas/`:**

- Purpose: Single source of truth for input validation; shared between Server Actions and React Hook Form
- Contains: Zod v4 schemas
- Key files: `src/_schemas/report.ts`, `src/_schemas/auth.ts`, `src/_schemas/index.ts` (barrel export)

**`src/_shared/lib/`:**

- Purpose: Singleton external clients — import from here, never instantiate directly elsewhere
- Key files:
  - `src/_shared/lib/prisma.ts` — Prisma client singleton
  - `src/_shared/lib/auth.ts` — NextAuth config + `getCurrentUser()` helper
  - `src/_shared/lib/ai.ts` — Google Gemini client
  - `src/_shared/lib/crypto.ts` — AES-256-GCM encrypt/decrypt
  - `src/_shared/lib/aws.ts` — S3 client
  - `src/_shared/lib/ratelimit.ts` — Upstash Redis rate limiter
  - `src/_shared/lib/logger.ts` — pino logger singleton

**`src/_shared/utils/`:**

- Purpose: Pure utility functions without external dependencies
- Key files:
  - `src/_shared/utils/safe-action.ts` — four tiered action clients
  - `src/_shared/utils/tracking.ts` — tracking code generation
  - `src/_shared/utils/formatters.ts` — date/string formatters
  - `src/_shared/utils/validators.ts` — reusable validation helpers
  - `src/_shared/utils/viacep.ts` — Brazilian postal code lookup (ViaCEP API)
  - `src/_shared/utils/compliance.ts` — LGPD compliance utilities

**`src/_hooks/`:**

- Purpose: Client-side React hooks that call Server Actions via `useAction` from `next-safe-action`
- Contains: `use-*.ts` files, organized by access level (public/admin)
- Key files: `src/_hooks/public/use-new-report.ts`, `src/_hooks/public/use-s3-upload.ts`, `src/_hooks/admin/use-report-status.ts`

**`src/__tests__/`:**

- Purpose: Global test infrastructure
- Key files: `src/__tests__/setup.ts` (global mocks: next/navigation, next-auth, pino, server-only), `src/__tests__/mocks/prisma.ts` (Prisma mock)

**`src/app/[locale]/(admin)/`:**

- Purpose: Protected admin dashboard
- Routes: `/admin/dashboard`, `/admin/report`, `/admin/report/[id]`, `/admin/settings`, `/admin/analytics`, `/admin/audit-log`, `/admin/profile`, `/admin/status`
- Auth: Layout-level `getCurrentUser()` redirect + action-level RBAC

**`src/app/[locale]/(auth)/`:**

- Purpose: Report submission and tracking (no login required, bot-protected)
- Routes: `/report/new`, `/report/track`, `/report/[code]`, `/report/success`, `/login`, `/register`, `/forgot-password`

**`src/app/[locale]/(public)/`:**

- Purpose: Unauthenticated informational pages
- Routes: `/how-it-works`, `/transparency`, `/privacy-policy`, `/terms-of-service`

**`src/_generated/prisma/`:**

- Purpose: Auto-generated Prisma client
- Generated: Yes — run `npx prisma generate` after schema changes
- Committed: Yes (needed for deployment)
- Key note: Never edit manually

## Key File Locations

**Entry Points:**

- `src/proxy.ts`: Next.js middleware — i18n routing and auth guard
- `src/app/[locale]/layout.tsx`: Root locale layout (providers, fonts, toaster)
- `src/app/[locale]/page.tsx`: Landing page
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth handler

**Configuration:**

- `src/_shared/utils/safe-action.ts`: Action client tiers (actionClient, authActionClient, adminActionClient, supervisorActionClient)
- `src/_shared/lib/auth.ts`: NextAuth config with Credentials + Google providers
- `src/i18n/request.ts`: Locale list (`['pt-BR', 'en', 'es']`) and next-intl setup
- `prisma/schema.prisma`: Database schema (models: User, Report, Category, Department, Message, Attachment, InvestigationNote, ActivityLog)

**Core Logic:**

- `src/_actions/public/report.action.ts`: Report submission (rate limit → Turnstile → encrypt → DB → AI)
- `src/_actions/public/ai-analysis.ts`: AI background analysis trigger
- `src/_modules/report/report.data.ts`: Report write operations
- `src/_modules/report/report.query.ts`: Report read operations

**Testing:**

- `src/__tests__/setup.ts`: Global test setup
- `src/__tests__/mocks/prisma.ts`: Prisma mock
- Co-located test files: `*.test.ts` / `*.spec.ts` next to source files

## Naming Conventions

**Files:**

- Server Actions: `{domain}.action.ts` (e.g., `report.action.ts`)
- Module reads: `{domain}.query.ts`
- Module writes: `{domain}.data.ts`
- Hooks: `use-{purpose}.ts` (kebab-case)
- Components: `{purpose}.tsx` (kebab-case)
- Tests: `{filename}.test.ts` or `{filename}.spec.ts` (co-located with source)

**Directories:**

- Private (non-route) src directories prefixed with `_` (e.g., `_actions`, `_modules`, `_shared`)
- Route group directories wrapped in parentheses: `(admin)`, `(auth)`, `(public)`
- Page-local components in `_components/` subdirectory within the route

## Where to Add New Code

**New Server Action (public/unauthenticated):**

- Implementation: `src/_actions/public/{domain}.action.ts`
- Use `actionClient` from `src/_shared/utils/safe-action.ts`
- Tests: `src/_actions/public/{domain}.action.test.ts`

**New Server Action (admin-only):**

- Implementation: `src/_actions/admin/{domain}.action.ts`
- Use `adminActionClient` or `supervisorActionClient`
- Tests: `src/_actions/admin/{domain}.action.test.ts`

**New DB Query (read):**

- Implementation: `src/_modules/{domain}/{domain}.query.ts`
- Add `import 'server-only'` at the top
- Tests: `src/_modules/{domain}/{domain}.query.test.ts`

**New DB Write:**

- Implementation: `src/_modules/{domain}/{domain}.data.ts`
- Tests: `src/_modules/{domain}/{domain}.data.test.ts`

**New Reusable Component:**

- App-specific: `src/_components/shared/{name}.tsx`
- UI primitive: Only via shadcn CLI → `src/_components/ui/{name}.tsx`

**New Page:**

- Route file: `src/app/[locale]/(public|auth|admin)/admin/{route}/page.tsx`
- Page-local components: `src/app/[locale]/.../{route}/_components/{name}.tsx`

**New Client Hook:**

- Public: `src/_hooks/public/use-{purpose}.ts`
- Admin: `src/_hooks/admin/use-{purpose}.ts`

**New Zod Schema:**

- `src/_schemas/{domain}.ts`
- Export from `src/_schemas/index.ts` barrel

**New i18n Key:**

- Add to all three: `messages/pt-BR.json`, `messages/en.json`, `messages/es.json`

## Special Directories

**`src/_generated/`:**

- Purpose: Prisma-generated TypeScript client
- Generated: Yes — via `npx prisma generate`
- Committed: Yes

**`.planning/`:**

- Purpose: GSD planning documents (phases, codebase maps)
- Generated: By GSD commands
- Committed: Yes

---

_Structure analysis: 2026-06-30_
