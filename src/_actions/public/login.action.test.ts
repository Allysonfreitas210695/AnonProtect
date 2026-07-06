import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginAction } from './login.action'
import { signIn } from '@/_shared/lib/auth'
import { checkLoginRateLimit } from '@/_shared/lib/ratelimit'

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}))

vi.mock('@/_shared/lib/ratelimit', () => ({
  checkLoginRateLimit: vi.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: 0,
  }),
}))

const { MockAuthError } = vi.hoisted(() => {
  class MockAuthError extends Error {
    type: string
    constructor(type: string) {
      super(type)
      this.type = type
    }
  }
  return { MockAuthError }
})

vi.mock('@/_shared/lib/auth', () => ({
  signIn: vi.fn(),
}))

vi.mock('next-auth', () => ({
  AuthError: MockAuthError,
}))

vi.mock('@/_shared/utils/safe-action', () => {
  const mockAction =
    (
      schema: { safeParse: (input: unknown) => { success: boolean; data?: unknown } },
      fn: (args: { parsedInput: unknown }) => Promise<unknown>
    ) =>
    async (input: unknown) => {
      const parsed = schema.safeParse(input)
      if (!parsed.success) {
        return { validationErrors: parsed }
      }

      try {
        const result = await fn({ parsedInput: parsed.data })
        return { data: result }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return { serverError: message }
      }
    }

  return {
    actionClient: {
      schema: (schema: { safeParse: (input: unknown) => { success: boolean } }) => ({
        action: (fn: (args: { parsedInput: unknown }) => Promise<unknown>) =>
          mockAction(schema, fn),
      }),
    },
    ActionError: class extends Error {},
  }
})

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkLoginRateLimit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: 0,
    })
  })

  it('should return a rate-limit error and skip signIn when the limit is exceeded', async () => {
    vi.mocked(checkLoginRateLimit).mockResolvedValue({
      success: false,
      limit: 10,
      remaining: 0,
      reset: 900,
    })

    const result = await loginAction({ email: 'user@example.com', password: 'password123' })

    expect(result?.data).toEqual({
      error: 'Muitas tentativas de login. Tente novamente mais tarde.',
    })
    expect(signIn).not.toHaveBeenCalled()
  })

  it('should call signIn normally when the rate limit is not exceeded', async () => {
    vi.mocked(signIn).mockResolvedValue(undefined as never)

    await loginAction({ email: 'user@example.com', password: 'password123' })

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'user@example.com',
      password: 'password123',
      redirectTo: '/admin',
    })
  })

  it('should map CredentialsSignin AuthError to the existing Portuguese message', async () => {
    vi.mocked(signIn).mockRejectedValue(new MockAuthError('CredentialsSignin') as never)

    const result = await loginAction({ email: 'user@example.com', password: 'password123' })

    expect(result?.data).toEqual({ error: 'O e-mail ou a senha inserida está incorreta.' })
  })
})
