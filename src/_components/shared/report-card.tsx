import { ReportWithCategory } from '@/_types/report'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { formatDate } from '@/_utils/formatters'
import { StatusBadge } from '@/_components/shared/status-badge'

interface ReportCardProps {
  report: ReportWithCategory
  showStatus?: boolean
  showCategory?: boolean
  showDate?: boolean
  children?: React.ReactNode
}

export function ReportCard({
  report,
  showStatus = true,
  showCategory = true,
  showDate = true,
  children,
}: ReportCardProps) {
  return (
    <Card className="border-border bg-card/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-bold lg:text-2xl">
            Denúncia #{report.trackingCode}
          </CardTitle>
          {showStatus && <StatusBadge status={report.status} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {showCategory && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase">
                Categoria
              </p>
              <p className="text-primary text-lg font-semibold">
                {report.category?.name || 'Não informada'}
              </p>
            </div>
          )}
          {showDate && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase">
                Data de Criação
              </p>
              <p className="text-lg font-medium">{formatDate(report.createdAt)}</p>
            </div>
          )}
        </div>

        <div className="bg-muted/50 ring-border/50 rounded-lg p-4 ring-1">
          <p className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
            Descrição da Ocorrência
          </p>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {report.description}
          </p>
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
