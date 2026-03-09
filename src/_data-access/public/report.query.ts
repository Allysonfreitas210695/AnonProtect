import { prisma } from '@/_lib/prisma'

export async function getReportByCode(code: string) {
  return await prisma.report.findUnique({
    where: { trackingCode: code },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
}

export async function getActiveCategories() {
  return await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })
}
