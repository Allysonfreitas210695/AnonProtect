import { prisma } from '@/_lib/prisma'

export async function createReport(data: { type: string; description: string }) {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  const trackingCode = `RPT-${randomPart}`

  return await prisma.report.create({
    data: {
      trackingCode,
      type: data.type,
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
