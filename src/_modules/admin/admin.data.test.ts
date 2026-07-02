import { describe, expect, it, vi } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import {
  softDeleteReport,
  updateReportStatus,
  forwardReport,
  createAdminReply,
  createInvestigationNote,
} from './admin.data'

vi.mock('@/_shared/lib/crypto', () => ({
  encrypt: vi.fn((text: string) => `encrypted_${text}`),
}))

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    report: {
      update: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
    investigationNote: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((input) => {
      if (typeof input === 'function') return input(prisma)
      return Promise.all(input)
    }),
  },
}))

describe('admin.data', () => {
  describe('softDeleteReport', () => {
    it('should set deletedAt', async () => {
      const id = 'r1'
      await softDeleteReport(id)
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id },
        data: { deletedAt: expect.any(Date) },
      })
    })
  })

  describe('updateReportStatus', () => {
    it('should update status and create log if userId provided', async () => {
      const id = 'r1'
      const status = 'RESOLVED'
      const userId = 'u1'

      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        status: 'PENDING',
        trackingCode: 'AP-1234',
      } as unknown as Awaited<ReturnType<typeof prisma.report.findUnique>>)

      vi.mocked(prisma.report.update).mockResolvedValue({ id, status } as unknown as Awaited<
        ReturnType<typeof prisma.report.update>
      >)

      await updateReportStatus(id, status, userId)

      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id },
        data: { status },
      })
      expect(prisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          reportId: id,
          userId,
          action: 'STATUS_CHANGED',
          description: `Status alterado para ${status}`,
        },
      })
    })
  })

  describe('forwardReport', () => {
    it('should update department and status in transaction', async () => {
      const id = 'r1'
      const deptId = 'd1'
      const userId = 'u1'
      const desc = 'Forwarding'

      await forwardReport(id, deptId, userId, desc)

      // Since we mocked $transaction to just run the callback, we check the calls inside
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          assignedDepartmentId: deptId,
          status: 'IN_PROGRESS',
        },
      })
      expect(prisma.activityLog.create).toHaveBeenCalled()
    })
  })

  describe('createAdminReply', () => {
    it('should encrypt content before persisting', async () => {
      await createAdminReply('r1', 'u1', 'admin message')
      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: 'encrypted_admin message',
            sender: 'ADMIN',
          }),
        })
      )
    })
  })

  describe('createInvestigationNote', () => {
    it('should encrypt content before persisting', async () => {
      await createInvestigationNote('r1', 'u1', 'investigation note')
      expect(prisma.investigationNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: 'encrypted_investigation note',
          }),
        })
      )
    })
  })
})
