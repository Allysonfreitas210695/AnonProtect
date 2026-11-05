import { createHmac } from 'node:crypto'

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
  logger: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
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

  describe('checkUploadRateLimit', () => {
    it('should return success if ratelimit is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
      const { checkUploadRateLimit } = await import('./ratelimit')

      const result = await checkUploadRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should fail open when Redis is configured but unreachable', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      mockLimit.mockRejectedValue(new Error('fetch failed'))
      const { checkUploadRateLimit } = await import('./ratelimit')

      const result = await checkUploadRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should pass through the result when Redis responds normally', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      const okResult = { success: true, limit: 20, remaining: 15, reset: 789 }
      mockLimit.mockResolvedValue(okResult)
      const { checkUploadRateLimit } = await import('./ratelimit')

      const result = await checkUploadRateLimit('test-ip')

      expect(result).toEqual(okResult)
    })
  })

  describe('checkLoginRateLimit', () => {
    it('should return success if ratelimit is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
      const { checkLoginRateLimit } = await import('./ratelimit')

      const result = await checkLoginRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should fail open when Redis is configured but unreachable', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      mockLimit.mockRejectedValue(new Error('fetch failed'))
      const { checkLoginRateLimit } = await import('./ratelimit')

      const result = await checkLoginRateLimit('test-ip')

      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })

    it('should pass through the result when Redis responds normally', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      const okResult = { success: false, limit: 10, remaining: 0, reset: 321 }
      mockLimit.mockResolvedValue(okResult)
      const { checkLoginRateLimit } = await import('./ratelimit')

      const result = await checkLoginRateLimit('test-ip')

      expect(result).toEqual(okResult)
    })
  })
  describe('hash do identificador', () => {
    const IP = '203.0.113.7'
    const SECRET = 'ab'.repeat(32)
    const names = [
      'checkRateLimit',
      'checkMessageRateLimit',
      'checkUploadRateLimit',
      'checkLoginRateLimit',
      'checkTrackingRateLimit',
    ] as const

    function configureRedis() {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
      mockLimit.mockResolvedValue({ success: true, limit: 1, remaining: 1, reset: 0 })
    }

    it.each(names)('%s passa HMAC hex em vez do IP', async (name) => {
      configureRedis()
      process.env.RATE_LIMIT_SECRET = SECRET
      const mod = await import('./ratelimit')

      await mod[name](IP)

      const expected = createHmac('sha256', Buffer.from(SECRET, 'hex')).update(IP).digest('hex')
      const arg = mockLimit.mock.calls[0][0] as string
      expect(arg).toBe(expected)
      expect(arg).toMatch(/^[0-9a-f]{64}$/)
      expect(arg).not.toContain(IP)
    })

    it('mesmo IP gera mesmo hash e IPs diferentes geram hashes diferentes', async () => {
      configureRedis()
      process.env.RATE_LIMIT_SECRET = SECRET
      const { checkRateLimit } = await import('./ratelimit')

      await checkRateLimit(IP)
      await checkRateLimit(IP)
      await checkRateLimit('198.51.100.9')

      const [a, b, c] = mockLimit.mock.calls.map((x) => x[0])
      expect(a).toBe(b)
      expect(a).not.toBe(c)
    })

    it('sem RATE_LIMIT_SECRET deriva chave de AUTH_SECRET e avisa uma única vez', async () => {
      configureRedis()
      delete process.env.RATE_LIMIT_SECRET
      process.env.AUTH_SECRET = 'auth-secret-test'
      const { logger } = await import('@/_shared/lib/logger')
      vi.mocked(logger.warn).mockClear()
      const { checkRateLimit, checkLoginRateLimit } = await import('./ratelimit')

      await checkRateLimit(IP)
      await checkLoginRateLimit(IP)
      await checkRateLimit(IP)

      const derived = createHmac('sha256', 'auth-secret-test')
        .update('anonprotect-ratelimit-v1')
        .digest()
      const expected = createHmac('sha256', derived).update(IP).digest('hex')
      const direct = createHmac('sha256', 'auth-secret-test').update(IP).digest('hex')
      expect(mockLimit.mock.calls[0][0]).toBe(expected)
      expect(mockLimit.mock.calls[0][0]).not.toBe(direct)
      expect(logger.warn).toHaveBeenCalledTimes(1)
    })

    it.each(['zzzz', 'ab'.repeat(10), 'a'.repeat(63)])(
      'RATE_LIMIT_SECRET invalido (%s) e tratado como ausente',
      async (bad) => {
        configureRedis()
        process.env.RATE_LIMIT_SECRET = bad
        process.env.AUTH_SECRET = 'auth-secret-test'
        const { logger } = await import('@/_shared/lib/logger')
        vi.mocked(logger.warn).mockClear()
        const { checkRateLimit } = await import('./ratelimit')

        await checkRateLimit(IP)

        const derived = createHmac('sha256', 'auth-secret-test')
          .update('anonprotect-ratelimit-v1')
          .digest()
        expect(mockLimit.mock.calls[0][0]).toBe(
          createHmac('sha256', derived).update(IP).digest('hex')
        )
        expect(logger.warn).toHaveBeenCalledTimes(1)
      }
    )

    it('sem nenhum segredo ainda passa hash (nao o IP) e avisa uma vez', async () => {
      configureRedis()
      delete process.env.RATE_LIMIT_SECRET
      delete process.env.AUTH_SECRET
      const { logger } = await import('@/_shared/lib/logger')
      vi.mocked(logger.warn).mockClear()
      const { checkRateLimit } = await import('./ratelimit')

      await checkRateLimit(IP)
      await checkRateLimit(IP)

      const arg = mockLimit.mock.calls[0][0] as string
      expect(arg).toMatch(/^[0-9a-f]{64}$/)
      expect(arg).not.toContain(IP)
      expect(logger.warn).toHaveBeenCalledTimes(1)
    })

    it('cria os 5 limitadores com analytics false', async () => {
      configureRedis()
      const { Ratelimit } = await import('@upstash/ratelimit')
      vi.mocked(Ratelimit).mockClear()
      await import('./ratelimit')

      const calls = vi.mocked(Ratelimit).mock.calls
      expect(calls).toHaveLength(5)
      for (const [opts] of calls) expect(opts.analytics).toBe(false)
    })
  })
})
