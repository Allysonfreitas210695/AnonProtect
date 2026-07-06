import { z } from 'zod'

export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024

export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number]

export const uploadSchema = z.object({
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
  fileType: z.enum(ALLOWED_UPLOAD_MIME_TYPES, { message: 'Tipo de arquivo não permitido' }),
  fileSize: z
    .number()
    .positive('Tamanho de arquivo inválido')
    .max(MAX_UPLOAD_FILE_SIZE, 'Arquivo excede o tamanho máximo permitido (10MB)'),
})
