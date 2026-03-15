'use server'

import { authActionClient, ActionError } from '@/_utils/safe-action'
import * as reportRepository from '@/_data-access/admin/report.repository'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { reportStatusSchema } from '@/_schemas/report'

/**
 * Atualiza o status de uma denúncia.
 *
 * @param {string} reportId - O ID único da denúncia.
 * @param {ReportStatus} status - O novo status (PENDING, IN_PROGRESS, RESOLVED, REJECTED).
 * @returns {Promise<ActionResult>} Resultado da operação com mensagem de sucesso.
 * @throws {ActionError} Se a atualização falhar ou o usuário não tiver permissão.
 */
export const updateReportStatusAction = authActionClient
  .schema(reportStatusSchema)
  .action(async ({ parsedInput: { reportId, status } }) => {
    await reportRepository.updateReportStatus(reportId, status)
    revalidatePath(`/admin/report/${reportId}`)
    return { success: true, message: 'Status atualizado com sucesso' }
  })

// ── Send Admin Reply ──────────────────────────────────────────────────────────
const sendAdminReplySchema = z.object({
  reportId: z.string().uuid(),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
})

/**
 * Envia uma mensagem oficial da administração para o denunciante.
 *
 * @param {string} reportId - O ID da denúncia correspondente.
 * @param {string} content - O conteúdo da mensagem.
 * @returns {Promise<ActionResult>} Confirmação do envio.
 */
export const sendAdminReplyAction = authActionClient
  .schema(sendAdminReplySchema)
  .action(async ({ parsedInput: { reportId, content } }) => {
    await reportRepository.createAdminReply(reportId, content)
    revalidatePath(`/admin/report/${reportId}`)
    return { success: true, message: 'Mensagem enviada com sucesso' }
  })

// ── Investigation Notes ───────────────────────────────────────────────────────
const createNoteSchema = z.object({
  reportId: z.string().uuid(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

/**
 * Adiciona uma nota de investigação privada visível apenas para admin e supervisores.
 *
 * @param {string} reportId - O ID da denúncia.
 * @param {string} content - O conteúdo da nota técnica.
 * @returns {Promise<ActionResult>} Confirmação da criação da nota.
 */
export const createInvestigationNoteAction = authActionClient
  .schema(createNoteSchema)
  .action(async ({ parsedInput: { reportId, content }, ctx: { user } }) => {
    await reportRepository.createInvestigationNote(reportId, user.id, content)
    revalidatePath(`/admin/report/${reportId}`)
    return { success: true, message: 'Nota adicionada com sucesso' }
  })

const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
})

export const deleteInvestigationNoteAction = authActionClient
  .schema(deleteNoteSchema)
  .action(async ({ parsedInput: { noteId }, ctx: { user } }) => {
    const note = await reportRepository.getInvestigationNoteById(noteId)

    if (!note) {
      throw new ActionError('Nota não encontrada')
    }

    // Apenas o autor da nota ou um ADMIN pode excluir
    if (note.userId !== user.id && user.role !== 'ADMIN') {
      throw new ActionError('Você não tem permissão para excluir esta nota')
    }

    await reportRepository.deleteInvestigationNote(noteId)
    revalidatePath(`/admin`)
    return { success: true, message: 'Nota excluída com sucesso' }
  })

// ── Forward Report to Department ──────────────────────────────────────────────
const forwardReportSchema = z.object({
  reportId: z.string().uuid(),
  departmentId: z.string().uuid(),
  description: z.string().min(1, 'Justificativa é obrigatória'),
})

/**
 * Encaminha uma denúncia para um departamento específico.
 *
 * @param {string} reportId - O ID da denúncia.
 * @param {string} departmentId - O ID do departamento de destino.
 * @param {string} description - Justificativa para o encaminhamento.
 * @returns {Promise<ActionResult>} Confirmação do encaminhamento.
 */
export const forwardReportAction = authActionClient
  .schema(forwardReportSchema)
  .action(async ({ parsedInput: { reportId, departmentId, description }, ctx: { user } }) => {
    await reportRepository.forwardReport(reportId, departmentId, user.id, description)
    revalidatePath(`/admin/report/${reportId}`)
    return { success: true, message: 'Denúncia encaminhada com sucesso' }
  })
