import { prisma } from './prisma'
import { s3Client, sesClient, BUCKET_NAME } from './aws'
import { reportRateLimit } from './ratelimit'

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'unavailable' | 'not_configured'
  message?: string
  latency?: number
}

/**
 * Verifica a conectividade com todos os serviços externos configurados.
 */
export async function getSystemStatus(): Promise<ServiceStatus[]> {
  const statuses: ServiceStatus[] = []

  // 1. Database (Prisma)
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    statuses.push({
      name: 'Database (PostgreSQL)',
      status: 'healthy',
      latency: Date.now() - start,
    })
  } catch (error) {
    statuses.push({
      name: 'Database (PostgreSQL)',
      status: 'unavailable',
      message: error instanceof Error ? error.message : 'Unknown database error',
    })
  }

  // 2. AI (Gemini)
  const hasGemini = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
  statuses.push({
    name: 'AI Analysis (Gemini)',
    status: hasGemini ? 'healthy' : 'not_configured',
    message: hasGemini ? 'Service active' : 'API key missing',
  })

  // 3. Rate Limit (Upstash Redis)
  const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  if (!hasUpstash) {
    statuses.push({
      name: 'Rate Limiting (Upstash)',
      status: 'not_configured',
      message: 'Redis credentials missing',
    })
  } else if (!reportRateLimit) {
    statuses.push({
      name: 'Rate Limiting (Upstash)',
      status: 'degraded',
      message: 'Client failed to initialize',
    })
  } else {
    statuses.push({
      name: 'Rate Limiting (Upstash)',
      status: 'healthy',
      message: 'Service active',
    })
  }

  // 4. Storage (AWS S3)
  const hasAws = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  if (!hasAws) {
    statuses.push({
      name: 'Storage (AWS S3)',
      status: 'not_configured',
      message: 'AWS credentials missing',
    })
  } else if (!s3Client || !BUCKET_NAME) {
    statuses.push({
      name: 'Storage (AWS S3)',
      status: 'degraded',
      message: 'S3 client or bucket not configured',
    })
  } else {
    statuses.push({
      name: 'Storage (AWS S3)',
      status: 'healthy',
      message: `Connected to bucket: ${BUCKET_NAME}`,
    })
  }

  // 5. Email (AWS SES)
  if (!hasAws) {
    statuses.push({
      name: 'Email (AWS SES)',
      status: 'not_configured',
      message: 'AWS credentials missing',
    })
  } else if (!sesClient) {
    statuses.push({
      name: 'Email (AWS SES)',
      status: 'degraded',
      message: 'SES client not configured',
    })
  } else {
    statuses.push({
      name: 'Email (AWS SES)',
      status: 'healthy',
      message: 'Service active',
    })
  }

  // 6. Bot Protection (Turnstile)
  const hasTurnstile = !!(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY
  )
  statuses.push({
    name: 'Bot Protection (Turnstile)',
    status: hasTurnstile ? 'healthy' : 'not_configured',
    message: hasTurnstile ? 'Cloudflare Turnstile configured' : 'Site key or Secret key missing',
  })

  return statuses
}
