import { prisma } from '@/_shared/lib/prisma'
import { analyzeReport } from '@/_shared/lib/ai'
import { logger } from '@/_shared/lib/logger'
import { getCategories } from './report.query'
import { encrypt } from '@/_shared/lib/crypto'
import type { $Enums } from '@/_generated/prisma'

export interface CreateReportData {
  trackingCode: string
  categoryId: string
  description: string
  country?: string
  state?: string
  city?: string
  district?: string
  postalCode?: string
  number?: string
  priority?: $Enums.ReportPriority
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
      number: data.number,
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
      content: encrypt(content),
      sender: 'USER',
    },
  })
}

export async function updateReportAiResults(
  id: string,
  categoryName: string,
  priority: $Enums.ReportPriority,
  reasoning: string,
  redactedDescription: string
) {
  const category = await prisma.category.findUnique({
    where: { name: categoryName },
  })

  if (!category) {
    logger.warn(
      { reportId: id, categoryName },
      'Categoria sugerida pela IA não encontrada; categoryId não será atualizado'
    )
  }

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
