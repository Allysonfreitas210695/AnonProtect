import { prisma } from '@/_lib/prisma'
import { unstable_cache } from 'next/cache'
import { calculateAvgResolutionTime } from '@/_utils/compliance'

export const getReportStats = unstable_cache(
  async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      total, 
      byStatus, 
      byCategory, 
      byDeptRaw, 
      allDepts, 
      resolvedRaw, 
      timelineRaw
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({ by: ['status'], _count: true }),
      prisma.report.groupBy({ by: ['type'], _count: true }),
      prisma.report.groupBy({ by: ['assignedDepartmentId'], _count: true }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.report.findMany({
        where: { status: 'RESOLVED' },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT TO_CHAR(created_at, 'DD/MM') as date, COUNT(*) as count
        FROM reports
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY TO_CHAR(created_at, 'DD/MM'), date
        ORDER BY MIN(created_at) ASC
      `,
    ])

    const avgResolutionTime = calculateAvgResolutionTime(resolvedRaw)

    const deptMap = new Map(allDepts.map(d => [d.id, d.name]))

    return {
      total,
      statusStats: byStatus.map(s => ({
        status: s.status,
        count: s._count,
        percentage: total > 0 ? Math.round((Number(s._count) / total) * 100) : 0,
      })),
      categoryStats: byCategory.map(c => ({
        category: c.type,
        count: c._count,
      })),
      departmentStats: byDeptRaw.map(d => ({
        departmentId: d.assignedDepartmentId || 'unassigned',
        name: d.assignedDepartmentId ? (deptMap.get(d.assignedDepartmentId) || 'Desconhecido') : 'Não Atribuído',
        count: d._count,
      })),
      timelineData: timelineRaw.map(t => ({
        date: t.date,
        count: Number(t.count),
      })),
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    }
  },
  ['admin-stats'],
  { revalidate: 3600, tags: ['stats'] }
)


export async function getQuickStats() {
  const [total, pending, inProgress, resolved] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.report.count({ where: { status: 'RESOLVED' } }),
  ])

  return {
    total,
    pending,
    inProgress,
    resolved,
  }
}
