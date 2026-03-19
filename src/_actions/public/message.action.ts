'use server'

import { actionClient } from '@/_shared/utils/safe-action'
import * as reportRepository from '@/_modules/report/report.data'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const sendMessageSchema = z.object({
  reportId: z.string().uuid(),
  code: z.string(),
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
})

export const sendMessageAction = actionClient
  .schema(sendMessageSchema)
  .action(async ({ parsedInput: { reportId, code, content } }) => {
    await reportRepository.createMessage(reportId, content)

    revalidatePath(`/report/${code}`)
    return { success: true, message: 'Mensagem enviada com sucesso!' }
  })
