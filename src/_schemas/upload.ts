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
  fileType: z.enum(ALLOWED_UPLOAD_MIME_TYPES, { message: 'Tipo de arquivo não permitido' }),
  fileSize: z
    .number()
    .positive('Tamanho de arquivo inválido')
    .max(MAX_UPLOAD_FILE_SIZE, 'Arquivo excede o tamanho máximo permitido (10MB)'),
})

export const UPLOAD_MIME_EXTENSIONS: Record<AllowedUploadMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

// Manter alternância em sincronia com UPLOAD_MIME_EXTENSIONS
export const EVIDENCE_KEY_REGEX =
  /^evidence\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|pdf)$/

// crypto global (Node 20 e navegadores): este arquivo também é importado por código client
export function buildEvidenceKey(mime: AllowedUploadMimeType) {
  return `evidence/${crypto.randomUUID()}.${UPLOAD_MIME_EXTENSIONS[mime]}`
}

export function buildGenericAttachmentName(index: number, mime: AllowedUploadMimeType) {
  return `anexo-${index + 1}.${UPLOAD_MIME_EXTENSIONS[mime]}`
}
