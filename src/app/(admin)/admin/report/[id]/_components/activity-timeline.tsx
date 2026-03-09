import { ActivityLog, ActivityAction } from '@/_generated/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import {
  FileText,
  MessageSquare,
  UserCheck,
  AlertCircle,
  StickyNote,
  Paperclip,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/_lib/utils'

interface ActivityTimelineProps {
  activities: (ActivityLog & {
    user: {
      id: string
      name: string | null
    } | null
  })[]
}

function getActivityIcon(action: ActivityAction) {
  switch (action) {
    case ActivityAction.CREATED:
      return <FileText className="h-4 w-4" />
    case ActivityAction.STATUS_CHANGED:
      return <CheckCircle2 className="h-4 w-4" />
    case ActivityAction.ASSIGNED:
      return <UserCheck className="h-4 w-4" />
    case ActivityAction.MESSAGE_SENT:
      return <MessageSquare className="h-4 w-4" />
    case ActivityAction.NOTE_ADDED:
      return <StickyNote className="h-4 w-4" />
    case ActivityAction.EVIDENCE_ADDED:
      return <Paperclip className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

function getActivityColor(action: ActivityAction) {
  switch (action) {
    case ActivityAction.CREATED:
      return 'bg-blue-500'
    case ActivityAction.STATUS_CHANGED:
      return 'bg-green-500'
    case ActivityAction.ASSIGNED:
      return 'bg-purple-500'
    case ActivityAction.MESSAGE_SENT:
      return 'bg-yellow-500'
    case ActivityAction.NOTE_ADDED:
      return 'bg-orange-500'
    case ActivityAction.EVIDENCE_ADDED:
      return 'bg-pink-500'
    default:
      return 'bg-gray-500'
  }
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">
            Nenhuma atividade registrada ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="bg-border absolute top-0 bottom-0 left-4 w-0.5" />

          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4 pb-4">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-9 w-9 items-center justify-center rounded-full shrink-0 text-white shadow-lg ring-4 ring-background transition-transform hover:scale-110 timeline-dot",
                  getActivityColor(activity.action)
                )}
              >
                {getActivityIcon(activity.action)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {new Date(activity.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Badge>
                </div>

                {activity.user && (
                  <p className="text-muted-foreground text-xs">Por: {activity.user.name ?? 'Sistema'}</p>
                )}

                {activity.metadata && (
                  <div className="bg-muted/50 mt-2 rounded-lg border border-dashed border-border/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Dados Adicionais</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      {Object.entries(JSON.parse(activity.metadata)).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-muted-foreground font-medium">{key}</span>
                          <span className="font-mono truncate">{String(value)}</span>
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
