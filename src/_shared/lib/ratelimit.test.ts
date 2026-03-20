import { describe, expect, it, vi } from 'vitest'
import { checkRateLimit } from './ratelimit'

// Mock Upstash
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: {
    slidingWindow: vi.fn(),
  },
}))

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(),
}))

describe('ratelimit', () => {
  describe('checkRateLimit', () => {
    it('should return success if ratelimit is not configured', async () => {
      const result = await checkRateLimit('test-ip')
      expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 })
    })
  })
})
