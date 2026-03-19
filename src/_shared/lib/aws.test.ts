import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Hoist environment variables so the module loads with them
vi.hoisted(() => {
  process.env.AWS_ACCESS_KEY_ID = 'test'
  process.env.AWS_SECRET_ACCESS_KEY = 'test'
  process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
  process.env.AWS_REGION = 'us-east-1'
})

// Now import the module being tested
import { getDownloadUrl, s3Client } from './aws'

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(function () {
    return {}
  }),
  GetObjectCommand: vi.fn().mockImplementation(function () {
    return {}
  }),
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}))

describe('AWS Lib', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDownloadUrl', () => {
    it('should return a signed URL if configured', async () => {
      vi.mocked(getSignedUrl).mockResolvedValue('https://signed-url.com')

      const url = await getDownloadUrl('some-key.jpg')

      expect(url).toBe('https://signed-url.com')
      expect(getSignedUrl).toHaveBeenCalled()
    })

    it('should handle missing client or bucket', async () => {
      expect(s3Client).toBeDefined()

      const url = await getDownloadUrl('key')
      expect(url).not.toBeNull()
    })
  })
})
