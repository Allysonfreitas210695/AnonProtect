# Testing Patterns

**Analysis Date:** 2026-06-30

## Test Framework

**Runner:**

- Vitest ^4.0.18
- Config: `vitest.config.ts`
- Environment: jsdom (configured globally)
- Globals enabled (`globals: true`) — no need to import `describe`, `it`, `expect` in test files (though explicit imports are used throughout for clarity)

**Assertion Library:**

- `@testing-library/jest-dom` ^6.9.1 (loaded via setup file)
- Vitest built-in `expect`

**Component Testing:**

- `@testing-library/react` ^16.3.2 — `render`, `screen`, `act`, `renderHook`

**Mocking:**

- `vitest-mock-extended` ^3.1.0 — `mockDeep`, `mockReset`, `DeepMockProxy` for Prisma

**Run Commands:**

```bash
npm test                                              # Run all tests (one-shot)
npm run test:watch                                    # Vitest in watch mode
npx vitest run src/_actions/public/report.action.test.ts  # Single test file
```

Coverage is not configured — no `@vitest/coverage-*` provider in dependencies.

## Test File Organization

**Location:**

- Co-located with source files (primary pattern): `src/_actions/public/report.action.ts` → `src/_actions/public/report.action.test.ts`
- Some files use `__tests__/` subdirectory: `src/_hooks/admin/__tests__/use-investigation-notes.spec.ts`
- Integration tests: `src/__tests__/integration/`
- Global setup/mocks: `src/__tests__/setup.ts`, `src/__tests__/mocks/prisma.ts`

**Naming:**

- Both `.test.ts` and `.spec.ts` are used interchangeably — no enforced rule
- TSX tests for component files: `status-badge.spec.tsx`

**Structure:**

```
src/
├── __tests__/
│   ├── setup.ts                  # Global setup (loaded by vitest.config.ts)
│   ├── mocks/
│   │   └── prisma.ts             # Prisma deep mock factory
│   └── integration/
│       └── role-flows.spec.ts    # Cross-cutting RBAC integration tests
├── _actions/
│   ├── public/
│   │   ├── report.action.ts
│   │   └── report.action.test.ts  # Co-located unit test
│   └── admin/
│       ├── category.action.ts
│       └── category.action.spec.ts
├── _modules/
│   └── report/
│       ├── report.query.ts
│       ├── report.query.test.ts
│       ├── report.data.ts
│       └── report.data.test.ts
└── _components/
    └── shared/
        ├── status-badge.tsx
        └── status-badge.spec.tsx
```

## Test Structure

**Suite Organization:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('functionName', () => {
    it('should do X when Y', async () => {
      // arrange
      // act
      // assert
    })
  })
})
```

**Patterns:**

- Always `vi.clearAllMocks()` in `beforeEach` — never `vi.resetAllMocks()`
- Nested `describe` groups by function/method name
- `it` descriptions follow "should <behavior> when <condition>" style
- Async tests use `async/await` throughout — no `.then()` chains

## Mocking

**Framework:** `vi.mock()` from Vitest

**Global mocks (auto-applied via `src/__tests__/setup.ts`):**

- `pino` — replaced with vi.fn() returning stub logger methods
- `server-only` — replaced with empty module `{}`
- `next/navigation` — `useRouter`, `useSearchParams`, `usePathname`, `notFound` all stubbed
- `next-auth` — `auth`, `signIn`, `signOut`, handlers stubbed
- `process.env.DATABASE_URL` — set to `'postgresql://mock:mock@localhost:5432/mock'`

**Prisma mock (`src/__tests__/mocks/prisma.ts`):**

```typescript
import { PrismaClient } from '@/_generated/prisma'
import { beforeEach, vi } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

vi.mock('@/shared/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '@/_shared/lib/prisma'
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})
```

Import this file at the top of any test that needs the Prisma mock. **Do not** import `src/__tests__/setup.ts` explicitly — it is auto-loaded by vitest.config.ts.

**Inline module mocking (most common pattern):**

```typescript
vi.mock('@/_modules/report/report.data', () => ({
  createReport: vi.fn(),
  processAiAnalysis: vi.fn(),
}))

// Then in tests:
vi.mocked(reportData.createReport).mockResolvedValue({
  id: 'r1',
  trackingCode: 'AP-TEST',
} as unknown as Report)
```

**Hoisted mocks (when mock is referenced before vi.mock runs):**

```typescript
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    report: { create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn((input) => {
      if (typeof input === 'function') return input(mockPrisma)
      return Promise.all(input)
    }),
  },
}))

