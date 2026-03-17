'use server'

import { authActionClient, ActionError } from '@/_utils/safe-action'
import { AdminReportService } from '@/_services/admin-report.service'
import { z } from 'zod'
import { reportStatusSchema } from '@/_schemas/report'

/**
 * Server Action para atualizar o status de uma denúncia.
 */
export const updateReportStatusAction = authActionClient
  .schema(reportStatusSchema)
  .action(async ({ parsedInput: { reportId, status } }) => {
    try {
      await AdminReportService.updateStatus(reportId, status)
      return { success: true, message: 'Status atualizado com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao atualizar status')
    }
  })

/**
 * Server Action para enviar uma resposta oficial da administração.
 */
const sendAdminReplySchema = z.object({
  reportId: z.string().uuid(),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
})

export const sendAdminReplyAction = authActionClient
  .schema(sendAdminReplySchema)
  .action(async ({ parsedInput: { reportId, content } }) => {
    try {
      await AdminReportService.replyToReport(reportId, content)
      return { success: true, message: 'Mensagem enviada com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao enviar resposta')
    }
  })

/**
 * Server Action para adicionar uma nota técnica/investigação.
 */
const createNoteSchema = z.object({
  reportId: z.string().uuid(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

export const createInvestigationNoteAction = authActionClient
  .schema(createNoteSchema)
  .action(async ({ parsedInput: { reportId, content }, ctx: { user } }) => {
    try {
      await AdminReportService.addInvestigationNote(reportId, user.id, content)
      return { success: true, message: 'Nota adicionada com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao adicionar nota')
    }
  })

/**
 * Server Action para excluir uma nota de investigação.
 */
const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
})

export const deleteInvestigationNoteAction = authActionClient
  .schema(deleteNoteSchema)
  .action(async ({ parsedInput: { noteId }, ctx: { user } }) => {
    try {
      await AdminReportService.deleteNote(noteId, user.id, user.role)
      return { success: true, message: 'Nota excluída com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao excluir nota')
    }
  })

/**
 * Server Action para encaminhar uma denúncia para um departamento específico.
 */
const forwardReportSchema = z.object({
  reportId: z.string().uuid(),
  departmentId: z.string().uuid(),
  description: z.string().min(1, 'Justificativa é obrigatória'),
})

export const forwardReportAction = authActionClient
  .schema(forwardReportSchema)
  .action(async ({ parsedInput: { reportId, departmentId, description }, ctx: { user } }) => {
    try {
      await AdminReportService.forwardReport(reportId, departmentId, user.id, description)
      return { success: true, message: 'Denúncia encaminhada com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao encaminhar denúncia')
    }
  })

/**
 * Server Action para atualização de status em massa.
 */
const batchStatusSchema = z.object({
  reportIds: z.array(z.string().uuid()),
  status: reportStatusSchema.shape.status,
})

export const batchUpdateReportStatusAction = authActionClient
  .schema(batchStatusSchema)
  .action(async ({ parsedInput: { reportIds, status } }) => {
    try {
      await AdminReportService.batchUpdateStatus(reportIds, status)
      return { success: true, message: `${reportIds.length} denúncias atualizadas com sucesso` }
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Falha na atualização em massa'
      )
    }
  })
