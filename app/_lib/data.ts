import { prisma } from '@/app/_lib/prisma'

export async function getReportByCode(code: string) {
  return await prisma.report.findUnique({
    where: { trackingCode: code },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
}

export async function getReportById(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      assignedTo: true,
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
      investigationNotes: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      activityLogs: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getAllReports() {
  return await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function getActiveCategories() {
  return await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })
}
