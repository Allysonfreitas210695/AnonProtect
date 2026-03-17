import * as reportRepository from '@/_data-access/admin/report.repository'
import { ReportStatus } from '@/_generated/prisma'
import { revalidatePath } from 'next/cache'

export const AdminReportService = {
  async updateStatus(reportId: string, status: ReportStatus) {
    const report = await reportRepository.updateReportStatus(reportId, status)
    revalidatePath(`/admin/report/${reportId}`)
    return report
  },

  async replyToReport(reportId: string, content: string) {
    const message = await reportRepository.createAdminReply(reportId, content)
    revalidatePath(`/admin/report/${reportId}`)
    return message
  },

  async addInvestigationNote(reportId: string, userId: string, content: string) {
    const note = await reportRepository.createInvestigationNote(reportId, userId, content)
    revalidatePath(`/admin/report/${reportId}`)
    return note
  },

  async deleteNote(noteId: string, userId: string, userRole: string) {
    const note = await reportRepository.getInvestigationNoteById(noteId)

    if (!note) {
      throw new Error('Nota não encontrada')
    }

    if (note.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Você não tem permissão para excluir esta nota')
    }

    await reportRepository.deleteInvestigationNote(noteId)
    revalidatePath(`/admin`)
  },

  async forwardReport(reportId: string, departmentId: string, userId: string, description: string) {
    const result = await reportRepository.forwardReport(reportId, departmentId, userId, description)
    revalidatePath(`/admin/report/${reportId}`)
    return result
  },

  async batchUpdateStatus(reportIds: string[], status: ReportStatus) {
    const result = await reportRepository.updateReportsStatus(reportIds, status)
    revalidatePath('/admin/report')
    return result
  },
}
