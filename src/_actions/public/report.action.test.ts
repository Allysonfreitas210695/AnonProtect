import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { submitReportAction } from './report.action'
import * as reportData from '@/_modules/report/report.data'
import { triggerAiAnalysis } from './ai-analysis'
import { Report } from '@/_generated/prisma'

// Mock dependencies
vi.mock('@/_modules/report/report.data', () => ({
  createReport: vi.fn(),
  processAiAnalysis: vi.fn(),
}))

vi.mock('@/_shared/utils/tracking', () => ({
  generateTrackingCode: vi.fn(() => 'AP-TEST'),
}))

vi.mock('./ai-analysis', () => ({
  triggerAiAnalysis: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => '127.0.0.1'),
    })
  ),
}))

vi.mock('@/_shared/lib/ratelimit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/_shared/lib/crypto', () => ({
  encrypt: vi.fn((val) => `encrypted-${val}`),
}))

vi.mock('@/_shared/lib/aws', () => ({
  getBucketHostname: () => 'anonprotect-bucket.s3.us-east-1.amazonaws.com',
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe('Public Report Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
  })

  describe('reportSchema attachment url validation', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      vi.resetModules()
      process.env = {
        ...OLD_ENV,
        AWS_S3_BUCKET_NAME: 'anonprotect-bucket',
        AWS_REGION: 'us-east-1',
      }
    })

    afterEach(() => {
      process.env = OLD_ENV
    })

    const baseInput = {
      categoryId: '00000000-0000-0000-0000-000000000000',
      description: 'Test description long enough',
      country: 'Brasil',
      acceptTerms: true,
      acceptAi: true,
    }

    const UUID = '123e4567-e89b-42d3-a456-426614174000'
    const BUCKET = 'https://anonprotect-bucket.s3.us-east-1.amazonaws.com'
    const validAttachment = {
      url: `${BUCKET}/evidence/${UUID}.jpg`,
      key: `evidence/${UUID}.jpg`,
      fileSize: 1234,
      type: 'image/jpeg',
    }

    async function parse(attachment: Record<string, unknown>) {
      const { reportSchema } = await import('@/_schemas/report')
      return reportSchema.safeParse({ ...baseInput, attachments: [attachment] })
    }

    it('accepts an attachment url on the configured S3 bucket host', async () => {
      expect((await parse(validAttachment)).success).toBe(true)
    })

    it('rejects an attachment url on an arbitrary external domain', async () => {
      const result = await parse({ ...validAttachment, url: 'https://evil.com/phish.jpg' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('URL de anexo inválida')
      }
    })

    it('rejects a malformed url', async () => {
      expect((await parse({ ...validAttachment, url: 'not-a-url' })).success).toBe(false)
    })

    it.each([
      'evidence/x.jpg',
      `evidence/../outro/${UUID}.jpg`,
      `${UUID}.jpg`,
      `evidence/${UUID}.exe`,
    ])('rejects invalid attachment key %s', async (key) => {
      const result = await parse({ ...validAttachment, key, url: `${BUCKET}/${key}` })
      expect(result.success).toBe(false)
    })

    it('rejects a key extension that differs from the mime type', async () => {
      const result = await parse({ ...validAttachment, type: 'application/pdf' })
      expect(result.success).toBe(false)
    })

    it('rejects a url whose pathname does not match the key', async () => {
      const result = await parse({
        ...validAttachment,
        url: `${BUCKET}/evidence/00000000-0000-4000-8000-000000000000.jpg`,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('submitReportAction', () => {
    it('should fail if turnstile verification fails', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      } as Response)

      const result = await submitReportAction({
        categoryId: '00000000-0000-0000-0000-000000000000',
        description: 'Test description long enough',
        turnstileToken: 'invalid',
        acceptTerms: true,
        acceptAi: true,
        country: 'Brasil',
      })

      expect(result?.serverError).toBe('Falha na verificação de captcha. Tente novamente.')
    })

    it('should succeed and trigger AI analysis', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      } as Response)

      vi.mocked(reportData.createReport).mockResolvedValue({
        id: 'r1',
        trackingCode: 'AP-TEST',
      } as unknown as Report)

      const result = await submitReportAction({
        categoryId: '00000000-0000-0000-0000-000000000000',
        description: 'Valid test description of sufficient length',
        turnstileToken: 'valid-token',
        acceptTerms: true,
        acceptAi: true,
        country: 'Brasil',
      })

      expect(result.data).toEqual({
        success: true,
        trackingCode: 'AP-TEST',
      })

      expect(reportData.createReport).toHaveBeenCalled()
      expect(triggerAiAnalysis).toHaveBeenCalledWith(
        'r1',
        'Valid test description of sufficient length',
        'Brasil'
      )
    })

    it('stores generic attachment names instead of client-provided names', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      } as Response)
      vi.mocked(reportData.createReport).mockResolvedValue({
        id: 'r1',
        trackingCode: 'AP-TEST',
      } as unknown as Report)

      const bucket = 'https://anonprotect-bucket.s3.us-east-1.amazonaws.com'
      const k1 = 'evidence/123e4567-e89b-42d3-a456-426614174000.jpg'
      const k2 = 'evidence/223e4567-e89b-42d3-a456-426614174000.pdf'

      await submitReportAction({
        categoryId: '00000000-0000-0000-0000-000000000000',
        description: 'Valid test description of sufficient length',
        turnstileToken: 'valid-token',
        acceptTerms: true,
        acceptAi: true,
        country: 'Brasil',
        attachments: [
          { url: `${bucket}/${k1}`, key: k1, fileSize: 10, type: 'image/jpeg' },
          { url: `${bucket}/${k2}`, key: k2, fileSize: 20, type: 'application/pdf' },
        ],
      })

      const call = vi.mocked(reportData.createReport).mock.calls[0]?.[0]
      expect(call?.attachments?.map((a) => a.fileName)).toEqual(['anexo-1.jpg', 'anexo-2.pdf'])
    })
  })
})
