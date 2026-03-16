'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, BUCKET_NAME } from '@/_lib/aws'
import { actionClient } from '@/_utils/safe-action'
import { z } from 'zod'

const uploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
})

export const getPresignedUrlAction = actionClient
  .schema(uploadSchema)
  .action(async ({ parsedInput: { fileName, fileType } }) => {
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
