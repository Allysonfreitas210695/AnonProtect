'use server'

import { actionClient } from '@/_shared/utils/safe-action'
import { z } from 'zod'
import { prisma } from '@/_shared/lib/prisma'
import { getChatCompletion, WHISTLEBLOWER_SYSTEM_PROMPT, ChatMessage } from '@/_shared/lib/ai'
import { logger } from '@/_shared/lib/logger'

const chatSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(z.object({ text: z.string() })),
    })
  ),
  locale: z.string(),
})

export const assistantChatAction = actionClient
  .schema(chatSchema)
  .action(async ({ parsedInput: { history, locale } }) => {
    try {
      const categories = await prisma.category.findMany({
        select: { name: true },
      })
      const categoryNames = categories.map((c) => c.name)

      const systemPrompt = WHISTLEBLOWER_SYSTEM_PROMPT(categoryNames, locale)
      const response = await getChatCompletion(history as ChatMessage[], systemPrompt)

      return { success: true, response }
    } catch (error) {
      logger.error(error, 'AI Assistant Error:')
      return { success: false, error: 'O assistente está temporariamente indisponível.' }
    }
  })
