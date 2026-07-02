import { describe, expect, it, vi } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { getReportById, getReportsPaginated, getQuickStats } from './admin.query'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    report: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    category: { findMany: vi.fn() },
    department: { findMany: vi.fn() },
  },
}))

vi.mock('@/_shared/lib/aws', () => ({
  getDownloadUrl: vi.fn().mockResolvedValue('http://signed-url.com'),
}))

vi.mock('@/_shared/lib/crypto', () => ({
  decrypt: vi.fn((val) => val),
}))

describe('admin.query', () => {
  describe('getReportById', () => {
    it('should return report with inclusions and signed urls', async () => {
      const id = 'r1'
      const mockReport = {
        id,
        description: 'cipher-text',
        attachments: [{ key: 'k1', url: 'orig-url' }],
        messages: [],
        investigationNotes: [],
      }
      vi.mocked(prisma.report.findUnique).mockResolvedValue(
        mockReport as unknown as Awaited<ReturnType<typeof prisma.report.findUnique>>
      )

      const result = await getReportById(id)

      expect(prisma.report.findUnique).toHaveBeenCalled()
      expect(result?.attachments[0].url).toBe('http://signed-url.com')
    })

    it('should fetch messages uncapped, without a take limit', async () => {
      const id = 'r1'
      const mockReport = {
        id,
        description: 'cipher-text',
        attachments: [],
        messages: [],
        investigationNotes: [],
      }
      vi.mocked(prisma.report.findUnique).mockResolvedValue(
        mockReport as unknown as Awaited<ReturnType<typeof prisma.report.findUnique>>
      )

      await getReportById(id)

      const callArg = vi.mocked(prisma.report.findUnique).mock.calls[0][0]
      expect(callArg?.include?.messages).toEqual({ orderBy: { createdAt: 'asc' } })
    })
  })

  describe('getReportsPaginated', () => {
    it('should handle pagination', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.report.findMany>>
      )
      vi.mocked(prisma.report.count).mockResolvedValue(0 as unknown as number)

      const result = await getReportsPaginated(2, 10)

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )
      expect(result.page).toBe(2)
    })
  })

  describe('getQuickStats', () => {
    it('should return aggregated counts', async () => {
      vi.mocked(prisma.report.count).mockResolvedValue(5 as unknown as number)

      const result = await getQuickStats()

      expect(result.total).toBe(5)
      expect(prisma.report.count).toHaveBeenCalled()
    })
  })
})
