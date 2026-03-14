import { Badge } from '@/_components/ui/badge'
import { ReportStatus } from '@/_generated/prisma'
import { cn } from '@/_lib/utils'

const statusConfig = {
  [ReportStatus.PENDING]: {
    label: 'Pendente',
    className: 'bg-warning/10 text-warning hover:bg-warning/20',
  },
  [ReportStatus.IN_PROGRESS]: {
    label: 'Em Análise',
    className: 'bg-primary/10 text-primary hover:bg-primary/20',
  },
  [ReportStatus.RESOLVED]: {
    label: 'Resolvido',
    className: 'bg-success/10 text-success hover:bg-success/20',
  },
  [ReportStatus.REJECTED]: {
    label: 'Arquivado',
    className: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  },
}

interface StatusBadgeProps {
  status: ReportStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(config.className, 'border-none font-medium', className)}>
      {config.label}
    </Badge>
  )
}
