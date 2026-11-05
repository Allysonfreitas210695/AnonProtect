import { z } from 'zod'
import { ReportStatus } from '@/_generated/prisma'
import { Report, Category, Message, User } from '@/_generated/prisma'
import { getBucketHostname } from '@/_shared/lib/aws'
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  EVIDENCE_KEY_REGEX,
  MAX_UPLOAD_FILE_SIZE,
  UPLOAD_MIME_EXTENSIONS,
} from '@/_schemas/upload'

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
      z
        .object({
          url: z
            .string()
            .url()
            .refine(
              (url) => {
                try {
                  return new URL(url).hostname === getBucketHostname()
                } catch {
                  return false
                }
              },
              { message: 'URL de anexo inválida' }
            ),
          key: z.string().regex(EVIDENCE_KEY_REGEX, 'Chave de anexo inválida'),
          fileSize: z
            .number()
            .positive('Tamanho de arquivo inválido')
            .max(MAX_UPLOAD_FILE_SIZE, 'Arquivo excede o tamanho máximo permitido (10MB)'),
          type: z.enum(ALLOWED_UPLOAD_MIME_TYPES, { message: 'Tipo de arquivo não permitido' }),
        })
        .refine((a) => a.key.endsWith(`.${UPLOAD_MIME_EXTENSIONS[a.type]}`), {
          message: 'Extensão do anexo não corresponde ao tipo',
        })
        .refine(
          (a) => {
            try {
              return new URL(a.url).pathname === `/${a.key}`
            } catch {
              return false
            }
          },
          { message: 'URL de anexo não corresponde à chave' }
        )
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
