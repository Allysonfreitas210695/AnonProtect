import { getReportStats } from '@/_data-access/admin/stats.query'
import { AdminAnalyticsDashboard } from '@/_components/shared/admin-analytics-dashboard'
import { DashboardDateFilter } from '@/_components/shared/dashboard-date-filter'

interface AnalyticsPageProps {
  searchParams: Promise<{ days?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { days } = await searchParams
  const daysNum = days ? parseInt(days) : 30

  const stats = await getReportStats(daysNum)

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análise Avançada</h2>
          <p className="text-muted-foreground">
            Acompanhe métricas detalhadas e tendências do sistema de proteção.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DashboardDateFilter />
        </div>
      </div>

      <AdminAnalyticsDashboard stats={stats} />
    </div>
  )
}
