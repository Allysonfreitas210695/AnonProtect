import { prisma } from '@/_lib/prisma'

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
  attachments?: { url: string; fileName: string; fileSize: number; type: string }[]
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
              fileName: a.fileName,
              fileSize: a.fileSize,
              type: a.type,
            })),
          }
        : undefined,
    },
  })
}

export async function getCategories() {
  return await prisma.category.findMany({
    where: { active: true },
    select: { id: true, name: true, defaultDepartmentId: true },
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