vi.mock('@/_shared/lib/prisma', () => ({ prisma: mockPrisma }))
```

Used in `src/_modules/report/report.data.test.ts` for `$transaction` support.

**What to Mock:**

- All external I/O: Prisma, AWS SDK, Google AI, fetch calls, Redis
- Next.js framework modules: `next/cache`, `next/headers`, `next/navigation`
- Logger (`pino`) — always mocked to prevent output during tests
- `server-only` — always mocked (prevents import-time error in jsdom)
- `bcryptjs` when testing password logic

**What NOT to Mock:**

- The module under test itself
- Pure utility functions (formatters, validators, crypto) — test against real implementations
- Zod schemas — import and use real schemas in action tests

## Two Strategies for Server Action Testing

**Strategy 1 — Mock the safe-action client (unit isolation):**
Used in `src/_actions/admin/category.action.spec.ts`. Replace `adminActionClient` with a lightweight inline stub that directly calls the action function:

```typescript
vi.mock('@/_shared/utils/safe-action', () => {
  const mockAction =
    (
      fn: (args: {
        parsedInput: unknown
        ctx: { user: { id: string; role: string } }
      }) => Promise<unknown>
    ) =>
    async (input: unknown) => {
      try {
        const result = await fn({
          parsedInput: input,
          ctx: { user: { id: 'user-1', role: 'ADMIN' } },
        })
        return { data: result }
      } catch (e: unknown) {
        return { serverError: e instanceof Error ? e.message : 'Unknown error' }
      }
    }
  return {
    adminActionClient: { schema: () => ({ action: mockAction }) },
    ActionError: class extends Error {},
  }
})
```

**Strategy 2 — Mock auth only, let real middleware run (integration/RBAC):**
Used in `src/__tests__/integration/role-flows.spec.ts`. Mock `getCurrentUser` with a mutable variable and test real RBAC enforcement:

```typescript
let mockUser: { id: string; role: string; name: string } | null = null
vi.mock('@/_shared/lib/auth', () => ({
  getCurrentUser: vi.fn(() => Promise.resolve(mockUser)),
}))

describe('ADMIN Persona', () => {
  beforeEach(() => { mockUser = { id: 'admin-1', role: 'ADMIN', name: 'Admin User' } })
  it('should allow ADMIN to create a category', async () => { ... })
})
```

Use Strategy 1 for testing action business logic in isolation. Use Strategy 2 for testing authorization flows.

## Component Tests

Use `@testing-library/react`:

```typescript
import { render, screen } from '@testing-library/react'

it('should render correct label for PENDING status', () => {
  render(<StatusBadge status={ReportStatus.PENDING} />)
  expect(screen.getByText('Pendente')).toBeInTheDocument()
})
```

Mock `next-intl`'s `useTranslations` with an inline key→string map:

```typescript
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = { PENDING: 'Pendente', ... }
    return messages[key] || key
  },
}))
```

## Hook Tests

Use `renderHook` and `act` from `@testing-library/react`:

```typescript
import { renderHook, act } from '@testing-library/react'

it('should initialize with default values', () => {
  const { result } = renderHook(() => useInvestigationNotes('report-123'))
  expect(result.current.isCreating).toBe(false)
})

it('should handle submit', async () => {
  const { result } = renderHook(() => useInvestigationNotes('report-123'))
  await act(async () => {
    await result.current.onSubmitCreate({ content: 'Test note' })
  })
})
```

Mock `react-hook-form` partially using `vi.importActual`:

```typescript
vi.mock('react-hook-form', async () => {
  const actual = (await vi.importActual('react-hook-form')) as Record<string, unknown>
  return { ...actual, useForm: () => ({ handleSubmit: (fn) => fn, reset: vi.fn(), control: {} }) }
})
```

## Environment Variables in Tests

Set directly on `process.env` in `beforeEach` or at module scope:

```typescript
beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
})
```

Use `vi.stubEnv('KEY', 'value')` for tests that need to verify behavior with/without a variable:

```typescript
vi.stubEnv('ENCRYPTION_KEY', mockKey)
```

## Common Patterns

**Async Testing:**

```typescript
it('should return data', async () => {
  vi.mocked(someModule.fn).mockResolvedValue(expectedValue)
  const result = await actionUnderTest(input)
  expect(result.data).toEqual(expectedValue)
})
```

**Error Testing:**

```typescript
it('should return serverError on failure', async () => {
  const result = await actionUnderTest(input)
  expect(result?.serverError).toBe('Expected error message')
})

it('should throw on crypto failure', () => {
  expect(() => encrypt('test')).toThrow(
    'ENCRYPTION_KEY must be a 32-byte hex string (64 characters)'
  )
})
```

**Graceful error handling (resolves without throwing):**

```typescript
it('should handle errors gracefully', async () => {
  vi.spyOn(query, 'getCategories').mockRejectedValue(new Error('DB Error'))
  await expect(processAiAnalysis('r1', 'desc')).resolves.not.toThrow()
})
```

**Partial argument matching:**

```typescript
expect(prisma.category.findMany).toHaveBeenCalledWith(
  expect.objectContaining({ where: { active: true } })
)
```

## Coverage

**Requirements:** None enforced — no coverage provider configured.

**View Coverage:** Not available without adding `@vitest/coverage-v8` or `@vitest/coverage-istanbul`.

## Test Types

**Unit Tests (majority):**

- Scope: single function or module
- Location: co-located `.test.ts` / `.spec.ts`
- Mock all dependencies

**Integration Tests:**

- Scope: cross-cutting RBAC and multi-module flows
- Location: `src/__tests__/integration/`
- Use real middleware, mock only auth and data layer

**Component Tests:**

- Scope: single React component render and interaction
- Framework: `@testing-library/react`

**E2E Tests:** Not used.

---

_Testing analysis: 2026-06-30_
