import { z } from 'zod'
import { ReportStatus } from '@/_generated/prisma'

export const reportSchema = z.object({
  categoryId: z.string().uuid('Selecione uma categoria válida'),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  turnstileToken: z.string().optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        fileName: z.string(),
        fileSize: z.number(),
        type: z.string(),
      })
    )
    .optional(),
})

export const reportStatusSchema = z.object({
  reportId: z.string().uuid(),
  status: z.nativeEnum(ReportStatus),
})

export const trackingCodeSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
})

export type ReportInput = z.infer<typeof reportSchema>
export type ReportStatusInput = z.infer<typeof reportStatusSchema>
export type TrackingCodeInput = z.infer<typeof trackingCodeSchema>
