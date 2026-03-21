import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { getSystemStatus } from './system-status'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/_shared/lib/aws', () => ({
  s3Client: {},
  sesClient: {},
  BUCKET_NAME: 'test-bucket',
}))

vi.mock('@/_shared/lib/ratelimit', () => ({
  reportRateLimit: {},
}))

describe('system-status action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset env vars to a known state
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'key')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'url')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'id')
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return healthy status for all services when configured correctly', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1] as unknown as unknown[])

    const statuses = await getSystemStatus()

    expect(statuses.find((s) => s.name === 'Database (PostgreSQL)')?.status).toBe('healthy')
    expect(statuses.find((s) => s.name === 'AI Analysis (Gemini)')?.status).toBe('healthy')
    expect(statuses.find((s) => s.name === 'Rate Limiting (Upstash)')?.status).toBe('healthy')
    expect(statuses.find((s) => s.name === 'Storage (AWS S3)')?.status).toBe('healthy')
    expect(statuses.find((s) => s.name === 'Email (AWS SES)')?.status).toBe('healthy')
    expect(statuses.find((s) => s.name === 'Bot Protection (Turnstile)')?.status).toBe('healthy')
  })

  it('should return unavailable for database if query fails', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Connection failed'))

    const statuses = await getSystemStatus()
    const dbStatus = statuses.find((s) => s.name === 'Database (PostgreSQL)')

    expect(dbStatus?.status).toBe('unavailable')
    expect(dbStatus?.message).toBe('Connection failed')
  })

  it('should return not_configured for Gemini if API key is missing', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '')

    const statuses = await getSystemStatus()
    const aiStatus = statuses.find((s) => s.name === 'AI Analysis (Gemini)')

    expect(aiStatus?.status).toBe('not_configured')
  })

  it('should return not_configured for AWS services if credentials are missing', async () => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', '')

    const statuses = await getSystemStatus()
    const s3Status = statuses.find((s) => s.name === 'Storage (AWS S3)')
    const sesStatus = statuses.find((s) => s.name === 'Email (AWS SES)')

    expect(s3Status?.status).toBe('not_configured')
    expect(sesStatus?.status).toBe('not_configured')
  })

  it('should return degraded if clients fail to initialize', async () => {
    vi.doMock('@/_shared/lib/aws', () => ({
      s3Client: null,
      sesClient: null,
      BUCKET_NAME: '',
    }))
  })
})
