import { ALLOWED_UPLOAD_MIME_TYPES } from '@/_schemas/upload'

export class ImageMetadataStripError extends Error {
  constructor(message = 'Falha ao remover metadados da imagem') {
    super(message)
    this.name = 'ImageMetadataStripError'
  }
}

const REENCODABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Re-codifica via canvas: descarta EXIF/GPS. Nunca devolve o arquivo original em caso de falha.
// GIF e PDF passam direto (limitação documentada).
export async function stripImageMetadata(file: File): Promise<File> {
  if (!REENCODABLE_TYPES.includes(file.type)) return file

  if (typeof createImageBitmap !== 'function') {
    throw new ImageMetadataStripError()
  }

  let bitmap: ImageBitmap | undefined
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new ImageMetadataStripError()
    ctx.drawImage(bitmap, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, file.type, 0.92)
    })
    if (!blob) throw new ImageMetadataStripError()

    // Browser sem encoder WebP devolve PNG: aceitar se o tipo for permitido
    if (!(ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(blob.type)) {
      throw new ImageMetadataStripError()
    }

    return new File([blob], 'anexo', { type: blob.type })
  } catch (error) {
    if (error instanceof ImageMetadataStripError) throw error
    throw new ImageMetadataStripError()
  } finally {
    bitmap?.close()
  }
}
