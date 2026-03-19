import { GoogleGenerativeAI } from '@google/generative-ai'
import { reportAnalysisSchema } from '@/_schemas/ai'

let genAIInstance: GoogleGenerativeAI | null = null

function getGenAI() {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
  }
  return genAIInstance
}

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

  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
    tools: [
      {
        // @ts-expect-error - googleSearch is a beta feature not yet in the official types
        googleSearch: {},
      },
    ],
  })

  const chat = model.startChat({
    history: history.slice(0, -1),
  })

  const lastMessage = history[history.length - 1]
  const result = await chat.sendMessage(lastMessage.parts[0].text)
  const response = await result.response

  return response.text()
}

export const WHISTLEBLOWER_SYSTEM_PROMPT = (categories: string[], locale: string) => `
Você é o assistente virtual da AnonProtect, especializado em canais de denúncia anônima de ética corporativa.
Sua missão é ajudar o denunciante a identificar a categoria correta para seu relato no contexto do país: ${locale === 'pt-BR' ? 'Brasil' : 'Global/Internacional'}.

Categorias disponíveis no sistema: ${categories.join(', ')}.

Diretrizes:
1. Seja acolhedor, empático e extremamente profissional.
2. NUNCA peça dados de identificação do denunciante.
3. Se o denunciante descrever algo, sugira a categoria que melhor se encaixa entre as listadas acima.
4. Use o Google Search para consultar a legislação específica do país (${locale === 'pt-BR' ? 'Brasil - ex: Lei 14.457/22, Lei Anticorrupção' : 'Leis Locais/Internacionais'}) e boas práticas de compliance para fundamentar sua resposta com precisão técnica.
5. Sempre cite brevemente a lei ou regulamento que justifica sua sugestão de categoria.
6. Se o relato for vago, faça perguntas sutis para ajudar na classificação.
7. Se perguntarem sobre o anonimato, reforce que o sistema não guarda logs de IP e usa criptografia de ponta a ponta.
8. Responda no idioma do denunciante (${locale === 'pt-BR' ? 'Português do Brasil' : 'Inglês'}) de forma clara e concisa.
`

export interface ReportAnalysis {
  suggestedCategory: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reasoning: string
}

export async function analyzeReport(
  description: string,
  categories: string[],
  country: string = 'Brasil'
): Promise<ReportAnalysis | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null

  try {
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [
        {
          // @ts-expect-error - googleSearch is a beta feature not yet in the official types
          googleSearch: {},
        },
      ],
    })

    const prompt = `
      Você é um assistente especializado em triagem de denúncias anônimas para o sistema AnonProtect.
      Sua tarefa é analisar a descrição de uma denúncia e sugerir a categoria mais adequada e a prioridade no contexto de: ${country}.

      Categorias disponíveis: ${categories.join(', ')}

      Descrição da denúncia: "${description}"

      Instruções Especiais:
      1. Use o Google Search para pesquisar a gravidade legal deste tipo de relato especificamente em: ${country}.
      2. Baseie sua prioridade (LOW/MEDIUM/HIGH/CRITICAL) no risco jurídico local e impacto humano.
      3. O campo "reasoning" deve incluir uma breve menção a leis ou regulamentos relevantes encontrados em ${country}.

      Responda APENAS em formato JSON puro, sem blocos de código markdown ou texto explicativo fora do JSON. O JSON deve seguir RIGOROSAMENTE esta estrutura:
      {
        "suggestedCategory": "nome exato de uma das categorias fornecidas",
        "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "reasoning": "explicação técnica detalhada em português, citando leis ou normas de conformidade se aplicável"
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Tenta encontrar o JSON se houver lixo em volta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const cleanJson = jsonMatch ? jsonMatch[0] : text

    const parsed = JSON.parse(cleanJson)
    const validated = reportAnalysisSchema.safeParse(parsed)

    if (!validated.success) {
      console.error('Invalid AI report analysis response:', validated.error.format())
      return null
    }

    // Garante que a categoria sugerida existe na lista atual de categorias
    if (!categories.includes(validated.data.suggestedCategory)) {
      console.warn(
        'AI suggested category not in available categories. Falling back to null.',
        validated.data.suggestedCategory
      )
      return null
    }

    return validated.data as ReportAnalysis
  } catch (error) {
    console.error('Error in analyzeReport:', error)
    return null
  }
}
