import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { StatusBadge } from '@/_components/shared/status-badge'
import { Pagination } from '@/_components/shared/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/_components/ui/table'
import { getReportsPaginated } from '@/_data-access/admin/report.query'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'

import { GlobalActivityLog } from '@/_components/shared/global-activity-log'
import { formatDate } from '@/_utils/formatters'
import {
  getGlobalActivityLogs,
  getQuickStats,
  getReportStats,
} from '@/_data-access/admin/stats.query'
import { StatsCards } from '@/_components/shared/stats-cards'
import { AnalyticsChart } from '@/_components/shared/analytics-chart'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminDashboard({ searchParams }: Props) {
  const t = await getTranslations('Admin')
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  let reports: Awaited<ReturnType<typeof getReportsPaginated>>['reports'] = []
  let totalPages = 0
  let quickStats: Awaited<ReturnType<typeof getQuickStats>> = {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  }
  let fullStats: Awaited<ReturnType<typeof getReportStats>> | undefined
  let activities: Awaited<ReturnType<typeof getGlobalActivityLogs>> = []

  try {
    const [paginatedData, qs, fs, act] = await Promise.all([
      getReportsPaginated(currentPage, pageSize),
      getQuickStats(),
      getReportStats(),
      getGlobalActivityLogs(8),
    ])

    reports = paginatedData.reports
    totalPages = paginatedData.totalPages
    quickStats = qs
    fullStats = fs
    activities = act
  } catch (error) {
    console.error('AdminDashboard error:', error)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-destructive text-2xl font-bold">Erro ao carregar Dashboard</h1>
        <p className="text-muted-foreground">Ocorreu um problema ao buscar os dados do servidor.</p>
        <pre className="bg-muted max-w-full overflow-auto rounded p-4 text-xs">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <Button asChild variant="outline">
          <Link href="/admin">Tentar Novamente</Link>
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
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-2">{t('systemOverview')}</p>
      </div>

      <StatsCards stats={statsWithTTR} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AnalyticsChart data={fullStats.timelineData} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">{t('recentReports')}</h2>
            </div>
            <div className="bg-card overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[120px]">{t('code')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                        {t('noReports')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.slice(0, 5).map((report) => (
                      <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-primary font-mono font-bold">
                          {report.trackingCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {report.category?.name || 'Geral'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(report.createdAt)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={report.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="hover:bg-primary/10 hover:text-primary"
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
            <div className="flex justify-end pt-2">
              <Button asChild variant="link" className="text-primary">
                <Link href="/admin/report">Ver todos os relatos →</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <GlobalActivityLog activities={activities} />

          <Card className="ring-border flex flex-col border-none shadow-sm ring-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('byDepartment')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {fullStats.departmentStats.length === 0 ? (
                  <p className="text-muted-foreground py-10 text-center text-sm">
                    {t('noDepartmentData')}
                  </p>
                ) : (
                  fullStats.departmentStats.map(
                    (dept: { departmentId: string; name: string; count: number }) => (
                      <div key={dept.departmentId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="max-w-[150px] truncate font-medium">{dept.name}</span>
                          <span className="text-muted-foreground">{dept.count}</span>
                        </div>
                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full"
                            style={{ width: `${(dept.count / quickStats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
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
