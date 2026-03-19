import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { StatusBadge } from '@/_components/shared/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/_components/ui/table'
import { getReportsPaginated } from '@/_modules/admin/admin.query'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { FileText, ShieldCheck } from 'lucide-react'

import { GlobalActivityLog } from '@/_components/shared/global-activity-log'
import { formatDate } from '@/_shared/utils/formatters'
import { getGlobalActivityLogs, getQuickStats, getReportStats } from '@/_modules/admin/admin.query'
import { StatsCards } from '@/_components/shared/stats-cards'
import { AnalyticsChart } from '@/_components/shared/analytics-chart'

import { DashboardDateFilter } from '@/_components/shared/dashboard-date-filter'
import { ReportSearchFilter } from '@/_components/shared/report-search-filter'
import { getCurrentUser } from '@/_shared/lib/auth'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string; period?: string; search?: string }>
}

export default async function AdminDashboard({ searchParams }: Props) {
  const t = await getTranslations('Admin')
  const user = await getCurrentUser()
  const { page, period, search } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10

  const filterCountry = user?.role === 'SUPERVISOR' ? user.country : undefined

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

  let reports: Awaited<ReturnType<typeof getReportsPaginated>>['reports'] = []
  let quickStats: Awaited<ReturnType<typeof getQuickStats>> = {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    today: 0,
  }
  let fullStats: Awaited<ReturnType<typeof getReportStats>> | undefined
  let activities: Awaited<ReturnType<typeof getGlobalActivityLogs>> = []

  try {
    const [paginatedData, qs, fs, act] = await Promise.all([
      getReportsPaginated(
        currentPage,
        pageSize,
        days,
        search,
        undefined,
        undefined,
        undefined,
        undefined,
        filterCountry || undefined
      ),
      getQuickStats(days, filterCountry || undefined),
      getReportStats(days, filterCountry || undefined),
      getGlobalActivityLogs(8, filterCountry || undefined),
    ])

    reports = paginatedData.reports
    quickStats = qs
    fullStats = fs
    activities = act
  } catch (error) {
    console.error('AdminDashboard error:', error)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4 text-center">
        <div className="bg-destructive/10 rounded-full p-4">
          <h1 className="text-destructive text-2xl font-bold">{t('errors.load')}</h1>
        </div>
        <p className="text-muted-foreground max-w-md">{t('errors.loadDescription')}</p>
        <div className="bg-muted w-full max-w-2xl overflow-hidden rounded-xl shadow-lg">
          <div className="bg-muted-foreground/10 text-muted-foreground px-4 py-2 text-xs font-semibold tracking-widest uppercase">
            {t('errors.details')}
          </div>
          <pre className="text-foreground/80 max-w-full overflow-auto p-6 text-left font-mono text-xs">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
        <Button asChild variant="default" size="lg">
          <Link href="/admin">{t('tryAgain')}</Link>
        </Button>
      </div>
    )
  }

  if (!fullStats) return null

  const statsWithTTR = {
    ...quickStats,
    avgResolutionTime: fullStats.avgResolutionTime,
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight lg:text-4xl">
            {t('dashboard')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('systemOverview')}</p>
        </div>
        <DashboardDateFilter />
      </div>

      <StatsCards stats={statsWithTTR} />

      <div className="grid w-full gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-8 lg:col-span-2">
          <div className="bg-card/30 rounded-3xl border-none p-1">
            <AnalyticsChart data={fullStats.timelineData} />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{t('recentReports')}</h2>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 hidden sm:flex"
                >
                  <Link href="/admin/report" className="flex items-center gap-1.5 font-semibold">
                    {t('viewAll')} <span className="text-lg">→</span>
                  </Link>
                </Button>
              </div>
              <div className="flex flex-1 items-center gap-2 sm:max-w-xs">
                <ReportSearchFilter />
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 flex sm:hidden"
                >
                  <Link href="/admin/report" className="flex items-center gap-1.5 font-semibold">
                    <span className="text-lg">→</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-card relative w-full overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl">
              <div className="scrollbar-auto overflow-x-auto">
                <Table className="min-w-[700px] lg:min-w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="text-foreground/70 w-[70px] py-4 text-[10px] font-bold tracking-wider uppercase md:w-[120px] lg:w-[160px]">
                        {t('code')}
                      </TableHead>
                      <TableHead className="text-foreground/70 py-4 text-[10px] font-bold tracking-wider uppercase">
                        {t('type')}
                      </TableHead>
                      <TableHead className="text-foreground/70 py-4 text-[10px] font-bold tracking-wider uppercase">
                        {t('date')}
                      </TableHead>
                      <TableHead className="text-foreground/70 py-4 text-[10px] font-bold tracking-wider uppercase">
                        {t('status')}
                      </TableHead>
                      <TableHead className="text-foreground/70 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                        {t('actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-muted rounded-full p-4">
                              <FileText className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="font-medium">{t('noReports')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.slice(0, 5).map((report) => (
                        <TableRow
                          key={report.id}
                          className="group hover:bg-muted/40 border-border/40 transition-all"
                        >
                          <TableCell className="text-primary/90 py-4 font-mono text-xs font-black sm:text-sm">
                            {report.trackingCode}
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate py-4 text-xs font-semibold sm:text-sm md:max-w-none">
                            {report.category?.name || 'Geral'}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4 text-[10px] font-medium sm:text-xs">
                            {formatDate(report.createdAt)}
                          </TableCell>
                          <TableCell className="py-4">
                            <StatusBadge status={report.status} />
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <Button
                              asChild
                              variant="secondary"
                              size="sm"
                              className="hover:bg-primary hover:text-primary-foreground h-8 transform rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              <Link href={`/admin/report/${report.id}`}>{t('viewDetails')}</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-8">
          <GlobalActivityLog activities={activities} />

          <Card className="bg-card/50 hover:bg-card overflow-hidden shadow-xl transition-all hover:shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold tracking-tight">
                {t('byDepartment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pt-4">
                {fullStats.departmentStats.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 opacity-50">
                    <ShieldCheck className="text-muted-foreground h-10 w-10" />
                    <p className="text-sm font-medium">{t('noDepartmentData')}</p>
                  </div>
                ) : (
                  fullStats.departmentStats.map(
                    (dept: { departmentId: string; name: string; count: number }) => {
                      const percentage = Math.round((dept.count / quickStats.total) * 100)
                      return (
                        <div key={dept.departmentId} className="group w-full min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2 overflow-hidden">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                              <span className="text-foreground/90 group-hover:text-primary truncate text-sm font-bold tracking-tight transition-colors">
                                {dept.name}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                              <span className="text-muted-foreground text-[10px] font-black uppercase">
                                {dept.count} {t('Stats.units')}
                              </span>
                              <span className="text-primary text-xs font-black">{percentage}%</span>
                            </div>
                          </div>
                          <div className="bg-muted/50 h-2.5 w-full overflow-hidden rounded-full border border-transparent">
                            <style>{`
                              .progress-bar-${dept.departmentId} {
                                width: ${percentage}%;
                              }
                            `}</style>
                            <div
                              className={`progress-bar-${dept.departmentId} from-primary to-primary/60 group-hover:from-primary group-hover:to-primary h-full rounded-full bg-linear-to-r shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000`}
                            />
                          </div>
                        </div>
                      )
                    }
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
