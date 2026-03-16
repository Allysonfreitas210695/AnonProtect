import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

export interface ChatMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

/**
 * Generates a chat response using Gemini.
 */
export async function getChatCompletion(history: ChatMessage[], systemPrompt: string) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  })

  const chat = model.startChat({
    history: history.slice(0, -1), // Everything except the last message
  })

  const lastMessage = history[history.length - 1]
  const result = await chat.sendMessage(lastMessage.parts[0].text)
  const response = await result.response

  return response.text()
}

/**
 * Specialized prompt for report classification guidance.
 */
export const WHISTLEBLOWER_SYSTEM_PROMPT = (categories: string[]) => `
Você é o assistente virtual da AnonProtect, especializado em canais de denúncia anônima de ética corporativa.
Sua missão é ajudar o denunciante a identificar a categoria correta para seu relato.

Categorias disponíveis no sistema: ${categories.join(', ')}.

Diretrizes:
1. Seja acolhedor, empático e extremamente profissional.
2. NUNCA peça dados de identificação do denunciante.
3. Se o denunciante descrever algo, sugira a categoria que melhor se encaixa entre as listadas acima.
4. Explique brevemente por que sugeriu aquela categoria com base na lei brasileira ou boas práticas de compliance se aplicável.
5. Se o relato for vago, faça perguntas sutis para ajudar na classificação.
6. Se perguntarem sobre o anonimato, reforce que o sistema não guarda logs de IP e usa criptografia de ponta a ponta.
7. Responda em Português do Brasil de forma clara e concisa.
`

export interface ReportAnalysis {
  suggestedCategory: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reasoning: string
}

/**
 * Analisa o texto de uma denúncia para sugerir uma categoria e prioridade.
 */
export async function analyzeReport(
  description: string,
  categories: string[]
): Promise<ReportAnalysis | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      Você é um assistente especializado em triagem de denúncias anônimas para o sistema AnonProtect.
      Sua tarefa é analisar a descrição de uma denúncia e sugerir a categoria mais adequada e a prioridade.

      Categorias disponíveis: ${categories.join(', ')}

      Descrição da denúncia: "${description}"

      Responda APENAS em formato JSON puro, sem blocos de código markdown, com os seguintes campos:
      {
        "suggestedCategory": "nome da categoria sugerida",
        "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "reasoning": "breve explicação da sua escolha em português"
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    const cleanJson = text.replace(/```json|```/g, '').trim()

    return JSON.parse(cleanJson) as ReportAnalysis
  } catch (error) {
    console.error('Error in analyzeReport:', error)
    return null
  }
}
