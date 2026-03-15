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
      className: 'bg-warning/10 text-warning hover:bg-warning/20',
    },
    [ReportStatus.IN_PROGRESS]: {
      label: t('IN_PROGRESS'),
      className: 'bg-primary/10 text-primary hover:bg-primary/20',
    },
    [ReportStatus.RESOLVED]: {
      label: t('RESOLVED'),
      className: 'bg-success/10 text-success hover:bg-success/20',
    },
    [ReportStatus.REJECTED]: {
      label: t('REJECTED'),
      className: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(config.className, 'border-none font-medium', className)}>
      {config.label}
    </Badge>
  )
}
