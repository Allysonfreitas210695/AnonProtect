import { describe, expect, it, vi } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { decrypt } from '@/_shared/lib/crypto'
import { getReportById, getReportsPaginated, getQuickStats, getReportStats } from './admin.query'

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
    $queryRaw: vi.fn(),
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

    it('should replace description/messages/notes with [DECRYPT_FAILED] sentinel on decrypt failure', async () => {
      const id = 'r1'
      const mockReport = {
        id,
        description: 'cipher-text',
        redactedDescription: 'cipher-redacted',
        attachments: [],
        messages: [{ id: 'm1', content: 'cipher-msg' }],
        investigationNotes: [{ id: 'n1', content: 'cipher-note' }],
      }
      vi.mocked(prisma.report.findUnique).mockResolvedValue(
        mockReport as unknown as Awaited<ReturnType<typeof prisma.report.findUnique>>
      )
      vi.mocked(decrypt).mockImplementation(() => {
        throw new Error('Decrypt failed')
      })

      const result = await getReportById(id)

      expect(result?.description).toBe('[DECRYPT_FAILED]')
      expect(result?.redactedDescription).toBe('[DECRYPT_FAILED]')
      expect(result?.messages[0].content).toBe('[DECRYPT_FAILED]')
      expect(result?.investigationNotes[0].content).toBe('[DECRYPT_FAILED]')
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

  describe('getReportStats', () => {
    it('should build timelineData via $queryRaw SQL aggregation', async () => {
      vi.mocked(prisma.report.groupBy).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.report.groupBy>>
      )
      vi.mocked(prisma.report.findMany).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.report.findMany>>
      )
      vi.mocked(prisma.category.findMany).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.category.findMany>>
      )
      vi.mocked(prisma.department.findMany).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.department.findMany>>
      )
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        { day: new Date('2026-07-01T00:00:00.000Z'), count: BigInt(3) },
      ])

      const result = await getReportStats()

      expect(prisma.$queryRaw).toHaveBeenCalled()
      expect(result.timelineData).toEqual([{ date: '2026-07-01', count: 3 }])
    })
  })
})
