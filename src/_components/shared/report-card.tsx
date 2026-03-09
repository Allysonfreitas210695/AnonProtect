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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>Denúncia #{report.trackingCode}</CardTitle>
          {showStatus && (
            <StatusBadge status={report.status} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCategory && (
          <div>
            <p className="text-muted-foreground text-sm font-medium">Tipo</p>
            <p className="text-lg font-semibold">{formatCategory(report.type)}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground text-sm font-medium">Descrição</p>
          <p className="text-foreground whitespace-pre-wrap">{report.description}</p>
        </div>
        {showDate && (
          <div>
            <p className="text-muted-foreground text-sm font-medium">Data de Criação</p>
            <p>{formatDate(report.createdAt)}</p>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
