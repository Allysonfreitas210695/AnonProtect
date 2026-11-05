'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { getPresignedUrlAction } from '@/_actions/upload/s3.action'
import { clientLogger } from '@/_shared/lib/client-logger'
import { ALLOWED_UPLOAD_MIME_TYPES, MAX_UPLOAD_FILE_SIZE } from '@/_schemas/upload'
import { ImageMetadataStripError, stripImageMetadata } from '@/_shared/utils/strip-image-metadata'
import { toast } from 'sonner'

type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number]

function isAllowedUploadMimeType(type: string): type is AllowedUploadMimeType {
  return (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(type)
}

class UploadValidationError extends Error {
  constructor(public readonly messageKey: 'invalidType' | 'fileTooLarge') {
    super(messageKey)
  }
}

export function useS3Upload() {
  const t = useTranslations('Upload')
  const [isUploading, setIsUploading] = useState(false)

  // Retorna null em qualquer falha: o chamador não deve enviar a denúncia sem os anexos escolhidos
  async function uploadFiles(files: File[]) {
    setIsUploading(true)
    const uploadedFiles: {
      url: string
      key: string
      fileSize: number
      type: AllowedUploadMimeType
    }[] = []

    try {
      for (const file of files) {
        if (!isAllowedUploadMimeType(file.type)) {
          throw new UploadValidationError('invalidType')
        }

        const cleanFile = await stripImageMetadata(file)

        if (cleanFile.size > MAX_UPLOAD_FILE_SIZE) {
          throw new UploadValidationError('fileTooLarge')
        }
        if (!isAllowedUploadMimeType(cleanFile.type)) {
          throw new UploadValidationError('invalidType')
        }

        const result = await getPresignedUrlAction({
          fileType: cleanFile.type,
          fileSize: cleanFile.size,
        })

        if (!result?.data?.url) {
          throw new Error('Falha ao gerar URL de upload')
        }

        const response = await fetch(result.data.url, {
          method: 'PUT',
          body: cleanFile,
          headers: {
            'Content-Type': cleanFile.type,
          },
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar arquivo')
        }

        uploadedFiles.push({
          url: result.data.publicUrl,
          key: result.data.key,
          fileSize: cleanFile.size,
          type: cleanFile.type,
        })
      }
      return uploadedFiles
    } catch (error) {
      clientLogger.error(error)
      if (error instanceof ImageMetadataStripError) {
        toast.error(t('metadataStripFailed'))
      } else if (error instanceof UploadValidationError) {
        toast.error(t(error.messageKey))
      } else {
        toast.error(t('uploadFailed'))
      }
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFiles, isUploading }
}
