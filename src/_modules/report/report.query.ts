import 'server-only'

import { prisma } from '@/_shared/lib/prisma'
import { decrypt } from '@/_shared/lib/crypto'

export async function getCategories() {
  return await prisma.category.findMany({
    where: { active: true },
    select: { id: true, name: true, defaultDepartmentId: true },
  })
}

export async function getActiveCategories() {
  return await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })
}

export async function getReportByCode(code: string) {
  const report = await prisma.report.findUnique({
    where: { trackingCode: code, deletedAt: null },
    include: {
      category: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!report) return null

  let decryptedDescription = report.description
  try {
    decryptedDescription = decrypt(report.description)
  } catch {
    decryptedDescription = '[DECRYPT_FAILED]'
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

  return {
    ...report,
    description: decryptedDescription,
    messages: decryptedMessages,
  }
}

export async function getPublicStats() {
  const [totalReports, resolvedReports, statusGroups, categoryGroups, rawTimeline] =
    await Promise.all([
      prisma.report.count({ where: { deletedAt: null } }),
      prisma.report.count({ where: { status: 'RESOLVED', deletedAt: null } }),
      prisma.report.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['categoryId'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ month: Date; count: bigint }[]>`
        SELECT date_trunc('month', created_at) as month, count(*)::bigint as count
        FROM reports
        WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '1 year'
        GROUP BY month
        ORDER BY month ASC
      `,
    ])

  const statusStats = statusGroups.map((g) => ({
    name: g.status,
    value: g._count._all,
  }))

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  })

  const categoryStats = categoryGroups.map((g) => ({
    name: categories.find((c) => c.id === g.categoryId)?.name || 'Outros',
    value: g._count._all,
  }))

  const monthNames = [
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

  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`
    timelineMap.set(label, 0)
  }

  rawTimeline.forEach((r) => {
    const date = new Date(r.month)
    const label = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`
    if (timelineMap.has(label)) {
      timelineMap.set(label, Number(r.count))
    }
  })

  const timelineStats = Array.from(timelineMap.entries()).map(([name, value]) => ({
    name,
    value,
  }))

  return {
    totalReports,
    resolvedReports,
    statusStats,
    categoryStats,
    timelineStats,
  }
}
