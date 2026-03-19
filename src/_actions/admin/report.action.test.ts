import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Report } from '@/_generated/prisma'
import { deleteReportAction } from './report.action'
import * as adminData from '@/_modules/admin/admin.data'

vi.mock('@/_modules/admin/admin.data', () => ({
  softDeleteReport: vi.fn(),
  updateReportStatus: vi.fn(),
  createAdminReply: vi.fn(),
  createInvestigationNote: vi.fn(),
  deleteInvestigationNote: vi.fn(),
  forwardReport: vi.fn(),
  updateReportsStatus: vi.fn(),
}))

let mockUser: { id: string; role: string } | null = null

vi.mock('@/_shared/utils/safe-action', () => {
  const mockAction =
    (
      fn: (args: {
        parsedInput: unknown
        ctx: { user: { id: string; role: string } }
      }) => Promise<unknown>
    ) =>
    async (input: unknown) => {
      if (!mockUser) return { serverError: 'Sessão expirada ou usuário não autenticado' }
      try {
        const result = await fn({ parsedInput: input, ctx: { user: mockUser } })
        return { data: result }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return { serverError: message }
      }
    }

  const clientMock = {
    schema: () => ({
      action: mockAction,
    }),
  }

  return {
    authActionClient: clientMock,
    supervisorActionClient: clientMock,
    adminActionClient: clientMock,
    ActionError: class extends Error {},
  }
})

describe('Admin Report Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deleteReportAction', () => {
    it('should block non-admin users', async () => {
      mockUser = { id: 'u1', role: 'SUPERVISOR' }

      const result = await deleteReportAction({ reportId: '00000000-0000-0000-0000-000000000000' })

      expect(result.serverError).toBe(
        'Acesso negado: Somente administradores podem excluir denúncias'
      )
      expect(adminData.softDeleteReport).not.toHaveBeenCalled()
    })

    it('should allow admin users to soft delete', async () => {
      mockUser = { id: 'admin-1', role: 'ADMIN' }
      vi.mocked(adminData.softDeleteReport).mockResolvedValue({ id: 'r1' } as unknown as Report)

      const result = await deleteReportAction({ reportId: '00000000-0000-0000-0000-000000000000' })

      expect(result.data).toEqual({ success: true, message: 'Denúncia excluída com sucesso' })
      expect(adminData.softDeleteReport).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000000'
      )
    })
  })
})
