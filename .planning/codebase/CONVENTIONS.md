# Coding Conventions

**Analysis Date:** 2026-06-30

## Naming Patterns

**Files:**

- kebab-case for all source files: `report.action.ts`, `use-investigation-notes.ts`, `status-badge.tsx`
- Suffix encodes layer: `.action.ts` (server actions), `.data.ts` (write DAL), `.query.ts` (read DAL), `.query.ts`
- Tests co-located with same base name: `report.action.ts` → `report.action.test.ts` or `report.action.spec.ts`

**Functions:**

- camelCase for all functions: `submitReportAction`, `generateTrackingCode`, `verifyTurnstile`
- Server action exports are named constants: `export const submitReportAction = actionClient...`
- Action helpers (not exported) are plain `async function` declarations

**Variables:**

- camelCase: `parsedInput`, `trackingCode`, `encryptedDescription`, `rateLimitOk`
- Destructuring from parsedInput is standard: `{ parsedInput: { reportId, content }, ctx: { user } }`

**Types:**

- PascalCase for interfaces and type aliases: `ReportInput`, `ReportWithCategory`, `ActionError`
- Infer types from Zod schemas using `z.infer<typeof schema>`: `type ReportInput = z.infer<typeof reportSchema>`
- Prisma model types imported directly from `@/_generated/prisma`

**Components:**

- PascalCase function components: `StatusBadge`, `InvestigationNotes`
- Named exports (not default): `export function StatusBadge`

## Code Style

**Formatting (Prettier):**

- No semicolons (`"semi": false`)
- Single quotes (`"singleQuote": true`)
- 2-space indentation (`"tabWidth": 2`)
- Trailing commas in ES5 positions (`"trailingComma": "es5"`)
- Max line width 100 chars (`"printWidth": 100`)
- Arrow functions always parenthesized (`"arrowParens": "always"`)
- Tailwind class sorting via `prettier-plugin-tailwindcss`

**Linting:**

- ESLint with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- `eslint-config-prettier/flat` disables formatting rules that conflict with Prettier
- `src/_generated/**` excluded from linting (do not edit manually)

## Import Organization

**Path Aliases:**

- `@/` maps to `src/` — use in all non-relative imports
- Example: `import { prisma } from '@/_shared/lib/prisma'`

**Layer import rules:**

- Server Actions import from `@/_modules/*/` (data layer) and `@/_shared/lib/` (singletons)
- Data/Query modules import from `@/_shared/lib/prisma` only
- Components import from `@/_hooks/*/` and `@/_components/*/`
- Schemas imported from `@/_schemas/` by both actions and client forms

**Order (observed pattern):**

1. `'use server'` directive (action files only, first line)
2. External packages
3. Internal `@/_shared/` imports
4. Internal `@/_modules/` or `@/_actions/` imports
5. Local relative imports

## Error Handling

**In middleware (safe-action clients):**

- Throw plain `new Error('message')` for auth/authorization failures
- `handleServerError` in `actionClient` catches and surfaces `e.message` as `serverError`
- Error messages are in Portuguese (Brazilian): `'Sessão expirada ou usuário não autenticado'`

**In action bodies:**

- Wrap business logic in `try/catch` and re-throw as `new ActionError(message)`
- `ActionError` extends `Error` and is exported from `@/_shared/utils/safe-action`
- Example pattern from `src/_actions/admin/report.action.ts`:
  ```typescript
  try {
    await adminData.updateReportStatus(reportId, status, user.id)
    return { success: true, message: 'Status atualizado com sucesso' }
  } catch (error) {
    throw new ActionError(error instanceof Error ? error.message : 'Falha ao atualizar status')
  }
  ```

**In data/query modules:**

- Functions throw naturally; callers (actions) handle errors
- `processAiAnalysis` in `src/_modules/report/report.data.ts` catches its own errors and resolves gracefully (fire-and-forget AI calls)

## Logging

**Framework:** `pino` via singleton at `src/_shared/lib/logger.ts` — import as `{ logger }`

**Patterns:**

- Structured log with context object first, message string second: `logger.info({ trackingCode, reportId }, 'Denúncia registrada com sucesso')`
- Log at action entry: `logger.info({ categoryId }, 'Iniciando submissão de nova denúncia')`
- Log at action success: `logger.info({ trackingCode, reportId }, 'Denúncia registrada com sucesso')`
- Errors use `logger.error`; debug-level calls avoided in production paths

## Server Actions Pattern

Every server action file starts with `'use server'` as the first line.

Actions are defined as exported named constants using the appropriate tiered client:

```typescript
'use server'

import { supervisorActionClient } from '@/_shared/utils/safe-action'
import { someSchema } from '@/_schemas/some'

export const doSomethingAction = supervisorActionClient
  .schema(someSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // ...
    return { success: true, message: '...' }
  })
```

**Schema placement:**

- Shared schemas (used in both actions and client-side forms) → `src/_schemas/<entity>.ts`
- Action-local schemas (single use) → defined inline in the action file with `z.object({...})`

## Zod Schema Patterns

Schemas live in `src/_schemas/` and follow this structure:

```typescript
import { z } from 'zod'

export const entitySchema = z.object({
  id: z.string().uuid('Selecione uma categoria válida'),
  name: z.string().min(1, 'Nome é obrigatório'),
})

export type EntityInput = z.infer<typeof entitySchema>
```

- Validation messages are in Portuguese
- Refinements used for business rules: `z.boolean().refine((val) => val === true, { message: '...' })`
- `z.nativeEnum(PrismaEnum)` for Prisma enum fields

## Commit Messages

Conventional Commits enforced by `commitlint` + `husky`. Format:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`

Config: `commitlint.config.js` extends `@commitlint/config-conventional`.

## Comments

- Inline comments for non-obvious decisions (e.g., `// Hoist the mock to avoid "used before initialization" error`)
- No JSDoc on internal functions
- No block comments for standard patterns

---

_Convention analysis: 2026-06-30_
