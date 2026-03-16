'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/_components/ui/badge'
import { ReportStatus } from '@/_generated/prisma'
import { cn } from '@/_lib/utils'

interface StatusBadgeProps {
  status: ReportStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations('Status')

  const statusConfig = {
    [ReportStatus.PENDING]: {
      label: t('PENDING'),
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-500',
    },
    [ReportStatus.IN_PROGRESS]: {
      label: t('IN_PROGRESS'),
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotColor: 'bg-blue-500',
    },
    [ReportStatus.RESOLVED]: {
      label: t('RESOLVED'),
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-500',
    },
    [ReportStatus.REJECTED]: {
      label: t('REJECTED'),
      className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-500',
    },
    [ReportStatus.ARCHIVED]: {
      label: t('ARCHIVED'),
      className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      dotColor: 'bg-slate-500',
    },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 animate-pulse rounded-full', config.dotColor)} />
      {config.label}
    </Badge>
  )
}
