'use server'

import { actionClient, ActionError } from '@/_shared/utils/safe-action'
import * as reportRepository from '@/_modules/report/report.data'
import { prisma } from '@/_shared/lib/prisma'
import { sendEmail } from '@/_shared/lib/aws'
import { logger } from '@/_shared/lib/logger'
import { checkMessageRateLimit } from '@/_shared/lib/ratelimit'
import { getClientIp } from '@/_shared/lib/get-client-ip'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MAX_MESSAGES_PER_REPORT = 1000

const sendMessageSchema = z.object({
  reportId: z.uuid(),
  code: z.string().min(1, 'Código é obrigatório'),
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
})

export const sendMessageAction = actionClient
  .schema(sendMessageSchema)
  .action(async ({ parsedInput: { reportId, code, content } }) => {
    const hdrs = await headers()
    const ip = getClientIp(hdrs)
    const { success: rateLimitOk } = await checkMessageRateLimit(ip)

    if (!rateLimitOk) {
      throw new ActionError('Muitas mensagens enviadas. Tente novamente em instantes.')
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { trackingCode: true, assignedTo: { select: { email: true } } },
    })

    if (!report || report.trackingCode !== code) {
      throw new ActionError('Acesso negado')
    }

    // WR-02: cap write-side growth to bound the uncapped admin read (admin.query.ts, D-01)
    const messageCount = await prisma.message.count({ where: { reportId } })
    if (messageCount >= MAX_MESSAGES_PER_REPORT) {
      throw new ActionError('Limite de mensagens deste relatório atingido.')
    }

    await reportRepository.createMessage(reportId, content)

    if (report.assignedTo?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const adminLink = `${baseUrl}/admin/report/${reportId}`
      const htmlBody = `<p>Nova mensagem recebida no relatório ${code}.</p><a href="${adminLink}">Acesse o painel para visualizar.</a>`
      try {
        await sendEmail(report.assignedTo.email, 'Nova mensagem no AnonProtect', htmlBody)
      } catch (error) {
        logger.error({ reportId, error }, 'Falha ao notificar admin sobre nova mensagem')
      }
    }

    revalidatePath(`/report/${code}`)
    return { success: true, message: 'Mensagem enviada com sucesso!' }
  })
