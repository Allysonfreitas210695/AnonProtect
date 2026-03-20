import { describe, expect, it } from 'vitest'
import { calculateAvgResolutionTime, calculateComplianceRate } from './compliance'

describe('compliance', () => {
  describe('calculateAvgResolutionTime', () => {
    it('should return 0 for empty array', () => {
      expect(calculateAvgResolutionTime([])).toBe(0)
    })

    it('should calculate average resolution time correctly', () => {
      const reports = [
        {
          createdAt: new Date('2024-03-20T10:00:00Z'),
          updatedAt: new Date('2024-03-20T12:00:00Z'), // 2 hours
        },
        {
          createdAt: new Date('2024-03-20T10:00:00Z'),
          updatedAt: new Date('2024-03-20T14:00:00Z'), // 4 hours
        },
      ]
      expect(calculateAvgResolutionTime(reports)).toBe(3)
    })

    it('should round to 1 decimal place', () => {
      const reports = [
        {
          createdAt: new Date('2024-03-20T10:00:00Z'),
          updatedAt: new Date('2024-03-20T10:30:00Z'), // 0.5 hours
        },
        {
          createdAt: new Date('2024-03-20T10:00:00Z'),
          updatedAt: new Date('2024-03-20T11:00:00Z'), // 1.0 hours
        },
        {
          createdAt: new Date('2024-03-20T10:00:00Z'),
          updatedAt: new Date('2024-03-20T11:00:00Z'), // 1.0 hours
        },
      ]
      // Average: (0.5 + 1 + 1) / 3 = 0.833...
      // Rounded: 0.8
      expect(calculateAvgResolutionTime(reports)).toBe(0.8)
    })
  })

  describe('calculateComplianceRate', () => {
    it('should return 0 for empty array', () => {
      expect(calculateComplianceRate([])).toBe(0)
    })

    it('should return 100 if all resolved within 30 days', () => {
      const reports = [
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: new Date('2024-03-15'), // 14 days
        },
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: new Date('2024-03-31'), // 30 days
        },
      ]
      expect(calculateComplianceRate(reports)).toBe(100)
    })

    it('should return 0 if all resolve after 30 days', () => {
      const reports = [
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: new Date('2024-04-01'), // 31 days
        },
      ]
      expect(calculateComplianceRate(reports)).toBe(0)
    })

    it('should return 0 for unresolved reports', () => {
      const reports = [
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: null,
        },
      ]
      expect(calculateComplianceRate(reports)).toBe(0)
    })

    it('should calculate partial compliance correctly', () => {
      const reports = [
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: new Date('2024-03-10'), // Compliant
        },
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: new Date('2024-04-10'), // Non-compliant
        },
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: null, // Non-compliant
        },
        {
          createdAt: new Date('2024-03-01'),
          resolvedAt: new Date('2024-03-20'), // Compliant
        },
      ]
      // 2 compliant out of 4 = 50%
      expect(calculateComplianceRate(reports)).toBe(50)
    })
  })
})
