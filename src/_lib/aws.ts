import { S3Client } from '@aws-sdk/client-s3'
import { SESClient } from '@aws-sdk/client-ses'

const region = process.env.AWS_REGION || 'us-east-1'
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  sessionToken: process.env.AWS_SESSION_TOKEN || '',
}

const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY

/**
 * Cliente S3 para armazenamento de evidências (anexos)
 */
export const s3Client = hasAwsCredentials
  ? new S3Client({
      region,
      credentials,
    })
  : null

/**
 * Cliente SES para envio de e-mails de notificação
 */
export const sesClient = hasAwsCredentials
  ? new SESClient({
      region,
      credentials,
    })
  : null

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''
export const SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || ''
