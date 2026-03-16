import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

export interface ReportAnalysis {
  suggestedCategory: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reasoning: string
}

/**
 * Analisa o texto de uma denúncia para sugerir uma categoria e prioridade.
 *
 * @param {string} description - A descrição da denúncia.
 * @param {string[]} categories - Lista de categorias disponíveis no sistema.
 * @returns {Promise<ReportAnalysis | null>} A análise da IA ou null em caso de erro.
 */
export async function analyzeReport(
  description: string,
  categories: string[]
): Promise<ReportAnalysis | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn('GOOGLE_GENERATIVE_AI_API_KEY is not set. Skipping AI analysis.')
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

    // Tenta limpar possíveis marcações de markdown se presentes
    const cleanJson = text.replace(/```json|```/g, '').trim()

    return JSON.parse(cleanJson) as ReportAnalysis
  } catch (error) {
    console.error('Error analyzing report with Gemini:', error)
    return null
  }
}
