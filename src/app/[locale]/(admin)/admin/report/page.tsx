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

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function ReportsPage({ searchParams }: Props) {
  const t = await getTranslations('Admin')
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 15

  const { reports, totalPages } = await getReportsPaginated(currentPage, pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{t('recentReports')}</h1>
        <p className="text-muted-foreground mt-2">Lista completa de denúncias recebidas</p>
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
              reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-primary font-mono font-bold">
                    {report.trackingCode}
                  </TableCell>
                  <TableCell className="font-medium">{report.category?.name || 'Geral'}</TableCell>
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
      <Pagination page={currentPage} totalPages={totalPages} baseUrl="/admin/report" />
    </div>
  )
}
