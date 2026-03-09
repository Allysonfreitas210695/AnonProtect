import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock 'server-only'
vi.mock('server-only', () => ({}))

process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock'

// Run cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
  notFound: vi.fn(),
}))

// Mock next-auth
vi.mock('next-auth', () => {
  const mockAuth = {
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }
  return {
    default: vi.fn(() => mockAuth),
    ...mockAuth,
  }
})
