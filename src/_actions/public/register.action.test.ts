import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerAction } from './register.action'

describe('Register Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw ActionError when called', async () => {
    const result = await registerAction({
      name: 'Test User',
      email: 'test@email.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result?.serverError).toBe('Registro desabilitado')
  })
})
