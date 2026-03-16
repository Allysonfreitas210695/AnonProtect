import { ReportStatus } from '@prisma/client'
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

export async function getReportsPaginated(
  page: number = 1,
  pageSize: number = 10,
  days: number | null = 30,
  search?: string,
  status?: string,
  categoryId?: string,
  country?: string,
  city?: string
) {
  const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (startDate) {
    where.createdAt = { gte: startDate }
  }

  if (search) {
    where.trackingCode = { contains: search, mode: 'insensitive' }
  }

  if (status) {
    where.status = status as ReportStatus
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (country) {
    where.country = country
  }

  if (city) {
    where.city = city
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        trackingCode: true,
        status: true,
        createdAt: true,
        country: true,
        city: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.report.count({ where }),
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
    where: { active: true },
    orderBy: { name: 'asc' },
  })
}

export async function getReportsLocations() {
  const [countries, cities] = await Promise.all([
    prisma.report.groupBy({
      by: ['country'],
      where: { country: { not: null } },
    }),
    prisma.report.groupBy({
      by: ['city'],
      where: { city: { not: null } },
    }),
  ])

  return {
    countries: countries.map((c) => c.country as string).filter(Boolean),
    cities: cities.map((c) => c.city as string).filter(Boolean),
  }
}
