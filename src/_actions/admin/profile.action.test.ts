import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProfileAction, updatePasswordAction } from './profile.action'
import { prisma } from '@/_shared/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { User } from '@/_generated/prisma'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

let mockUser: { id: string } | null = null

vi.mock('@/_shared/utils/safe-action', () => {
  const mockAction =
    (fn: (args: { parsedInput: unknown; ctx: { user: { id: string } } }) => Promise<unknown>) =>
    async (input: unknown) => {
      if (!mockUser) return { serverError: 'Não autorizado' }
      try {
        const result = await fn({ parsedInput: input, ctx: { user: mockUser } })
        return { data: result }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return { serverError: message }
      }
    }

  return {
    authActionClient: {
      schema: () => ({
        action: mockAction,
      }),
    },
    ActionError: class extends Error {},
  }
})

describe('Profile Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
  })

  describe('updateProfileAction', () => {
    it('should update profile successfully', async () => {
      mockUser = { id: 'user-1' }
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'user-1',
        name: 'New Name',
        email: 'new@email.com',
      } as unknown as User)

      const result = await updateProfileAction({ name: 'New Name', email: 'new@email.com' })

      expect(result?.data).toEqual({ success: true, message: 'Perfil atualizado com sucesso!' })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'New Name', email: 'new@email.com' },
      })
    })

    it('should return error if not authorized', async () => {
      mockUser = null

      const result = await updateProfileAction({ name: 'Name', email: 'email@test.com' })

      expect(result?.serverError).toBe('Não autorizado')
    })

    it('should return error if email is already in use', async () => {
      mockUser = { id: 'user-1' }
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-2' } as unknown as User)

      const result = await updateProfileAction({ name: 'Name', email: 'email@test.com' })

      expect(result?.data).toEqual({ error: 'Este e-mail já está em uso por outro usuário' })
    })
  })

  describe('updatePasswordAction', () => {
    it('should update password successfully', async () => {
      mockUser = { id: 'user-1' }
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        password: 'old-hashed-password',
      } as unknown as User)
      vi.mocked(compare).mockResolvedValue(true as unknown as never)
      vi.mocked(hash).mockResolvedValue('new-hashed-password' as unknown as never)

      const result = await updatePasswordAction({
        currentPassword: 'old-password',
        newPassword: 'new-password',
        confirmPassword: 'new-password',
      })

      expect(result?.data).toEqual({ success: true, message: 'Senha alterada com sucesso!' })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: 'new-hashed-password' },
      })
    })

    it('should return error if current password is wrong', async () => {
      mockUser = { id: 'user-1' }
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        password: 'old-password',
      } as unknown as User)
      vi.mocked(compare).mockResolvedValue(false as unknown as never)

      const result = await updatePasswordAction({
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
        confirmPassword: 'new-password',
      })

      expect(result?.data).toEqual({ error: 'A senha atual está incorreta' })
    })
  })
})
