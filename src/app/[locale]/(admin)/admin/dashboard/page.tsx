import { getReportStats, getQuickStats } from '@/_data-access/admin/stats.query'
import { StatsCards } from './_components/stats'
import { StatusChart, CategoryChart, TimelineChart, LocationChart } from './_components/charts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [quickStats, reportStats] = await Promise.all([getQuickStats(), getReportStats()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold lg:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral do sistema de denúncias</p>
      </div>

      <StatsCards stats={quickStats} />

      <div className="grid gap-6 md:grid-cols-2">
        <StatusChart data={reportStats.statusStats} />
        <CategoryChart data={reportStats.categoryStats} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LocationChart
          title="Denúncias por País"
          description="Distribuição geográfica global"
          data={reportStats.countryStats}
        />
        <LocationChart
          title="Denúncias por Cidade"
          description="Distribuição regional"
          data={reportStats.cityStats}
        />
      </div>

      {reportStats.timelineData.length > 0 && <TimelineChart data={reportStats.timelineData} />}
    </div>
  )
}
