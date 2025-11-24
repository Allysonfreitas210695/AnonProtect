import { prisma } from './prisma'

export async function getReportStats() {
  const [total, byStatus, byCategory, recent] = await Promise.all([
    // Total reports
    prisma.report.count(),
    
    // Reports by status
    prisma.report.groupBy({
      by: ['status'],
      _count: true,
    }),
    
    // Reports by category
    prisma.report.groupBy({
      by: ['type'],
      _count: true,
    }),
    
    // Recent reports (last 30 days)
    prisma.report.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
  ])

  // Calculate status percentages
  const statusStats = byStatus.map(item => ({
    status: item.status,
    count: item._count,
    percentage: total > 0 ? Math.round((item._count / total) * 100) : 0,
  }))

  // Calculate category stats
  const categoryStats = byCategory.map(item => ({
    category: item.type,
    count: item._count,
  }))

  // Group recent reports by date
  const recentByDate = recent.reduce((acc, report) => {
    const date = new Date(report.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date]++
    return acc
  }, {} as Record<string, number>)

  const timelineData = Object.entries(recentByDate).map(([date, count]) => ({
    date,
    count,
  }))

  return {
    total,
    statusStats,
    categoryStats,
    timelineData,
  }
}

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
