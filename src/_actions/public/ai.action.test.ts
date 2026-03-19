/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assistantChatAction } from './ai.action'
import { prisma } from '@/_shared/lib/prisma'
import { getChatCompletion } from '@/_shared/lib/ai'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/_shared/lib/ai', () => ({
  getChatCompletion: vi.fn(),
  WHISTLEBLOWER_SYSTEM_PROMPT: vi.fn(() => 'system prompt'),
}))

describe('AI Assistant Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return AI response successfully', async () => {
    const mockCategories = [{ name: 'Assédio' }, { name: 'Fraude' }]
    vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any)
    vi.mocked(getChatCompletion).mockResolvedValue('Certamente, posso ajudar com isso.')

    const result = await assistantChatAction({
      history: [{ role: 'user', parts: [{ text: 'Olá' }] }],
      locale: 'pt-BR',
    })

    expect(result?.data).toEqual({ success: true, response: 'Certamente, posso ajudar com isso.' })
  })

  it('should handle AI errors gracefully', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([])
    vi.mocked(getChatCompletion).mockRejectedValue(new Error('AI Service Down'))

    const result = await assistantChatAction({
      history: [],
      locale: 'en',
    })

    expect(result?.data).toEqual({
      success: false,
      error: 'O assistente está temporariamente indisponível.',
    })
  })
})
