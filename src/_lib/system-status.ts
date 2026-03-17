import { prisma } from './prisma'
import { s3Client, sesClient, BUCKET_NAME } from './aws'
import { reportRateLimit } from './ratelimit'

/**
 * Interface que define o estado de um serviço do sistema.
 */
export interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'unavailable' | 'not_configured'
  message?: string
  latency?: number
}

/**
 * Auxiliar para padronizar a criação de status de serviços.
 */
function createStatus(
  name: string,
  condition: boolean,
  healthyMessage: string,
  error?: string
): ServiceStatus {
  if (!condition) {
    return { name, status: 'not_configured', message: error || 'Configuração ausente' }
  }
  return { name, status: 'healthy', message: healthyMessage }
}

/**
 * Verifica a conectividade com todos os serviços externos configurados.
 * Centraliza a saúde do sistema para o dashboard administrativo.
 */
export async function getSystemStatus(): Promise<ServiceStatus[]> {
  const statuses: ServiceStatus[] = []

  // 1. Banco de Dados (PostgreSQL via Prisma)
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
      message: error instanceof Error ? error.message : 'Erro desconhecido no banco',
    })
  }

  // 2. Inteligência Artificial (Google Gemini)
  statuses.push(
    createStatus(
      'AI Analysis (Gemini)',
      !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      'Serviço ativo',
      'Chave API ausente'
    )
  )

  // 3. Limite de Taxa (Upstash Redis)
  const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  if (!hasUpstash) {
    statuses.push(createStatus('Rate Limiting (Upstash)', false, '', 'Credenciais Redis ausentes'))
  } else {
    statuses.push({
      name: 'Rate Limiting (Upstash)',
      status: reportRateLimit ? 'healthy' : 'degraded',
      message: reportRateLimit ? 'Serviço ativo' : 'Falha ao inicializar cliente',
    })
  }

  // 4. Armazenamento de Arquivos (AWS S3)
  const hasAws = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  if (!hasAws) {
    statuses.push(createStatus('Storage (AWS S3)', false, '', 'Credenciais AWS ausentes'))
  } else {
    statuses.push({
      name: 'Storage (AWS S3)',
      status: s3Client && BUCKET_NAME ? 'healthy' : 'degraded',
      message: BUCKET_NAME ? `Conectado ao bucket: ${BUCKET_NAME}` : 'Bucket não configurado',
    })
  }

  // 5. Envio de E-mail (AWS SES)
  if (!hasAws) {
    statuses.push(createStatus('Email (AWS SES)', false, '', 'Credenciais AWS ausentes'))
  } else {
    statuses.push({
      name: 'Email (AWS SES)',
      status: sesClient ? 'healthy' : 'degraded',
      message: sesClient ? 'Serviço ativo' : 'SES não configurado',
    })
  }

  // 6. Proteção contra Bots (Cloudflare Turnstile)
  const hasTurnstile = !!(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY
  )
  statuses.push(
    createStatus(
      'Bot Protection (Turnstile)',
      hasTurnstile,
      'Configurado corretamente',
      'Chave do site ou segredo ausente'
    )
  )

  return statuses
}
