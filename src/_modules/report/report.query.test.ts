/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { decrypt } from '@/_shared/lib/crypto'
import { getCategories, getActiveCategories, getReportByCode, getPublicStats } from './report.query'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
    report: {
      findUnique: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/_shared/lib/crypto', () => ({
  decrypt: vi.fn((val) => val),
}))

describe('report.query', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should return active categories', async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([
        {
          id: '1',
          name: 'Cat 1',
          defaultDepartmentId: 'd1',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as unknown as Awaited<ReturnType<typeof prisma.category.findMany>>)

      const result = await getCategories()

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { active: true } })
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('getActiveCategories', () => {
    it('should return active categories ordered by name', async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.category.findMany>>
      )
      await getActiveCategories()
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true },
          orderBy: { name: 'asc' },
        })
      )
    })
  })

  describe('getReportByCode', () => {
    it('should find report and decrypt description', async () => {
      const mockReport = {
        trackingCode: 'TR123',
        description: 'cipher-text',
        messages: [],
      }
      vi.mocked(prisma.report.findUnique).mockResolvedValue(
        mockReport as unknown as Awaited<ReturnType<typeof prisma.report.findUnique>>
      )
      vi.mocked(decrypt).mockReturnValue('plain-text')

      const result = await getReportByCode('TR123')

      expect(prisma.report.findUnique).toHaveBeenCalled()
      expect(decrypt).toHaveBeenCalledWith('cipher-text')
      expect(result?.description).toBe('plain-text')
    })

    it('should handle decryption failure gracefully', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        description: 'bad',
        messages: [],
      } as unknown as Awaited<ReturnType<typeof prisma.report.findUnique>>)
      vi.mocked(decrypt).mockImplementation(() => {
        throw new Error('Decrypt failed')
      })

      const result = await getReportByCode('TR123')

      expect(result?.description).toBe('[DECRYPT_FAILED]')
    })

    it('should return null if report not found', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(null)
      const result = await getReportByCode('NOT_FOUND')
      expect(result).toBeNull()
    })
  })

  describe('getPublicStats', () => {
    it('should calculate statistics and timeline', async () => {
      vi.mocked(prisma.report.count).mockResolvedValue(10 as unknown as number)
      vi.mocked(prisma.report.groupBy).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof prisma.report.groupBy>>
      )
      vi.mocked(prisma.report.groupBy).mockResolvedValueOnce([
        { categoryId: 'c1', _count: { _all: 3 } } as any,
      ])

      vi.mocked(prisma.category.findMany).mockResolvedValue([{ id: 'c1', name: 'Cat 1' }] as any)

      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
        { month: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), count: BigInt(1) },
      ] as any)

      const result = await getPublicStats()

      expect(result).toHaveProperty('totalReports', 10)
      expect(result).toHaveProperty('timelineStats')
      expect(result.timelineStats).toHaveLength(12)
    })
  })
})
