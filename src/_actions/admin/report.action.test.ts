import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Report } from '@/_generated/prisma'
import { deleteReportAction, deleteInvestigationNoteAction } from './report.action'
import * as adminData from '@/_modules/admin/admin.data'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

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

  const adminMockAction =
    (
      fn: (args: {
        parsedInput: unknown
        ctx: { user: { id: string; role: string } }
      }) => Promise<unknown>
    ) =>
    async (input: unknown) => {
      if (!mockUser) return { serverError: 'Sessão expirada ou usuário não autenticado' }
      if (mockUser.role !== 'ADMIN')
        return { serverError: 'Acesso negado: Requer privilégios de Administrador' }
      try {
        const result = await fn({ parsedInput: input, ctx: { user: mockUser } })
        return { data: result }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return { serverError: message }
      }
    }

  const adminClientMock = {
    schema: () => ({
      action: adminMockAction,
    }),
  }

  return {
    authActionClient: clientMock,
    supervisorActionClient: clientMock,
    adminActionClient: adminClientMock,
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

      expect(result.serverError).toBe('Acesso negado: Requer privilégios de Administrador')
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

  describe('deleteInvestigationNoteAction', () => {
    it('should pass user.role through to adminData.deleteInvestigationNote', async () => {
      mockUser = { id: 'u1', role: 'ADMIN' }
      vi.mocked(adminData.deleteInvestigationNote).mockResolvedValue(
        undefined as unknown as Awaited<ReturnType<typeof adminData.deleteInvestigationNote>>
      )

      const result = await deleteInvestigationNoteAction({
        noteId: '00000000-0000-0000-0000-000000000001',
        reportId: '00000000-0000-0000-0000-000000000002',
      })

      expect(result.data).toEqual({ success: true, message: 'Nota excluída com sucesso' })
      expect(adminData.deleteInvestigationNote).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001',
        'u1',
        '00000000-0000-0000-0000-000000000002',
        'ADMIN'
      )
    })

    it('should surface the authorization error as serverError for a non-author SUPERVISOR', async () => {
      mockUser = { id: 'u2', role: 'SUPERVISOR' }
      vi.mocked(adminData.deleteInvestigationNote).mockRejectedValue(
        new Error('Você não tem permissão para remover esta nota de investigação')
      )

      const result = await deleteInvestigationNoteAction({
        noteId: '00000000-0000-0000-0000-000000000001',
        reportId: '00000000-0000-0000-0000-000000000002',
      })

      expect(result.serverError).toBe(
        'Você não tem permissão para remover esta nota de investigação'
      )
      expect(adminData.deleteInvestigationNote).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001',
        'u2',
        '00000000-0000-0000-0000-000000000002',
        'SUPERVISOR'
      )
    })
  })
})
