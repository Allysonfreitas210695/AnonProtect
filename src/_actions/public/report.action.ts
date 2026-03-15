'use server'

import { actionClient } from '@/_utils/safe-action'
import { reportSchema } from '@/_schemas/report'
import * as reportRepository from '@/_data-access/public/report.repository'

/**
 * Registra uma nova denúncia de forma anônima.
 *
 * @param {string} categoryId - O ID da categoria da denúncia.
 * @param {string} description - Descrição detalhada do ocorrido.
 * @returns {Promise<{ success: boolean, trackingCode: string }>} O código de rastreio gerado.
 */
export const submitReportAction = actionClient
  .schema(reportSchema)
  .action(async ({ parsedInput: { categoryId, description } }) => {
    const report = await reportRepository.createReport({ categoryId, description })
    return { success: true, trackingCode: report.trackingCode }
  })
