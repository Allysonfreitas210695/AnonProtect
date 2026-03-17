import { getTranslations } from 'next-intl/server'
import { Pagination } from '@/_components/shared/pagination'
import {
  getReportsPaginated,
  getAllCategories,
  getReportsLocations,
} from '@/_data-access/admin/report.query'
import { ReportsTableClient } from './_components/reports-table-client'

import { DashboardDateFilter } from '@/_components/shared/dashboard-date-filter'
import { ReportSearchFilter } from '@/_components/shared/report-search-filter'
import { ReportAdvancedFilters } from '@/_components/shared/report-advanced-filters'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    page?: string
    period?: string
    search?: string
    status?: string
    category?: string
    country?: string
    city?: string
  }>
}

export default async function ReportsPage({ searchParams }: Props) {
  const t = await getTranslations('Admin')
  const { page, period, search, status, category, country, city } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 15

  const days =
    period === '7d'
      ? 7
      : period === '30d'
        ? 30
        : period === '90d'
          ? 90
          : period === 'all'
            ? null
            : 30

  const [{ reports, totalPages }, dbCategories, { countries, cities }] = await Promise.all([
    getReportsPaginated(currentPage, pageSize, days, search, status, category, country, city),
    getAllCategories(),
    getReportsLocations(),
  ])

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight lg:text-4xl">
            {t('recentReports')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {t('reportsSubtitle')}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <ReportSearchFilter />
          <DashboardDateFilter />
        </div>
      </div>

      <div className="px-2">
        <ReportAdvancedFilters categories={dbCategories} countries={countries} cities={cities} />
      </div>

      <ReportsTableClient reports={reports} />

      <Pagination page={currentPage} totalPages={totalPages} baseUrl="/admin/report" />
    </div>
  )
}
