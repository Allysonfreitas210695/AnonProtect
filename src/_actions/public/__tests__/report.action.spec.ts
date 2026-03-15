import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReportAction } from '../report.action'
import * as reportRepository from '@/_data-access/public/report.repository'
import { ReportWithCategory } from '@/_types/report'

// Mock repository
vi.mock('@/_data-access/public/report.repository', () => ({
  createReport: vi.fn(),
}))

describe('Public Report Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submitReportAction', () => {
    it('should create a report and return a tracking code', async () => {
      const input = {
        categoryId: 'c7333642-1e74-42f5-9377-df83d284693a',
        description: 'Descrição detalhada de um incidente de assédio no ambiente de trabalho.',
      }

      const mockReport: ReportWithCategory = {
        id: 'c7333642-1e74-42f5-9377-df83d284693a',
        trackingCode: 'AP-2026-TEST',
        categoryId: input.categoryId,
        description: input.description,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedToId: null,
        assignedDepartmentId: null,
        category: {
          id: input.categoryId,
          name: 'Assédio',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
          defaultDepartmentId: null,
        },
      }

      // Mock repository call
      vi.mocked(reportRepository.createReport).mockResolvedValue(mockReport as never)

      const result = await submitReportAction(input)

      expect(reportRepository.createReport).toHaveBeenCalledWith(input)
      expect(result?.data).toEqual({
        success: true,
        trackingCode: 'AP-2026-TEST',
      })
    })

    it('should fail if description is too short', async () => {
      const input = {
        categoryId: 'c7333642-1e74-42f5-9377-df83d284693a',
        description: 'Curto', // Min 10
      }

      const result = await submitReportAction(input)

      expect(result?.validationErrors).toBeDefined()
      expect(reportRepository.createReport).not.toHaveBeenCalled()
    })
  })
})
