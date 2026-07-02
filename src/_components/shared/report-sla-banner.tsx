import { ReportStatus } from '@/_generated/prisma'
import { Clock, CheckCircle2, XCircle, Archive, Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface Props {
  status: ReportStatus
}

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    iconClass: 'text-amber-500',
  },
  IN_PROGRESS: {
    icon: Search,
    colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
    iconClass: 'text-blue-500',
  },
  RESOLVED: {
    icon: CheckCircle2,
    colorClass: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
    iconClass: 'text-green-500',
  },
  REJECTED: {
    icon: XCircle,
    colorClass: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    iconClass: 'text-red-500',
  },
  ARCHIVED: {
    icon: Archive,
    colorClass: 'bg-muted/60 border-border text-muted-foreground',
    iconClass: 'text-muted-foreground',
  },
}

export async function ReportSlaBanner({ status }: Props) {
  const t = await getTranslations('Sla')
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  const Icon = config.icon

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-medium ${config.colorClass}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} />
      <span>{t(status)}</span>
    </div>
  )
}
