import Link from 'next/link'
import { ReportWithCategory } from '@/_types/report'
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

import { StatsCards } from '@/_components/shared/stats-cards'
import { AnalyticsChart } from '@/_components/shared/analytics-chart'
import { getReportStats, getQuickStats } from '@/_data-access/admin/stats.query'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminDashboard({ searchParams }: Props) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10

  const [{ reports, totalPages }, quickStats, fullStats] = await Promise.all([
    getReportsPaginated(currentPage, pageSize),
    getQuickStats(),
    getReportStats(),
  ])

  const statsWithTTR = {
    ...quickStats,
    avgResolutionTime: fullStats.avgResolutionTime,
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral do sistema de proteção</p>
      </div>

      <StatsCards stats={statsWithTTR} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsChart data={fullStats.timelineData} />
        </div>
        <Card className="ring-border flex flex-col border-none shadow-sm ring-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Por Departamento</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {fullStats.departmentStats.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  Sem dados departamentais
                </p>
              ) : (
                fullStats.departmentStats.map((dept) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Denúncias Recentes</h2>
        </div>
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md">
          {/* Table content (same as before) */}
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[120px]">Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                    Nenhuma denúncia registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report: ReportWithCategory) => (
                  <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-primary font-mono font-bold">
                      {report.trackingCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.category?.name || 'Geral'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
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
                        <Link href={`/admin/report/${report.id}`}>Ver Detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination page={currentPage} totalPages={totalPages} baseUrl="/admin" />
      </div>
    </div>
  )
}
