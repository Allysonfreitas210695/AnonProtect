'use client'

import { useState } from 'react'
import { getPresignedUrlAction } from '@/_actions/upload/s3.action'
import { toast } from 'sonner'

export function useS3Upload() {
  const [isUploading, setIsUploading] = useState(false)

  async function uploadFiles(files: File[]) {
    setIsUploading(true)
    const uploadedFiles = []

    try {
      for (const file of files) {
        // 1. Get pre-signed URL
        const result = await getPresignedUrlAction({
          fileName: file.name,
          fileType: file.type,
        })

        if (!result?.data?.url) {
          throw new Error('Falha ao gerar URL de upload')
        }

        // 2. Upload to S3
        const response = await fetch(result.data.url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!response.ok) {
          throw new Error(`Falha ao carregar arquivo: ${file.name}`)
        }

        uploadedFiles.push({
          url: result.data.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          type: file.type,
        })
      }
      return uploadedFiles
    } catch (error) {
      console.error(error)
      toast.error('Erro ao fazer upload de arquivos')
      return []
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFiles, isUploading }
}
