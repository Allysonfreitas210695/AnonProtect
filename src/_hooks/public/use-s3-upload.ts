'use client'

import { useState } from 'react'
import { getPresignedUrlAction } from '@/_actions/upload/s3.action'
import { clientLogger } from '@/_shared/lib/client-logger'
import { ALLOWED_UPLOAD_MIME_TYPES } from '@/_schemas/upload'
import { toast } from 'sonner'

function isAllowedUploadMimeType(type: string): type is (typeof ALLOWED_UPLOAD_MIME_TYPES)[number] {
  return (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(type)
}

export function useS3Upload() {
  const [isUploading, setIsUploading] = useState(false)

  async function stripMetadata(file: File): Promise<File | Blob> {
    if (!file.type.startsWith('image/')) return file

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }))
          } else {
            resolve(file)
          }
        }, file.type)
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  async function uploadFiles(files: File[]) {
    setIsUploading(true)
    const uploadedFiles = []

    try {
      for (const file of files) {
        if (!isAllowedUploadMimeType(file.type)) {
          throw new Error(`Tipo de arquivo não permitido: ${file.name}`)
        }

        const cleanFile = await stripMetadata(file)

        const result = await getPresignedUrlAction({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })

        if (!result?.data?.url) {
          throw new Error('Falha ao gerar URL de upload')
        }

        const response = await fetch(result.data.url, {
          method: 'PUT',
          body: cleanFile,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!response.ok) {
          throw new Error(`Falha ao carregar arquivo: ${file.name}`)
        }

        uploadedFiles.push({
          url: result.data.publicUrl,
          key: result.data.key,
          fileName: file.name,
          fileSize: file.size,
          type: file.type,
        })
      }
      return uploadedFiles
    } catch (error) {
      clientLogger.error(error)
      toast.error('Erro ao fazer upload de arquivos')
      return []
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFiles, isUploading }
}
