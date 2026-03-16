import { prisma } from '@/_lib/prisma'
import { unstable_cache } from 'next/cache'
import { calculateAvgResolutionTime } from '@/_utils/compliance'

export const getReportStats = unstable_cache(
  async (days: number | null = 30) => {
    const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null
    const where = startDate ? { createdAt: { gte: startDate } } : {}

    const [
      total,
      byStatus,
      byCategory,
      byDeptRaw,
      allDepts,
      resolvedRaw,
      byCountry,
      byCity,
      timelineRaw,
    ] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.report.groupBy({
        by: ['categoryId'],
        where,
        _count: true,
      }),
      prisma.report.groupBy({
        by: ['assignedDepartmentId'],
        where,
        _count: true,
      }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.report.findMany({
        where: { ...where, status: 'RESOLVED' },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.report.groupBy({
        by: ['country'],
        where,
        _count: true,
      }),
      prisma.report.groupBy({
        by: ['city'],
        where,
        _count: true,
      }),
      startDate
        ? prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT TO_CHAR(created_at, 'DD/MM') as date, COUNT(*)::bigint as count
            FROM reports
            WHERE created_at >= ${startDate}
            GROUP BY TO_CHAR(created_at, 'DD/MM')
            ORDER BY MIN(created_at) ASC
          `
        : prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT TO_CHAR(created_at, 'MM/YY') as date, COUNT(*)::bigint as count
            FROM reports
            GROUP BY TO_CHAR(created_at, 'MM/YY')
            ORDER BY MIN(created_at) ASC
          `,
    ])

    const totalCount = Number(total)
    const avgResolutionTime = calculateAvgResolutionTime(resolvedRaw)

    const deptMap = new Map(allDepts.map((d) => [d.id, d.name]))

    return {
      total: totalCount,
      statusStats: byStatus.map((s) => ({
        status: s.status,
        count: Number(s._count),
        percentage: totalCount > 0 ? Math.round((Number(s._count) / totalCount) * 100) : 0,
      })),
      categoryStats: byCategory.map((c) => ({
        category: c.categoryId || 'Outros',
        count: Number(c._count),
      })),
      departmentStats: byDeptRaw.map((d) => ({
        departmentId: d.assignedDepartmentId || 'unassigned',
        name: d.assignedDepartmentId
          ? deptMap.get(d.assignedDepartmentId) || 'Desconhecido'
          : 'Não Atribuído',
        count: Number(d._count),
      })),
      countryStats: byCountry.map((c) => ({
        country: c.country || 'Desconhecido',
        count: Number(c._count),
      })),
      cityStats: byCity.map((c) => ({
        city: c.city || 'Desconhecido',
        count: Number(c._count),
      })),
      timelineData: timelineRaw.map((t) => ({
        date: t.date,
        count: Number(t.count),
      })),
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    }
  },
  ['admin-stats'],
  { revalidate: 3600, tags: ['stats'] }
)

export async function getQuickStats(days: number | null = 30) {
  const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null
  const where = startDate ? { createdAt: { gte: startDate } } : {}

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [total, pending, inProgress, resolved, todayCount] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.count({ where: { ...where, status: 'PENDING' } }),
    prisma.report.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.report.count({ where: { ...where, status: 'RESOLVED' } }),
    prisma.report.count({ where: { createdAt: { gte: today } } }),
  ])

  return {
    total,
    pending,
    inProgress,
    resolved,
    today: todayCount,
  }
}

export const getGlobalActivityLogs = unstable_cache(
  async (limit: number = 10) => {
    return await prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        report: {
          select: {
            id: true,
            trackingCode: true,
          },
        },
      },
    })
  },
  ['global-activity-logs'],
  { revalidate: 60, tags: ['activity-logs'] }
)
