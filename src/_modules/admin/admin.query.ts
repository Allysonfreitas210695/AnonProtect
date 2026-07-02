import 'server-only'

import { prisma } from '@/_shared/lib/prisma'
import { getDownloadUrl } from '@/_shared/lib/aws'
import { decrypt } from '@/_shared/lib/crypto'
import { Prisma, ReportStatus } from '@/_generated/prisma'
import { logger } from '@/_shared/lib/logger'

interface StatusGroup {
  status: ReportStatus
  _count: { _all: number }
}

interface CategoryGroup {
  categoryId: string | null
  _count: { _all: number }
}

interface DepartmentGroup {
  assignedDepartmentId: string | null
  _count: { _all: number }
}

interface CountryGroup {
  country: string | null
  _count: { _all: number }
}

interface CityGroup {
  city: string | null
  _count: { _all: number }
}

export async function getReportById(id: string) {
  const report = await prisma.report.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      messages: { orderBy: { createdAt: 'asc' } },
      assignedTo: true,
      assignedDepartment: true,
      attachments: { orderBy: { createdAt: 'desc' } },
      investigationNotes: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!report) return null

  const attachmentsWithSignedUrls = await Promise.all(
    report.attachments.map(async (attachment) => {
      const signedUrl = await getDownloadUrl(attachment.key)
      return { ...attachment, url: signedUrl || attachment.url }
    })
  )

  let decryptedDescription = report.description
  let decryptedRedactedDescription = report.redactedDescription

  try {
    decryptedDescription = decrypt(report.description)
  } catch (e) {
    logger.error(e, 'Failed to decrypt report description')
    decryptedDescription = '[DECRYPT_FAILED]'
  }

  try {
    if (report.redactedDescription) {
      decryptedRedactedDescription = decrypt(report.redactedDescription)
    }
  } catch (e) {
    logger.error(e, 'Failed to decrypt redacted report description')
    decryptedRedactedDescription = '[DECRYPT_FAILED]'
  }

  const decryptedMessages = report.messages.map((msg) => {
    let content = msg.content
    try {
      content = decrypt(msg.content)
    } catch {
      content = '[DECRYPT_FAILED]'
    }
    return { ...msg, content }
  })

  const decryptedInvestigationNotes = report.investigationNotes.map((note) => {
    let content = note.content
    try {
      content = decrypt(note.content)
    } catch {
      content = '[DECRYPT_FAILED]'
    }
    return { ...note, content }
  })

  return {
    ...report,
    description: decryptedDescription,
    redactedDescription: decryptedRedactedDescription,
    attachments: attachmentsWithSignedUrls,
    messages: decryptedMessages,
    investigationNotes: decryptedInvestigationNotes,
  }
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
  const where: Prisma.ReportWhereInput = { deletedAt: null }

  if (startDate) where.createdAt = { gte: startDate }
  if (search) where.trackingCode = { contains: search, mode: 'insensitive' }
  if (status) where.status = status as ReportStatus
  if (categoryId) where.categoryId = categoryId
  if (country) where.country = country
  if (city) where.city = city

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
        category: { select: { name: true } },
      },
    }),
    prisma.report.count({ where }),
  ])

  return {
    reports,
    total: Number(total),
    page,
    pageSize,
    totalPages: Math.ceil(Number(total) / pageSize),
  }
}

export async function getReportsLocations(filterCountry?: string) {
  const where: Prisma.ReportWhereInput = { deletedAt: null }
  if (filterCountry) where.country = filterCountry

  const [countries, cities] = await Promise.all([
    prisma.report.groupBy({
      by: ['country'],
      where: { ...where, country: { not: null } },
    }),
    prisma.report.groupBy({
      by: ['city'],
      where: { ...where, city: { not: null } },
    }),
  ])

  return {
    countries: countries.map((c) => c.country as string).filter(Boolean),
    cities: cities.map((c) => c.city as string).filter(Boolean),
  }
}

export async function getInvestigationNoteById(id: string) {
  const note = await prisma.investigationNote.findUnique({
    where: { id },
  })
  if (!note) return null
  let content = note.content
  try {
    content = decrypt(note.content)
  } catch {
    content = '[DECRYPT_FAILED]'
  }
  return { ...note, content }
}

