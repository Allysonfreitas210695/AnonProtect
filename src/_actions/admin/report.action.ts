'use server'

import { supervisorActionClient, adminActionClient, ActionError } from '@/_shared/utils/safe-action'
import * as adminData from '@/_modules/admin/admin.data'
import { z } from 'zod'
import { reportStatusSchema } from '@/_schemas/report'
import { revalidatePath } from 'next/cache'

export const updateReportStatusAction = supervisorActionClient
  .schema(reportStatusSchema)
  .action(async ({ parsedInput: { reportId, status }, ctx: { user } }) => {
    try {
      await adminData.updateReportStatus(reportId, status, user.id)
      revalidatePath(`/admin/report/${reportId}`)
      revalidatePath('/admin/report')
      revalidatePath('/admin')
      return { success: true, message: 'Status atualizado com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao atualizar status')
    }
  })

const sendAdminReplySchema = z.object({
  reportId: z.uuid(),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
})

export const sendAdminReplyAction = supervisorActionClient
  .schema(sendAdminReplySchema)
  .action(async ({ parsedInput: { reportId, content }, ctx: { user } }) => {
    try {
      await adminData.createAdminReply(reportId, user.id, content)
      revalidatePath(`/admin/report/${reportId}`)
      return { success: true, message: 'Mensagem enviada com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao enviar resposta')
    }
  })

const createNoteSchema = z.object({
  reportId: z.uuid(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

export const createInvestigationNoteAction = supervisorActionClient
  .schema(createNoteSchema)
  .action(async ({ parsedInput: { reportId, content }, ctx: { user } }) => {
    try {
      await adminData.createInvestigationNote(reportId, user.id, content)
      revalidatePath(`/admin/report/${reportId}`)
      return { success: true, message: 'Nota adicionada com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao adicionar nota')
    }
  })

const deleteNoteSchema = z.object({
  noteId: z.uuid(),
  reportId: z.uuid(),
})

export const deleteInvestigationNoteAction = supervisorActionClient
  .schema(deleteNoteSchema)
  .action(async ({ parsedInput: { noteId, reportId }, ctx: { user } }) => {
    try {
      await adminData.deleteInvestigationNote(noteId, user.id, reportId, user.role)
      revalidatePath(`/admin/report/${reportId}`)
      return { success: true, message: 'Nota excluída com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao excluir nota')
    }
  })

const forwardReportSchema = z.object({
  reportId: z.uuid(),
  departmentId: z.uuid(),
  description: z.string().min(1, 'Justificativa é obrigatória'),
})

export const forwardReportAction = supervisorActionClient
  .schema(forwardReportSchema)
  .action(async ({ parsedInput: { reportId, departmentId, description }, ctx: { user } }) => {
    try {
      await adminData.forwardReport(reportId, departmentId, user.id, description)
      revalidatePath(`/admin/report/${reportId}`)
      return { success: true, message: 'Denúncia encaminhada com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao encaminhar denúncia')
    }
  })

const batchStatusSchema = z.object({
  reportIds: z.array(z.uuid()),
  status: reportStatusSchema.shape.status,
})

export const batchUpdateReportStatusAction = supervisorActionClient
  .schema(batchStatusSchema)
  .action(async ({ parsedInput: { reportIds, status } }) => {
    try {
      await adminData.updateReportsStatus(reportIds, status)
      revalidatePath('/admin/report')
      revalidatePath('/admin')
      return { success: true, message: `${reportIds.length} denúncias atualizadas com sucesso` }
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Falha na atualização em massa'
      )
    }
  })

const deleteReportSchema = z.object({
  reportId: z.uuid(),
})

export const deleteReportAction = adminActionClient
  .schema(deleteReportSchema)
  .action(async ({ parsedInput: { reportId } }) => {
    try {
      await adminData.softDeleteReport(reportId)
      revalidatePath('/admin/report')
      revalidatePath('/admin')
      return { success: true, message: 'Denúncia excluída com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao excluir denúncia')
    }
  })
