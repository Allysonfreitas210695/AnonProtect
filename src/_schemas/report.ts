import { z } from 'zod'
import { ReportStatus } from '@/_generated/prisma'
import { Report, Category, Message, User } from '@/_generated/prisma'

export const reportSchema = z.object({
  categoryId: z.uuid('Selecione uma categoria válida'),
  description: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres')
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres'),
  country: z.string().min(1, 'Selecione o país da ocorrência'),
  state: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  number: z.string().optional(),
  turnstileToken: z.string().optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        key: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        type: z.string(),
      })
    )
    .optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de privacidade para continuar',
  }),
  acceptAi: z.boolean().refine((val) => val === true, {
    message: 'Você deve autorizar o processamento por IA para continuar',
  }),
})

export const reportStatusSchema = z.object({
  reportId: z.uuid(),
  status: z.nativeEnum(ReportStatus),
})

export const trackingCodeSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
})

export type ReportInput = z.infer<typeof reportSchema>
export type ReportStatusInput = z.infer<typeof reportStatusSchema>
export type TrackingCodeInput = z.infer<typeof trackingCodeSchema>

export type ReportWithCategory = Report & {
  category: Category | null
}

export type ReportWithMessages = Report & {
  messages: Message[]
  assignedTo?: User | null
}

export type ReportWithRelations = ReportWithMessages
