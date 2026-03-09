import { describe, it, expect } from 'vitest'
import { calculateAvgResolutionTime } from '../compliance'

describe('Compliance Utilities', () => {
  describe('calculateAvgResolutionTime', () => {
    it('should return 0 when no reports are provided', () => {
      expect(calculateAvgResolutionTime([])).toBe(0)
    })

    it('should calculate the average time correctly in hours', () => {
      const now = new Date()
      const reports = [
        {
          createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 48h ago
          updatedAt: now,
        },
        {
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24h ago
          updatedAt: now,
        },
      ]

      // (48 + 24) / 2 = 36h
      expect(calculateAvgResolutionTime(reports)).toBe(36)
    })

    it('should round to one decimal place', () => {
      const start = new Date('2024-01-01T10:00:00')
      const end = new Date('2024-01-01T10:45:00') // 45 min = 0.75h
      
      const reports = [{ createdAt: start, updatedAt: end }]
      
      expect(calculateAvgResolutionTime(reports)).toBe(0.8)
    })
  })
})
