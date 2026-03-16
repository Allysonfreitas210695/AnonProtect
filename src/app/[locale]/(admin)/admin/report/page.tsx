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
import { formatDate } from '@/_utils/formatters'

import { DashboardDateFilter } from '@/_components/shared/dashboard-date-filter'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string; period?: string }>
}

export default async function ReportsPage({ searchParams }: Props) {
  const t = await getTranslations('Admin')
  const { page, period } = await searchParams
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

  const { reports, totalPages } = await getReportsPaginated(currentPage, pageSize, days)

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight lg:text-4xl">
            {t('recentReports')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Lista completa de denúncias recebidas
          </p>
        </div>
        <DashboardDateFilter />
      </div>

      <div className="bg-card relative overflow-hidden rounded-2xl border-none shadow-sm transition-all hover:shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-foreground/70 w-[140px] py-4 text-[10px] font-bold tracking-wider uppercase">
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
                    <p className="font-medium">{t('noReports')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="group border-border/40 hover:bg-muted/40 font-medium transition-all"
                  >
                    <TableCell className="text-primary/90 py-4 font-mono text-sm font-black">
                      {report.trackingCode}
                    </TableCell>
                    <TableCell className="py-4 text-sm font-semibold">
                      {report.category?.name || 'Geral'}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4 text-xs">
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
                        className="hover:bg-primary hover:text-primary-foreground h-8 transform rounded-lg text-[11px] font-bold tracking-wide uppercase opacity-0 transition-all group-hover:opacity-100 active:scale-95"
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
      <Pagination page={currentPage} totalPages={totalPages} baseUrl="/admin/report" />
    </div>
  )
}
