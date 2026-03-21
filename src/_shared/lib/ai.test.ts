import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeReport, getChatCompletion } from './ai'

const mockGenerateContent = vi.fn()
const mockSendMessage = vi.fn()

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(function () {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: (...args: unknown[]) => mockGenerateContent(...args),
          startChat: vi.fn().mockReturnValue({
            sendMessage: (...args: unknown[]) => mockSendMessage(...args),
          }),
        }),
      }
    }),
  }
})

describe('AI Library (Modules)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-api-key'

    mockGenerateContent.mockReset()
    mockSendMessage.mockReset()

    mockSendMessage.mockResolvedValue({
      response: { text: () => 'chat response' },
    })
  })

  describe('analyzeReport', () => {
    it('should return null if API key is missing', async () => {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
      const result = await analyzeReport('desc', ['cat'])
      expect(result).toBeNull()
    })

    it('should parse valid JSON response from AI', async () => {
      const mockResult = {
        response: Promise.resolve({
          text: () =>
            JSON.stringify({
              suggestedCategory: 'Fraude',
              priority: 'HIGH',
              reasoning: 'Detailed reasoning',
              redactedDescription: 'Texto anonimizado [DADOS SENSÍVEis]',
            }),
        }),
      }
      mockGenerateContent.mockResolvedValue(mockResult)

      const result = await analyzeReport('desc', ['Fraude'])
      expect(result?.suggestedCategory).toBe('Fraude')
      expect(result?.priority).toBe('HIGH')
    })
  })

  describe('getChatCompletion', () => {
    it('should return text response', async () => {
      const result = await getChatCompletion([{ role: 'user', parts: [{ text: 'hi' }] }], 'sys')
      expect(result).toBe('chat response')
    })
  })
})
