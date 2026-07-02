/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendPasswordResetEmailAction, resetPasswordAction } from './reset-password.action'
import { prisma } from '@/_shared/lib/prisma'
import { sendEmail } from '@/_shared/lib/aws'
import bcrypt from 'bcryptjs'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/_shared/lib/aws', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed-password')),
  },
}))

describe('Reset Password Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendPasswordResetEmailAction', () => {
    it('should return success even if user does not exist (prevent enumeration)', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const result = await sendPasswordResetEmailAction({ email: 'notfound@example.com' })

      expect(result?.data?.success).toBe(true)
      expect(prisma.verificationToken.create).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('should generate token, save it, and send email if user exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        email: 'admin@example.com',
        name: 'Admin',
      } as any)
      vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 0 })
      vi.mocked(prisma.verificationToken.create).mockResolvedValue({} as any)

      const result = await sendPasswordResetEmailAction({ email: 'admin@example.com' })

      expect(result?.data?.success).toBe(true)
      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: 'admin@example.com' },
      })
      expect(prisma.verificationToken.create).toHaveBeenCalled()
      expect(sendEmail).toHaveBeenCalled()
    })
  })

  describe('resetPasswordAction', () => {
    it('should return error if token is invalid or does not exist', async () => {
      vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(null)

      const result = await resetPasswordAction({
        token: 'invalid-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })

      expect(result?.data?.error).toBe('O token fornecido é inválido ou já foi utilizado.')
    })

    it('should return error if token is expired and delete it', async () => {
      vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue({
        identifier: 'admin@example.com',
        token: 'expired-token',
        expires: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
      } as any)

      const result = await resetPasswordAction({
        token: 'expired-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })

      expect(result?.data?.error).toBe('O token expirou. Solicite um novo link de recuperação.')
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { token: 'expired-token' },
      })
    })

    it('should hash password, update user, delete token and return success', async () => {
      vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue({
        identifier: 'admin@example.com',
        token: 'valid-token',
        expires: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
      } as any)

      const result = await resetPasswordAction({
        token: 'valid-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })

      expect(result?.data?.success).toBe(true)
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
        data: { password: 'hashed-password' },
      })
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
      })
    })
  })
})
