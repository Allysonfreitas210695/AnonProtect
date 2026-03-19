import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPresignedUrlAction } from './s3.action'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

vi.mock('@/_shared/utils/safe-action', () => {
  const mockAction =
    (fn: (args: { parsedInput: unknown; ctx: { user: { id: string } } }) => Promise<unknown>) =>
    async (input: unknown) => {
      try {
        const result = await fn({ parsedInput: input, ctx: { user: { id: 'test-user' } } })
        return { data: result }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return { serverError: message }
      }
    }

  return {
    actionClient: {
      schema: () => ({
        action: mockAction,
      }),
    },
    ActionError: class extends Error {},
  }
})

describe('S3 Upload Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.AWS_REGION = 'us-east-1'
  })

  it('should generate a presigned URL successfully', async () => {
    const mockUrl = 'https://test-bucket.s3.amazonaws.com/presigned-url'
    vi.mocked(getSignedUrl).mockResolvedValue(mockUrl as never)

    const result = await getPresignedUrlAction({
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
    })

    expect(result?.data).toBeDefined()
    expect(result?.data?.url).toBe(mockUrl)
    expect(result?.data?.key).toContain('evidence/')
    expect(result?.data?.key).toContain('test.jpg')
    expect(result?.data?.publicUrl).toContain('test-bucket.s3.us-east-1.amazonaws.com')
  })
})
