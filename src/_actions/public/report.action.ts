'use server'

import { actionClient } from '@/_shared/utils/safe-action'
import { reportSchema } from '@/_schemas/report'
import { buildGenericAttachmentName } from '@/_schemas/upload'
import * as reportData from '@/_modules/report/report.data'
import { checkRateLimit } from '@/_shared/lib/ratelimit'
import { getClientIp } from '@/_shared/lib/get-client-ip'
import { headers } from 'next/headers'
import { triggerAiAnalysis } from './ai-analysis'
import { encrypt } from '@/_shared/lib/crypto'
import { logger } from '@/_shared/lib/logger'
import { isStrictSecurityMode, reportSecurityDegraded } from '@/_shared/lib/security-mode'
import { generateTrackingCode, hashTrackingCode } from '@/_shared/utils/tracking'

async function verifyTurnstile(token: string, secret: string) {
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      response: token,
    }),
  })

  const verifyData = await verifyRes.json()
  return verifyData.success
}

export const submitReportAction = actionClient
  .schema(reportSchema)
  .action(async ({ parsedInput }) => {
    const hdrs = await headers()
    const ip = getClientIp(hdrs)
    const { success: rateLimitOk } = await checkRateLimit(ip)

    if (!rateLimitOk) {
      throw new Error('Limite de denúncias atingido. Tente novamente em 1 hora.')
    }

    // O widget só aparece com a chave pública, e a validação exige a secreta:
    // as duas precisam estar presentes para a verificação funcionar.
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    if (!turnstileSecret || !turnstileSiteKey) {
      if (isStrictSecurityMode()) {
        // Em produção, seguir sem verificação deixaria o canal aberto a bots sem
        // ninguém saber; recusa e registra o evento para alerta.
        reportSecurityDegraded('turnstile', 'Turnstile não configurado; envio recusado', {
          hasSecret: !!turnstileSecret,
          hasSiteKey: !!turnstileSiteKey,
        })
        throw new Error('Envio temporariamente indisponível. Tente novamente mais tarde.')
      }
      if (turnstileSecret || turnstileSiteKey) {
        logger.warn('Turnstile com apenas uma das chaves configurada; verificação ignorada')
      }
    } else {
      if (!parsedInput.turnstileToken) {
        throw new Error('Falha na verificação de captcha. Tente novamente.')
      }
      const isHuman = await verifyTurnstile(parsedInput.turnstileToken, turnstileSecret)
      if (!isHuman) {
        throw new Error('Falha na verificação de captcha. Tente novamente.')
      }
    }

    logger.info({ categoryId: parsedInput.categoryId }, 'Iniciando submissão de nova denúncia')

    const encryptedDescription = encrypt(parsedInput.description)

    let report = null
    let attempts = 0
    let trackingCode = ''

    while (attempts < 5 && !report) {
      try {
        trackingCode = generateTrackingCode()
        report = await reportData.createReport({
          ...parsedInput,
          description: encryptedDescription,
          // Só o resumo vai ao banco; o código em claro é devolvido uma única vez ao denunciante
          trackingCodeHash: hashTrackingCode(trackingCode),
          attachments: parsedInput.attachments?.map((a, i) => ({
            url: a.url,
            key: a.key,
            fileName: buildGenericAttachmentName(i, a.type),
            fileSize: a.fileSize,
            type: a.type,
          })),
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === 'P2002') {
          attempts++
          logger.warn({ attempts }, 'Colisão de código de rastreamento, tentando novamente...')
        } else {
          throw e
        }
      }
    }

    if (!report) {
      throw new Error('Falha ao gerar código de rastreamento único. Tente novamente.')
    }

    logger.info({ reportId: report.id }, 'Denúncia registrada com sucesso')

    await triggerAiAnalysis(report.id, parsedInput.description, parsedInput.country || 'Brasil')

    return {
      success: true,
      trackingCode,
    }
  })
