'use server'

import { actionClient } from '@/_utils/safe-action'
import { reportSchema } from '@/_schemas/report'
import { ReportService } from '@/_services/report.service'
import { checkRateLimit } from '@/_lib/ratelimit'
import { headers } from 'next/headers'

/**
 * Server Action para registrar uma nova denúncia.
 * Delega toda a lógica de negócio para o ReportService.
 */
export const submitReportAction = actionClient
  .schema(reportSchema)
  .action(async ({ parsedInput }) => {
    // 1. Verificação de Rate Limit (Defesa em Profundidade além do Guard de UI)
    const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
    const { success } = await checkRateLimit(ip)

    if (!success) {
      throw new Error('Limite de denúncias atingido. Tente novamente em 1 hora.')
    }

    // 2. Verificação de Bot (Turnstile)
    if (parsedInput.turnstileToken) {
      const isHuman = await ReportService.verifyTurnstile(parsedInput.turnstileToken)
      if (!isHuman) {
        throw new Error('Falha na verificação de captcha. Tente novamente.')
      }
    }

    // 3. Processamento via Service (IA, Código de Rastreio, Persistência)
    return await ReportService.submitReport(parsedInput)
  })
