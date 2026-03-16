'use server'

import { actionClient } from '@/_utils/safe-action'
import { reportSchema } from '@/_schemas/report'
import * as reportRepository from '@/_data-access/public/report.repository'
import { analyzeReport } from '@/_lib/ai'
import { checkRateLimit } from '@/_lib/ratelimit'
import { headers } from 'next/headers'

/**
 * Registra uma nova denúncia de forma anônima.
 */
export const submitReportAction = actionClient
  .schema(reportSchema)
  .action(
    async ({
      parsedInput: {
        categoryId,
        description,
        country,
        state,
        city,
        district,
        postalCode,
        turnstileToken,
      },
    }) => {
      // Turnstile Verification
      if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
          throw new Error('Falha na verificação de captcha. Tente novamente.')
        }
      }

      // Rate Limit
      const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
      const { success } = await checkRateLimit(ip)

      if (!success) {
        throw new Error('Limite de denúncias atingido. Tente novamente em 1 hora.')
      }

      // Busca categorias para análise de IA
      const dbCategories = await reportRepository.getCategories()
      const categoryNames = dbCategories.map((c) => c.name)

      // Análise de IA (opcional, não bloqueia em caso de erro)
      const aiAnalysis = await analyzeReport(description, categoryNames)

      const report = await reportRepository.createReport({
        categoryId,
        description,
        country,
        state,
        city,
        district,
        postalCode,
        priority: aiAnalysis?.priority || 'MEDIUM',
      })
      return { success: true, trackingCode: report.trackingCode }
    }
  )
