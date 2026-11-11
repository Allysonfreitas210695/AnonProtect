'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { supervisorActionClient, ActionError } from '@/_shared/utils/safe-action'
import { getReportForReanalysis } from '@/_modules/admin/admin.query'
import { processAiAnalysis } from '@/_modules/report/report.data'
import { decrypt } from '@/_shared/lib/crypto'
import { logger } from '@/_shared/lib/logger'

const retryAnonymizationSchema = z.object({
  reportId: z.uuid(),
})

export const retryAnonymizationAction = supervisorActionClient
  .schema(retryAnonymizationSchema)
  .action(async ({ parsedInput: { reportId }, ctx: { user } }) => {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new ActionError(
        'Serviço de IA não configurado: não é possível ocultar os dados da denúncia'
      )
    }

    const report = await getReportForReanalysis(reportId)
    if (!report) throw new ActionError('Denúncia não encontrada')

    if (report.redactedDescription) {
      return { success: true, message: 'Dados pessoais da denúncia já ocultados' }
    }

    logger.info({ reportId, userId: user.id }, 'Nova tentativa de ocultação solicitada')

    let plain: string
    try {
      plain = decrypt(report.description)
    } catch {
      throw new ActionError('Falha ao preparar a denúncia para a ocultação')
    }

    // O texto original é usado apenas aqui, no servidor, e nunca é devolvido
    const ok = await processAiAnalysis(report.id, plain, report.country || 'Brasil')
    if (!ok) {
      throw new ActionError(
        'Não foi possível ocultar os dados da denúncia. Tente novamente mais tarde.'
      )
    }

    revalidatePath(`/admin/report/${reportId}`)
    return { success: true, message: 'Dados pessoais ocultados com sucesso' }
  })
