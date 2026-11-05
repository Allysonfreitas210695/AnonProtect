import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPresignedUrlAction } from './s3.action'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { checkUploadRateLimit } from '@/_shared/lib/ratelimit'

vi.mock('@/_shared/lib/aws', () => ({
  s3Client: {},
  BUCKET_NAME: 'test-bucket',
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}))

vi.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}))

vi.mock('@/_shared/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}))

vi.mock('@/_shared/lib/ratelimit', () => ({
  checkUploadRateLimit: vi.fn().mockResolvedValue({
    success: true,
    limit: 20,
    remaining: 19,
    reset: 0,
  }),
}))

vi.mock('@/_shared/utils/safe-action', () => {
  const mockAction =
    (
      schema: {
        safeParse: (input: unknown) => { success: boolean; data?: unknown; error?: unknown }
      },
      fn: (args: { parsedInput: unknown; ctx: { user: { id: string } } }) => Promise<unknown>
    ) =>
    async (input: unknown) => {
      const parsed = schema.safeParse(input)
      if (!parsed.success) {
        return { validationErrors: parsed.error }
      }

      try {
        const result = await fn({ parsedInput: parsed.data, ctx: { user: { id: 'test-user' } } })
        return { data: result }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return { serverError: message }
      }
    }

  return {
    actionClient: {
      schema: (schema: { safeParse: (input: unknown) => { success: boolean } }) => ({
        action: (
          fn: (args: { parsedInput: unknown; ctx: { user: { id: string } } }) => Promise<unknown>
        ) => mockAction(schema, fn),
      }),
    },
    ActionError: class extends Error {},
  }
})

describe('S3 Upload Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.AWS_REGION = 'us-east-1'
    vi.mocked(checkUploadRateLimit).mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: 0,
    })
  })

  it('should generate a presigned URL successfully', async () => {
    const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url'
    vi.mocked(getSignedUrl).mockResolvedValue(mockUrl as never)

    const result = await getPresignedUrlAction({
      fileType: 'image/jpeg',
      fileSize: 1024,
    })

    expect(result?.data).toBeDefined()
    expect(result?.data?.url).toBe(mockUrl)
    expect(result?.data?.key).toMatch(/^evidence\/[0-9a-f-]{36}\.jpg$/)
    expect(result?.data?.key).not.toContain('test')
    expect(result?.data?.publicUrl).toContain('test-bucket.s3.us-east-1.amazonaws.com')
  })

  it.each([
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/gif', 'gif'],
    ['application/pdf', 'pdf'],
  ] as const)('derives the key extension from mime %s', async (fileType, ext) => {
    vi.mocked(getSignedUrl).mockResolvedValue('https://x' as never)
    const result = await getPresignedUrlAction({ fileType, fileSize: 1024 })
    expect(result?.data?.key).toMatch(new RegExp(`^evidence/[0-9a-f-]{36}\\.${ext}$`))
  })

  it('should reject a fileType outside the whitelist', async () => {
    const result = await getPresignedUrlAction({
      fileType: 'application/x-msdownload' as Parameters<
        typeof getPresignedUrlAction
      >[0]['fileType'],
      fileSize: 1024,
    })

    expect(result?.data).toBeUndefined()
    expect(result?.validationErrors).toBeDefined()
  })

  it('should reject a fileSize exceeding the max', async () => {
    const result = await getPresignedUrlAction({
      fileType: 'image/jpeg',
      fileSize: 11 * 1024 * 1024,
    })

    expect(result?.data).toBeUndefined()
    expect(result?.validationErrors).toBeDefined()
  })

  it('should reject when the upload rate limit has been reached', async () => {
    vi.mocked(checkUploadRateLimit).mockResolvedValue({
      success: false,
      limit: 20,
      remaining: 0,
      reset: 0,
    })

    const result = await getPresignedUrlAction({
      fileType: 'image/jpeg',
      fileSize: 1024,
    })

    expect(result?.serverError).toBe('Limite de uploads atingido. Tente novamente mais tarde.')
    expect(getSignedUrl).not.toHaveBeenCalled()
  })
})
