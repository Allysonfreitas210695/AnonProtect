import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReportAction } from '../report.action'
import * as reportRepository from '@/_data-access/public/report.repository'

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
        type: 'Assédio',
        description: 'Descrição detalhada de um incidente de assédio no ambiente de trabalho.',
      }

      const mockReport = {
        id: 'c7333642-1e74-42f5-9377-df83d284693a',
        trackingCode: 'ANON-123456',
        ...input
      }

      // Mock repository call
      vi.mocked(reportRepository.createReport).mockResolvedValue(mockReport as any)

      const result = await submitReportAction(input)

      expect(reportRepository.createReport).toHaveBeenCalledWith(input)
      expect(result?.data).toEqual({ 
        success: true, 
        trackingCode: 'ANON-123456' 
      })
    })

    it('should fail if description is too short', async () => {
      const input = {
        type: 'Assédio',
        description: 'Curto', // Min 10
      }

      const result = await submitReportAction(input)

      expect(result?.validationErrors).toBeDefined()
      expect(reportRepository.createReport).not.toHaveBeenCalled()
    })
  })
})
