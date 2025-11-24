import { Report } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatStatus, formatCategory } from '@/lib/utils/formatters'
import { STATUS_COLORS } from '@/lib/constants'

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
  children 
}: ReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Denúncia #{report.trackingCode}</CardTitle>
          {showStatus && (
            <Badge variant={STATUS_COLORS[report.status]}>
              {formatStatus(report.status)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCategory && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tipo</p>
            <p className="text-lg font-semibold">{formatCategory(report.type)}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Descrição</p>
          <p className="whitespace-pre-wrap text-foreground">{report.description}</p>
        </div>
        {showDate && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
            <p>{formatDate(report.createdAt)}</p>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
