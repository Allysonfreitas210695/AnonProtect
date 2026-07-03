import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockLimit = vi.fn()

vi.mock('@upstash/ratelimit', () => {
  const RatelimitMock = vi.fn().mockImplementation(function () {
    return { limit: mockLimit }
  }) as unknown as { slidingWindow: ReturnType<typeof vi.fn> }
  RatelimitMock.slidingWindow = vi.fn()
  return { Ratelimit: RatelimitMock }
})

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(),
}))

vi.mock('@/_shared/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

describe('ratelimit', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV }
    mockLimit.mockReset()
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('checkRateLimit', () => {
    it('should return success if ratelimit is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
      const { checkRateLimit } = await import('./ratelimit')

      const result = await checkRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should fail open when Redis is configured but unreachable', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      mockLimit.mockRejectedValue(new Error('fetch failed'))
      const { checkRateLimit } = await import('./ratelimit')

      const result = await checkRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should pass through the result when Redis responds normally', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      const okResult = { success: false, limit: 10, remaining: 0, reset: 123 }
      mockLimit.mockResolvedValue(okResult)
      const { checkRateLimit } = await import('./ratelimit')

      const result = await checkRateLimit('test-ip')

      expect(result).toEqual(okResult)
    })
  })

  describe('checkMessageRateLimit', () => {
    it('should return success if ratelimit is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
      const { checkMessageRateLimit } = await import('./ratelimit')

      const result = await checkMessageRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should fail open when Redis is configured but unreachable', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      mockLimit.mockRejectedValue(new Error('fetch failed'))
      const { checkMessageRateLimit } = await import('./ratelimit')

      const result = await checkMessageRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should pass through the result when Redis responds normally', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      const okResult = { success: true, limit: 10, remaining: 5, reset: 456 }
      mockLimit.mockResolvedValue(okResult)
      const { checkMessageRateLimit } = await import('./ratelimit')

      const result = await checkMessageRateLimit('test-ip')

      expect(result).toEqual(okResult)
    })
  })
})
