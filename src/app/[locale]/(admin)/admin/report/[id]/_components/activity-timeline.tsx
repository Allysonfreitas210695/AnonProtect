'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { cn } from '@/_shared/lib/utils'
import { getActivityColor, getActivityIcon } from '@/_shared/utils/activity-helpers'
import { formatCompactDateTime } from '@/_shared/utils/formatters'
import { ActivityLog } from '@/_generated/prisma'

interface ActivityTimelineProps {
  activities: (ActivityLog & {
    user: { id: string; name: string | null } | null
  })[]
}
export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const t = useTranslations('Timeline')

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">{t('noActivities')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="bg-border absolute top-0 bottom-0 left-4 w-0.5" />

          {activities.map((activity) => (
            <div key={activity.id} className="relative flex gap-4 pb-4">
              {/* Icon */}
              <div
                className={cn(
                  'ring-background timeline-dot relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-lg ring-4 transition-transform hover:scale-110',
                  getActivityColor(activity.action)
                )}
              >
                {getActivityIcon(activity.action)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium print:text-black">{activity.description}</p>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {formatCompactDateTime(activity.createdAt)}
                  </Badge>
                </div>

                {activity.user ? (
                  <p className="text-muted-foreground text-xs">
                    {t('by', { name: activity.user.name ?? t('system') })}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">{t('by', { name: t('system') })}</p>
                )}

                {activity.metadata && (
                  <div className="bg-muted/50 border-border/50 mt-2 rounded-lg border border-dashed p-3">
                    <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-widest uppercase">
                      {t('additionalData')}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      {Object.entries(JSON.parse(activity.metadata)).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-muted-foreground font-medium print:text-black">
                            {key}
                          </span>
                          <span className="truncate font-mono print:text-black">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
