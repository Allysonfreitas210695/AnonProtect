import { describe, expect, it, vi, beforeEach } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { analyzeReport } from '@/_shared/lib/ai'
import {
  createReport,
  createMessage,
  updateReportAiResults,
  processAiAnalysis,
} from './report.data'
import * as query from './report.query'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    report: {
      create: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((input) => {
      if (typeof input === 'function') return input(prisma)
      return Promise.all(input)
    }),
  },
}))

vi.mock('@/_shared/lib/ai', () => ({
  analyzeReport: vi.fn(),
}))

vi.mock('@/_shared/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('report.data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createReport', () => {
    it('should create report with activity log', async () => {
      const data = {
        trackingCode: 'TR123',
        categoryId: 'cat1',
        description: 'Test report',
      }
      await createReport(data)
      expect(prisma.report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            trackingCode: 'TR123',
            activityLogs: expect.anything(),
          }),
        })
      )
    })

    it('should include attachments if provided', async () => {
      const data = {
        trackingCode: 'TR123',
        categoryId: 'cat1',
        description: 'Test report',
        attachments: [{ url: 'u', key: 'k', fileName: 'f', fileSize: 10, type: 't' }],
      }
      await createReport(data)
      expect(prisma.report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attachments: {
              create: [expect.objectContaining({ key: 'k' })],
            },
          }),
        })
      )
    })
  })

  describe('createMessage', () => {
    it('should create message with SENDER as USER', async () => {
      await createMessage('r1', 'hello')
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          reportId: 'r1',
          content: 'hello',
          sender: 'USER',
        },
      })
    })
  })

  describe('updateReportAiResults', () => {
    it('should update report and create activity log in transaction', async () => {
      const data = { priority: 'HIGH', assignedDepartmentId: 'd1', aiReasoning: 'reason' }
      await updateReportAiResults('r1', data)

      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { priority: 'HIGH', assignedDepartmentId: 'd1' },
      })
      expect(prisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reportId: 'r1',
            action: 'AI_ANALYZED',
          }),
        })
      )
    })
  })

  describe('processAiAnalysis', () => {
    it('should coordinate AI analysis and update results', async () => {
      const categories = [{ id: 'c1', name: 'Cat 1', defaultDepartmentId: 'd1' }]
      vi.spyOn(query, 'getCategories').mockResolvedValue(
        categories as unknown as Awaited<ReturnType<typeof query.getCategories>>
      )
      vi.mocked(analyzeReport).mockResolvedValue({
        suggestedCategory: 'Cat 1',
        priority: 'HIGH',
        reasoning: 'AI reasoning',
      } as unknown as Awaited<ReturnType<typeof analyzeReport>>)

      await processAiAnalysis('r1', 'description', 'BR')

      expect(query.getCategories).toHaveBeenCalled()
      expect(analyzeReport).toHaveBeenCalledWith('description', ['Cat 1'], 'BR')
      expect(prisma.report.update).toHaveBeenCalled()
    })

    it('should handle missing AI analysis', async () => {
      vi.spyOn(query, 'getCategories').mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof query.getCategories>>
      )
      vi.mocked(analyzeReport).mockResolvedValue(null)

      await processAiAnalysis('r1', 'description')

      expect(prisma.report.update).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      vi.spyOn(query, 'getCategories').mockRejectedValue(new Error('DB Error'))

      await expect(processAiAnalysis('r1', 'desc')).resolves.not.toThrow()
    })
  })
})
