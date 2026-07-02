'use server'

import { actionClient, ActionError } from '@/_shared/utils/safe-action'
import * as reportRepository from '@/_modules/report/report.data'
import { prisma } from '@/_shared/lib/prisma'
import { sendEmail } from '@/_shared/lib/aws'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const sendMessageSchema = z.object({
  reportId: z.string().uuid(),
  code: z.string().min(1, 'Código é obrigatório'),
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
})

export const sendMessageAction = actionClient
  .schema(sendMessageSchema)
  .action(async ({ parsedInput: { reportId, code, content } }) => {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { trackingCode: true, assignedTo: { select: { email: true } } },
    })

    if (!report || report.trackingCode !== code) {
      throw new ActionError('Acesso negado')
    }

    await reportRepository.createMessage(reportId, content)

    if (report.assignedTo?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const adminLink = `${baseUrl}/admin/report/${reportId}`
      const htmlBody = `<p>Nova mensagem recebida no relatório ${code}.</p><a href="${adminLink}">Acesse o painel para visualizar.</a>`
      await sendEmail(report.assignedTo.email, 'Nova mensagem no AnonProtect', htmlBody)
    }

    revalidatePath(`/report/${code}`)
    return { success: true, message: 'Mensagem enviada com sucesso!' }
  })
