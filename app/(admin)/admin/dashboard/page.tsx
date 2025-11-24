import { getReportStats, getQuickStats } from '@/app/_lib/stats'
import { StatsCards } from './stats'
import { StatusChart, CategoryChart, TimelineChart } from './charts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [quickStats, reportStats] = await Promise.all([
    getQuickStats(),
    getReportStats(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema de denúncias
        </p>
      </div>

      <StatsCards stats={quickStats} />

      <div className="grid gap-6 md:grid-cols-2">
        <StatusChart data={reportStats.statusStats} />
        <CategoryChart data={reportStats.categoryStats} />
      </div>

      {reportStats.timelineData.length > 0 && (
        <TimelineChart data={reportStats.timelineData} />
      )}
    </div>
  )
}
