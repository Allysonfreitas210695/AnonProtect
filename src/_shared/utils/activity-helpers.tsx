import { ActivityAction } from '@/_generated/prisma'
import {
  FileText,
  MessageSquare,
  UserCheck,
  AlertCircle,
  StickyNote,
  Paperclip,
  CheckCircle2,
} from 'lucide-react'

export function getActivityIcon(action: ActivityAction) {
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

export function getActivityColor(action: ActivityAction) {
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
