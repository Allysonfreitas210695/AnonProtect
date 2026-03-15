import { Report, Category, Message, User } from '@/_generated/prisma'

export type ReportWithCategory = Report & {
  category: Category | null
}

export type ReportWithMessages = Report & {
  messages: Message[]
  assignedTo?: User | null
}

export type ReportWithRelations = ReportWithMessages
