import { Badge } from '@/_components/ui/badge'
import { ReportStatus } from '@/_generated/prisma'
import { cn } from '@/_lib/utils'

const statusConfig = {
  [ReportStatus.PENDING]: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500',
  },
  [ReportStatus.IN_PROGRESS]: {
    label: 'Em Análise',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-500',
  },
  [ReportStatus.RESOLVED]: {
    label: 'Resolvido',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500',
  },
  [ReportStatus.REJECTED]: {
    label: 'Arquivado',
    className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-500',
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