export async function getQuickStats(days: number | null = 30, filterCountry?: string) {
  const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null
  const where: Prisma.ReportWhereInput = { deletedAt: null }
  if (startDate) where.createdAt = { gte: startDate }
  if (filterCountry) where.country = filterCountry

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [total, pending, inProgress, resolved, today] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.count({ where: { ...where, status: 'PENDING' } }),
    prisma.report.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.report.count({ where: { ...where, status: 'RESOLVED' } }),
    prisma.report.count({ where: { ...where, createdAt: { gte: todayStart } } }),
  ])

  return {
    total,
    pending,
    inProgress,
    resolved,
    today,
  }
}

export async function getReportStats(days: number | null = 30, filterCountry?: string) {
  const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null
  const where: Prisma.ReportWhereInput = { deletedAt: null }
  if (startDate) where.createdAt = { gte: startDate }
  if (filterCountry) where.country = filterCountry

  const [
    statusGroups,
    categoryGroups,
    departmentGroups,
    countryGroups,
    cityGroups,
    rawTimeline,
    resolutionData,
  ] = await Promise.all([
    prisma.report.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }) as unknown as Promise<StatusGroup[]>,
    prisma.report.groupBy({
      by: ['categoryId'],
      where,
      _count: { _all: true },
    }) as unknown as Promise<CategoryGroup[]>,
    prisma.report.groupBy({
      by: ['assignedDepartmentId'],
      where,
      _count: { _all: true },
    }) as unknown as Promise<DepartmentGroup[]>,
    prisma.report.groupBy({
      by: ['country'],
      where,
      _count: { _all: true },
    }) as unknown as Promise<CountryGroup[]>,
    prisma.report.groupBy({
      by: ['city'],
      where,
      _count: { _all: true },
    }) as unknown as Promise<CityGroup[]>,
    (() => {
      const conditions = [Prisma.sql`deleted_at IS NULL`]
      if (startDate) conditions.push(Prisma.sql`created_at >= ${startDate}`)
      if (filterCountry) conditions.push(Prisma.sql`country = ${filterCountry}`)
      const whereClause = Prisma.join(conditions, ' AND ')

      return prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', created_at) as day, count(*)::bigint as count
        FROM reports
        WHERE ${whereClause}
        GROUP BY day
        ORDER BY day ASC
      `
    })(),
    prisma.report.findMany({
      where: { ...where, status: 'RESOLVED' },
      select: { createdAt: true, updatedAt: true },
    }),
  ])

  const total = statusGroups.reduce((acc, curr) => acc + curr._count._all, 0)

  // Calculate Average Resolution Time (in days)
  let avgResolutionTime = 0
  if (resolutionData.length > 0) {
    const totalDays = resolutionData.reduce((acc, report) => {
      const diffMs = report.updatedAt.getTime() - report.createdAt.getTime()
      return acc + diffMs / (1000 * 60 * 60 * 24)
    }, 0)
    avgResolutionTime = Math.round(totalDays / resolutionData.length)
  }

  const statusStats = statusGroups.map((g) => ({
    status: g.status,
    count: g._count._all,
    percentage: total > 0 ? Math.round((g._count._all / total) * 100) : 0,
  }))

  const categories = await prisma.category.findMany({ select: { id: true, name: true } })
  const departments = await prisma.department.findMany({ select: { id: true, name: true } })

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const departmentMap = new Map(departments.map((d) => [d.id, d.name]))

  const categoryStats = categoryGroups.map((g) => ({
    category: g.categoryId ? categoryMap.get(g.categoryId) || 'Geral' : 'Geral',
    count: g._count._all,
  }))

  const departmentStats = departmentGroups.map((g) => ({
    departmentId: g.assignedDepartmentId || 'none',
    name: g.assignedDepartmentId
      ? departmentMap.get(g.assignedDepartmentId) || 'Não atribuído'
      : 'Não atribuído',
    count: g._count._all,
  }))

  const countryStats = countryGroups.map((g) => ({
    country: g.country || 'Desconhecido',
    count: g._count._all,
  }))

  const cityStats = cityGroups.map((g) => ({
    city: g.city || 'Desconhecido',
    count: g._count._all,
  }))

  const timelineData = rawTimeline.map((r) => ({
    date: r.day.toISOString().split('T')[0],
    count: Number(r.count),
  }))

  return {
    total,
    statusStats,
    categoryStats,
    departmentStats,
    countryStats,
    cityStats,
    timelineData,
    avgResolutionTime,
  }
}

export async function getGlobalActivityLogs(limit: number = 10, filterCountry?: string) {
  const where: Prisma.ActivityLogWhereInput = {}
  if (filterCountry) {
    where.report = { country: filterCountry }
  }

  return await prisma.activityLog.findMany({
    take: limit,
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      report: { select: { id: true, trackingCode: true } },
    },
  })
}
