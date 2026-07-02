import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Hoist environment variables so the module loads with them
vi.hoisted(() => {
  process.env.AWS_ACCESS_KEY_ID = 'test'
  process.env.AWS_SECRET_ACCESS_KEY = 'test'
  process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
  process.env.AWS_REGION = 'us-east-1'
  process.env.AWS_SES_FROM_EMAIL = 'noreply@test.com'
})

// Now import the module being tested
import { getDownloadUrl, s3Client, sendEmail } from './aws'

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

const { sesSend } = vi.hoisted(() => ({ sesSend: vi.fn() }))

vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn().mockImplementation(function () {
    return { send: sesSend }
  }),
  SendEmailCommand: vi.fn().mockImplementation(function (input) {
    return input
  }),
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

  describe('sendEmail', () => {
    it('should send via SES when configured', async () => {
      sesSend.mockResolvedValue({})

      await sendEmail('a@b.com', 'sub', '<p>x</p>')

      expect(sesSend).toHaveBeenCalledTimes(1)
      const command = sesSend.mock.calls[0][0]
      expect(command).toMatchObject({
        Source: 'noreply@test.com',
        Destination: { ToAddresses: ['a@b.com'] },
        Message: {
          Subject: { Charset: 'UTF-8', Data: 'sub' },
          Body: { Html: { Charset: 'UTF-8', Data: '<p>x</p>' } },
        },
      })
    })

    it('should swallow errors and resolve when SES send rejects', async () => {
      sesSend.mockRejectedValue(new Error('SES down'))

      await expect(sendEmail('a@b.com', 'sub', '<p>x</p>')).resolves.toBeUndefined()
    })

    it('should resolve without throwing when client is configured', async () => {
      sesSend.mockResolvedValue({})

      await expect(sendEmail('c@d.com', 'sub2', '<p>y</p>')).resolves.toBeUndefined()
      expect(sesSend).toHaveBeenCalledTimes(1)
    })
  })
})
