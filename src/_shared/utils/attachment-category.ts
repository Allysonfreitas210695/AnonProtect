import { AttachmentCategory } from '@/_generated/prisma'

/**
 * Classifica o anexo pelo tipo MIME. O nome do arquivo não é usado porque,
 * desde a anonimização dos anexos, ele é genérico.
 */
export function getAttachmentCategory(mimeType: string | null | undefined): AttachmentCategory {
  const type = (mimeType ?? '').toLowerCase()
  if (type.startsWith('image/')) return AttachmentCategory.PHOTO
  if (type.startsWith('video/')) return AttachmentCategory.VIDEO
  if (type.startsWith('audio/')) return AttachmentCategory.AUDIO
  if (
    type === 'application/pdf' ||
    type === 'application/msword' ||
    type.startsWith('application/vnd.openxmlformats-officedocument') ||
    type.startsWith('text/')
  ) {
    return AttachmentCategory.DOCUMENT
  }
  return AttachmentCategory.OTHER
}

/** Registros antigos foram gravados como OTHER; nesse caso a categoria é derivada do tipo. */
export function resolveAttachmentCategory(attachment: {
  category: AttachmentCategory
  type: string
}): AttachmentCategory {
  return attachment.category === AttachmentCategory.OTHER
    ? getAttachmentCategory(attachment.type)
    : attachment.category
}
