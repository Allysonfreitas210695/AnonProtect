'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { headers } from 'next/headers'
import { s3Client, BUCKET_NAME } from '@/_shared/lib/aws'
import { checkUploadRateLimit } from '@/_shared/lib/ratelimit'
import { getClientIp } from '@/_shared/lib/get-client-ip'
import { logger } from '@/_shared/lib/logger'
import { actionClient } from '@/_shared/utils/safe-action'
import { uploadSchema } from '@/_schemas/upload'

export const getPresignedUrlAction = actionClient
  .schema(uploadSchema)
  .action(async ({ parsedInput: { fileName, fileType } }) => {
    const hdrs = await headers()
    const ip = getClientIp(hdrs)
    const { success: rateLimitOk } = await checkUploadRateLimit(ip)

    if (!rateLimitOk) {
      logger.warn('Limite de uploads atingido')
      throw new Error('Limite de uploads atingido. Tente novamente mais tarde.')
    }

    if (!s3Client) {
      throw new Error('S3 Client not configured')
    }

    const key = `evidence/${Date.now()}-${fileName}`
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return {
      url,
      key,
      publicUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    }
  })
