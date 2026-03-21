import { z } from 'zod'

export const reportAnalysisSchema = z.object({
  suggestedCategory: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  reasoning: z.string().min(1),
  redactedDescription: z.string().min(1),
})

export type ReportAnalysisSchema = z.infer<typeof reportAnalysisSchema>
