import Link from 'next/link'
import { ActivityLog } from '@/_generated/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/_lib/utils'
import { formatCompactDateTime } from '@/_utils/formatters'

import { useTranslations } from 'next-intl'
import { getActivityIcon, getActivityColor } from '@/_utils/activity-helpers'

interface GlobalActivityLogProps {
  activities: (ActivityLog & {
    report: { id: string; trackingCode: string }
    user?: { name: string | null } | null
  })[]
}

export function GlobalActivityLog({ activities }: GlobalActivityLogProps) {
  const t = useTranslations('Dashboard')
  const tT = useTranslations('Timeline')

  return (
    <Card className="ring-border flex flex-col border-none shadow-sm ring-1">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{t('recentActivities')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">{t('noActivities')}</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm',
                    getActivityColor(activity.action)
                  )}
                >
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-none font-medium">{activity.description}</p>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {formatCompactDateTime(activity.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/report/${activity.report.id}`}
                      className="text-primary flex items-center gap-1 text-[11px] font-bold hover:underline"
                    >
                      #{activity.report.trackingCode}
                      <ExternalLink className="h-2 w-2" />
                    </Link>
                    <span className="text-muted-foreground text-[10px]">
                      • {tT('by', { name: activity.user?.name ?? tT('system') })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
