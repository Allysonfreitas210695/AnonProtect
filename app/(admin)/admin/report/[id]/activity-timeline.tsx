import { ActivityLog } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Badge } from '@/app/_components/ui/badge'
import {
  FileText,
  MessageSquare,
  UserCheck,
  AlertCircle,
  StickyNote,
  Paperclip,
  CheckCircle2,
} from 'lucide-react'

interface ActivityTimelineProps {
  activities: (ActivityLog & {
    user: {
      id: string
      name: string
    } | null
  })[]
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'CREATED':
      return <FileText className="h-4 w-4" />
    case 'STATUS_CHANGED':
      return <CheckCircle2 className="h-4 w-4" />
    case 'ASSIGNED':
      return <UserCheck className="h-4 w-4" />
    case 'MESSAGE_SENT':
      return <MessageSquare className="h-4 w-4" />
    case 'NOTE_ADDED':
      return <StickyNote className="h-4 w-4" />
    case 'EVIDENCE_ADDED':
      return <Paperclip className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

function getActivityColor(action: string) {
  switch (action) {
    case 'CREATED':
      return 'bg-blue-500'
    case 'STATUS_CHANGED':
      return 'bg-green-500'
    case 'ASSIGNED':
      return 'bg-purple-500'
    case 'MESSAGE_SENT':
      return 'bg-yellow-500'
    case 'NOTE_ADDED':
      return 'bg-orange-500'
    case 'EVIDENCE_ADDED':
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
          <p className="py-8 text-center text-muted-foreground">
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
          <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-border" />

          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4 pb-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.action)} shrink-0 text-white`}
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
                  <p className="text-xs text-muted-foreground">Por: {activity.user.name}</p>
                )}

                {activity.metadata && (
                  <div className="mt-2 rounded-md bg-muted p-2">
                    <pre className="overflow-x-auto text-xs">
                      {JSON.stringify(JSON.parse(activity.metadata), null, 2)}
                    </pre>
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
