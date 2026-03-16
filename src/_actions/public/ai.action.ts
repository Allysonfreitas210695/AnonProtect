'use server'

import { actionClient } from '@/_utils/safe-action'
import { z } from 'zod'
import { prisma } from '@/_lib/prisma'
import { getChatCompletion, WHISTLEBLOWER_SYSTEM_PROMPT, ChatMessage } from '@/_lib/ai'

const chatSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(z.object({ text: z.string() })),
    })
  ),
})

export const assistantChatAction = actionClient
  .schema(chatSchema)
  .action(async ({ parsedInput: { history } }) => {
    try {
      const categories = await prisma.category.findMany({
        select: { name: true },
      })
      const categoryNames = categories.map((c) => c.name)

      const systemPrompt = WHISTLEBLOWER_SYSTEM_PROMPT(categoryNames)
      const response = await getChatCompletion(history as ChatMessage[], systemPrompt)

      return { success: true, response }
    } catch (error) {
      console.error('AI Assistant Error:', error)
      return { success: false, error: 'O assistente está temporariamente indisponível.' }
    }
  })
