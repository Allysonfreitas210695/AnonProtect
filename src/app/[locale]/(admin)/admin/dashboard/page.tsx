import { getReportStats, getQuickStats } from '@/_modules/admin/admin.query'
import { StatsCards } from './_components/stats'
import { StatusChart, CategoryChart, TimelineChart, LocationChart } from './_components/charts'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [quickStats, reportStats] = await Promise.all([getQuickStats(), getReportStats()])
  const t = await getTranslations('Dashboard')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold lg:text-4xl">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('overview')}</p>
        </div>
      </div>

      <StatsCards stats={quickStats} />

      <div className="grid gap-6 md:grid-cols-2">
        <StatusChart data={reportStats.statusStats} />
        <CategoryChart data={reportStats.categoryStats} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LocationChart
          title={t('charts.countryTitle')}
          description={t('charts.countryDescription')}
          data={reportStats.countryStats}
        />
        <LocationChart
          title={t('charts.cityTitle')}
          description={t('charts.cityDescription')}
          data={reportStats.cityStats}
        />
      </div>

      {reportStats.timelineData.length > 0 && <TimelineChart data={reportStats.timelineData} />}
    </div>
  )
}
