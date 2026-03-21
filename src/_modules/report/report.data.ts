import { prisma } from '@/_shared/lib/prisma'
import { analyzeReport } from '@/_shared/lib/ai'
import { logger } from '@/_shared/lib/logger'
import { getCategories } from './report.query'
import { encrypt } from '@/_shared/lib/crypto'

export interface CreateReportData {
  trackingCode: string
  categoryId: string
  description: string
  country?: string
  state?: string
  city?: string
  district?: string
  postalCode?: string
  priority?: string
  assignedDepartmentId?: string
  attachments?: { url: string; key: string; fileName: string; fileSize: number; type: string }[]
}

export async function createReport(data: CreateReportData) {
  return await prisma.report.create({
    data: {
      trackingCode: data.trackingCode,
      categoryId: data.categoryId,
      description: data.description,
      country: data.country,
      state: data.state,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      priority: data.priority,
      assignedDepartmentId: data.assignedDepartmentId,
      attachments: data.attachments
        ? {
            create: data.attachments.map((a) => ({
              url: a.url,
              key: a.key,
              fileName: a.fileName,
              fileSize: a.fileSize,
              type: a.type,
            })),
          }
        : undefined,
      activityLogs: {
        create: {
          action: 'CREATED',
          description: 'Nova denúncia registrada pelo sistema',
        },
      },
    },
  })
}

export async function createMessage(reportId: string, content: string) {
  return await prisma.message.create({
    data: {
      reportId,
      content,
      sender: 'USER',
    },
  })
}

export async function updateReportAiResults(
  id: string,
  categoryName: string,
  priority: string,
  reasoning: string,
  redactedDescription: string
) {
  const category = await prisma.category.findUnique({
    where: { name: categoryName },
  })

  return await prisma.report.update({
    where: { id },
    data: {
      categoryId: category?.id,
      priority,
      redactedDescription: encrypt(redactedDescription),
      activityLogs: {
        create: {
          action: 'AI_ANALYZED',
          description: `Análise automática concluída. Categoria sugerida: ${categoryName}, Prioridade: ${priority}`,
          metadata: JSON.stringify({ reasoning }),
        },
      },
    },
  })
}

export async function processAiAnalysis(reportId: string, description: string, country?: string) {
  logger.debug({ reportId }, 'Iniciando análise de IA em background')
  try {
    const categories = await getCategories()
    const categoryNames = categories.map((c) => c.name)

    const aiAnalysis = await analyzeReport(description, categoryNames, country)

    if (aiAnalysis) {
      logger.info(
        {
          reportId,
          suggestedCategory: aiAnalysis.suggestedCategory,
          priority: aiAnalysis.priority,
        },
        'IA concluiu análise do relato'
      )

      await updateReportAiResults(
        reportId,
        aiAnalysis.suggestedCategory,
        aiAnalysis.priority,
        aiAnalysis.reasoning,
        aiAnalysis.redactedDescription
      )
    }
  } catch (error) {
    logger.error({ reportId, error }, 'Falha no processamento de IA em background')
  }
}
