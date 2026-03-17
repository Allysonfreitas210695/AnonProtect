import { prisma } from '@/_lib/prisma'
import { unstable_cache } from 'next/cache'

export const getPublicStats = unstable_cache(
  async () => {
    const [totalReports, resolvedReports, reportsByCategory, reportsByStatus, reportsByMonth] =
      await Promise.all([
        prisma.report.count(),
        prisma.report.count({ where: { status: 'RESOLVED' } }),
        prisma.report.groupBy({
          by: ['categoryId'],
          _count: { id: true },
        }),
        prisma.report.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        // Busca denúncias dos últimos 12 meses
        prisma.report.findMany({
          where: {
            createdAt: {
              gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            },
          },
          select: { createdAt: true },
        }),
      ])

    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    })

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    // Processa dados por categoria
    const categoryStats = reportsByCategory.map((item) => ({
      name: categoryMap.get(item.categoryId || '') || 'Outros',
      value: item._count.id,
    }))

    // Processa dados por status
    const statusStats = reportsByStatus.map((item) => ({
      name: item.status,
      value: item._count.id,
    }))

    // Processa dados por mês (Timeline)
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]

    const timelineMap = new Map<string, number>()
    reportsByMonth.forEach((r) => {
      const month = months[r.createdAt.getMonth()]
      const year = r.createdAt.getFullYear()
      const key = `${month}/${year}`
      timelineMap.set(key, (timelineMap.get(key) || 0) + 1)
    })

    const timelineStats = Array.from(timelineMap.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .slice(-12)

    return {
      totalReports,
      resolvedReports,
      categoryStats,
      statusStats,
      timelineStats,
    }
  },
  ['public-stats'],
  { revalidate: 3600, tags: ['public-stats'] }
)
