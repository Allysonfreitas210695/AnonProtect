/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerAction } from './register.action'
import { prisma } from '@/_shared/lib/prisma'
import { hash } from 'bcryptjs'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
}))

describe('Register Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(hash).mockResolvedValue('hashed-password' as any)
    vi.mocked(prisma.user.create).mockResolvedValue({} as any)

    const result = await registerAction({
      name: 'Test User',
      email: 'test@email.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    expect(result?.data).toEqual({
      success: true,
      message: 'Conta criada com sucesso! Faça login.',
    })
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Test User',
        email: 'test@email.com',
        password: 'hashed-password',
        role: 'SUPERVISOR',
      }),
    })
  })

  it('should return error if email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing' } as any)

    const result = await registerAction({
      name: 'Test User',
      email: 'test@email.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    expect(result?.data).toEqual({ error: 'Este email já está em uso' })
  })
})
