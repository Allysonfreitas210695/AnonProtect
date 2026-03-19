'use server'

import { actionClient } from '@/_shared/utils/safe-action'
import { reportSchema } from '@/_schemas/report'
import * as reportData from '@/_modules/report/report.data'
import { checkRateLimit } from '@/_shared/lib/ratelimit'
import { headers } from 'next/headers'
import { triggerAiAnalysis } from './ai-analysis'
import { encrypt } from '@/_shared/lib/crypto'
import { logger } from '@/_shared/lib/logger'
import { generateTrackingCode } from '@/_shared/utils/tracking'

async function verifyTurnstile(token: string) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  })

  const verifyData = await verifyRes.json()
  return verifyData.success
}

export const submitReportAction = actionClient
  .schema(reportSchema)
  .action(async ({ parsedInput }) => {
    const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
    const { success: rateLimitOk } = await checkRateLimit(ip)

    if (!rateLimitOk) {
      throw new Error('Limite de denúncias atingido. Tente novamente em 1 hora.')
    }

    if (parsedInput.turnstileToken) {
      const isHuman = await verifyTurnstile(parsedInput.turnstileToken)
      if (!isHuman) {
        throw new Error('Falha na verificação de captcha. Tente novamente.')
      }
    }

    logger.info({ categoryId: parsedInput.categoryId }, 'Iniciando submissão de nova denúncia')

    const trackingCode = generateTrackingCode()
    const encryptedDescription = encrypt(parsedInput.description)

    const report = await reportData.createReport({
      ...parsedInput,
      description: encryptedDescription,
      trackingCode,
      priority: 'MEDIUM',
      attachments: parsedInput.attachments?.map((a) => ({
        url: a.url,
        key: a.key,
        fileName: a.fileName,
        fileSize: a.fileSize,
        type: a.type,
      })),
    })

    logger.info({ trackingCode, reportId: report.id }, 'Denúncia registrada com sucesso')

    await triggerAiAnalysis(report.id, parsedInput.description, parsedInput.country || 'Brasil')

    return {
      success: true,
      trackingCode: report.trackingCode,
    }
  })
