import { describe, expect, it, vi } from 'vitest'
import { generateTrackingCode } from './tracking'

describe('tracking', () => {
  describe('generateTrackingCode', () => {
    it('should generate a code in the format AP-YYYY-XXXX', () => {
      const code = generateTrackingCode()
      const year = new Date().getFullYear().toString()
      const regex = new RegExp(`^AP-${year}-[A-Z0-9]{4}$`)
      expect(code).toMatch(regex)
    })

    it('should generate unique codes', () => {
      const codes = new Set()
      for (let i = 0; i < 100; i++) {
        codes.add(generateTrackingCode())
      }
      expect(codes.size).toBe(100)
    })

    it('should use the current year', () => {
      vi.useFakeTimers()
      const mockDate = new Date(2025, 0, 1) // Jan 1, 2025
      vi.setSystemTime(mockDate)

      const code = generateTrackingCode()
      expect(code).toContain('AP-2025-')

      vi.useRealTimers()
    })
  })
})
