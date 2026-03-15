import { prisma } from '@/_lib/prisma'

export async function createReport(data: { categoryId: string; description: string }) {
  const year = new Date().getFullYear()
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  const trackingCode = `AP-${year}-${randomPart}`

  return await prisma.report.create({
    data: {
      trackingCode,
      categoryId: data.categoryId,
      description: data.description,
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
