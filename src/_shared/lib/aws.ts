import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { logger } from '@/_shared/lib/logger'

const region = process.env.AWS_REGION || 'us-east-1'
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
}

const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY

export const s3Client = hasAwsCredentials
  ? new S3Client({
      region,
      credentials,
    })
  : null

export async function getDownloadUrl(key: string) {
  if (!s3Client || !BUCKET_NAME) return null

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export const sesClient = hasAwsCredentials
  ? new SESClient({
      region,
      credentials,
    })
  : null

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''
export const SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || ''

/**
 * Retorna o hostname virtual-hosted-style do bucket S3 configurado, usado
 * para restringir URLs de anexo ao domínio esperado (evita phishing via
 * URLs externas arbitrárias na galeria de evidências).
 */
export function getBucketHostname() {
  return `${BUCKET_NAME}.s3.${region}.amazonaws.com`
}

export async function sendEmail(to: string, subject: string, htmlBody: string) {
  if (!sesClient || !SES_FROM_EMAIL) {
    logger.warn({ to }, 'SES não configurado — email não enviado')
    return
  }

  try {
    const command = new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: { Html: { Charset: 'UTF-8', Data: htmlBody } },
      },
    })

    await sesClient.send(command)
  } catch (error) {
    logger.error({ to, error }, 'Falha ao enviar email via SES')
  }
}
