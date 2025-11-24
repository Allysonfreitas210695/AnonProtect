import { Report, Message, User, Category } from '@prisma/client'

export type ReportWithMessages = Report & {
  messages: Message[]
  assignedTo?: User | null
}

export type ReportWithRelations = Report & {
  messages: Message[]
  assignedTo?: User | null
}

export type StatusCount = {
  status: string
  count: number
  percentage: number
}

export type CategoryCount = {
  category: string
  count: number
}

export type TimelineData = {
  date: string
  count: number
}

export type ReportStats = {
  total: number
  statusStats: StatusCount[]
  categoryStats: CategoryCount[]
  timelineData: TimelineData[]
}

export type QuickStats = {
  total: number
  pending: number
  inProgress: number
  resolved: number
}

export type ActionResult<T = void> = {
  success: boolean
  message: string
  data?: T
}
