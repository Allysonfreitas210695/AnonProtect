import { getReportStats } from '@/_modules/admin/admin.query'
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
    <div className="flex-1 space-y-8 p-4 pt-4 sm:p-8 sm:pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Análise Avançada</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Acompanhe métricas detalhadas e tendências do sistema de proteção.
          </p>
        </div>
        <div className="flex items-center">
          <DashboardDateFilter />
        </div>
      </div>

      <AdminAnalyticsDashboard stats={stats} />
    </div>
  )
}
