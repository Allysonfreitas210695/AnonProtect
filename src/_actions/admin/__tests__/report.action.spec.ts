import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateReportStatusAction, forwardReportAction } from '../report.action'
import { revalidatePath } from 'next/cache'
import * as reportRepository from '@/_data-access/admin/report.repository'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock auth
vi.mock('@/_lib/auth', () => ({
  getCurrentUser: vi.fn(() => Promise.resolve({
    id: 'user-1',
    name: 'Admin User',
    role: 'ADMIN',
  })),
}))

// Mock repository
vi.mock('@/_data-access/admin/report.repository', () => ({
  updateReportStatus: vi.fn(),
  forwardReport: vi.fn(),
}))

describe('Report Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateReportStatusAction', () => {
    it('should update report status and revalidate path', async () => {
      const input = {
        reportId: 'c7333642-1e74-42f5-9377-df83d284693a',
        status: 'IN_PROGRESS' as const,
      }

      const result = await updateReportStatusAction(input)

      expect(reportRepository.updateReportStatus).toHaveBeenCalledWith(input.reportId, input.status)
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/report/${input.reportId}`)
      expect(result?.data).toEqual({ success: true, message: 'Status atualizado com sucesso' })
    })
  })

  describe('forwardReportAction', () => {
    it('should forward report to department and log activity', async () => {
      const input = {
        reportId: 'c7333642-1e74-42f5-9377-df83d284693a',
        departmentId: '76527633-90d5-455b-bf49-ccda25a72099',
        description: 'Encaminhando para RH',
      }
      
      const result = await forwardReportAction(input)

      expect(reportRepository.forwardReport).toHaveBeenCalledWith(
        input.reportId, 
        input.departmentId, 
        expect.any(String), // Match any user ID for now
        input.description
      )
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/report/${input.reportId}`)
      expect(result?.data).toEqual({ success: true, message: 'Denúncia encaminhada com sucesso' })
    })
  })
})
