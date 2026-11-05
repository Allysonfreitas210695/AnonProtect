import { describe, expect, it, vi, beforeEach } from 'vitest'
import { analyzeReport } from '@/_shared/lib/ai'
import {
  createReport,
  createMessage,
  updateReportAiResults,
  processAiAnalysis,
} from './report.data'
import * as query from './report.query'

// Hoist the mock to avoid "used before initialization" error
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    report: {
      create: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((input) => {
      if (typeof input === 'function') return input(mockPrisma)
      return Promise.all(input)
    }),
  },
}))

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/_shared/lib/crypto', () => ({
  encrypt: vi.fn((text) => `encrypted_${text}`),
  decrypt: vi.fn((text) => text.replace('encrypted_', '')),
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
      expect(mockPrisma.report.create).toHaveBeenCalledWith(
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
      expect(mockPrisma.report.create).toHaveBeenCalledWith(
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
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          reportId: 'r1',
          content: 'encrypted_hello',
          sender: 'USER',
        },
      })
    })
  })

  describe('updateReportAiResults', () => {
    it('should update report and create activity log in transaction', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'c1', name: 'Cat 1' } as unknown as {
        id: string
        name: string
      })

      await updateReportAiResults('r1', 'Cat 1', 'HIGH', 'reason', 'redacted info')

      expect(mockPrisma.report.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: expect.objectContaining({
          priority: 'HIGH',
          categoryId: 'c1',
          redactedDescription: 'encrypted_redacted info',
        }),
      })
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
        redactedDescription: 'redacted info',
      } as unknown as Awaited<ReturnType<typeof analyzeReport>>)

      const ok = await processAiAnalysis('r1', 'description', 'BR')

      expect(ok).toBe(true)
      expect(query.getCategories).toHaveBeenCalled()
      expect(analyzeReport).toHaveBeenCalledWith('description', ['Cat 1'], 'BR')
      expect(mockPrisma.report.update).toHaveBeenCalled()
    })

    it('should handle missing AI analysis', async () => {
      vi.spyOn(query, 'getCategories').mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof query.getCategories>>
      )
      vi.mocked(analyzeReport).mockResolvedValue(null)

      const ok = await processAiAnalysis('r1', 'description')

      expect(ok).toBe(false)
      expect(mockPrisma.report.update).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      vi.spyOn(query, 'getCategories').mockRejectedValue(new Error('DB Error'))

      await expect(processAiAnalysis('r1', 'desc')).resolves.toBe(false)
    })
  })
})
