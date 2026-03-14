import { Report } from '@/_generated/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { formatDate, formatCategory } from '@/_utils/formatters'
import { StatusBadge } from '@/_components/shared/status-badge'

interface ReportCardProps {
  report: Report
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
    <Card className="border-border shadow-sm bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-bold lg:text-2xl">Denúncia #{report.trackingCode}</CardTitle>
          {showStatus && (
            <StatusBadge status={report.status} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {showCategory && (
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Categoria</p>
              <p className="text-lg font-semibold text-primary">{formatCategory(report.type)}</p>
            </div>
          )}
          {showDate && (
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Data de Criação</p>
              <p className="text-lg font-medium">{formatDate(report.createdAt)}</p>
            </div>
          )}
        </div>
        
        <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Descrição da Ocorrência</p>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{report.description}</p>
        </div>
        
        {children}
      </CardContent>
    </Card>
  )
}
