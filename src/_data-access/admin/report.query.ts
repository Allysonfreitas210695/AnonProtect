import { prisma } from '@/_lib/prisma'

export async function getReportById(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: {
      category: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 50,
      },
      assignedTo: true,
      assignedDepartment: true,
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

export async function getReportsPaginated(page: number = 1, pageSize: number = 10) {
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        trackingCode: true,
        status: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.report.count(),
  ])

  const reportsCount = Number(total)

  return {
    reports,
    total: reportsCount,
    page,
    pageSize,
    totalPages: Math.ceil(reportsCount / pageSize),
  }
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
