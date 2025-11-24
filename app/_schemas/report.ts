import { z } from 'zod'

export const reportSchema = z.object({
  type: z.string().min(1, 'Selecione um tipo de ocorrência'),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
})

export const reportStatusSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
})

export const trackingCodeSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
})

export type ReportInput = z.infer<typeof reportSchema>
export type ReportStatusInput = z.infer<typeof reportStatusSchema>
export type TrackingCodeInput = z.infer<typeof trackingCodeSchema>
