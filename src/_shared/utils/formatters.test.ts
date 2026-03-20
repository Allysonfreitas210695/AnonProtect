import { describe, expect, it } from 'vitest'
import {
  formatCategory,
  formatCEP,
  formatCompactDateTime,
  formatDate,
  formatDateTime,
  formatStatus,
  formatTime,
  formatTrackingCode,
  truncateText,
} from './formatters'

describe('formatters', () => {
  const testDate = new Date('2024-03-20T15:30:00Z')

  describe('formatDate', () => {
    it('should format date in pt-BR by default', () => {
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('should accept a string date', () => {
      const formatted = formatDate('2024-03-20T15:30:00Z')
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('formatTime', () => {
    it('should format time in pt-BR', () => {
      const formatted = formatTime(testDate)
      expect(formatted).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('formatDateTime', () => {
    it('should combine date and time', () => {
      const formatted = formatDateTime(testDate)
      expect(formatted).toContain(' às ')
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/)
    })
  })

  describe('formatCompactDateTime', () => {
    it('should format in compact style', () => {
      const formatted = formatCompactDateTime(testDate)
      expect(formatted).toBeTruthy()
    })
  })

  describe('formatStatus', () => {
    it('should format known status', () => {
      expect(formatStatus('PENDING')).toBe('Pendente')
      expect(formatStatus('RESOLVED')).toBe('Resolvido')
    })

    it('should return original string for unknown status', () => {
      expect(formatStatus('UNKNOWN')).toBe('UNKNOWN')
    })
  })

  describe('formatCategory', () => {
    it('should format known category', () => {
      expect(formatCategory('BULLYING')).toBe('Bullying')
      expect(formatCategory('VIOLENCE')).toBe('Violência')
    })

    it('should return original string for unknown category', () => {
      expect(formatCategory('UNKNOWN')).toBe('UNKNOWN')
    })
  })

  describe('formatTrackingCode', () => {
    it('should uppercase the code', () => {
      expect(formatTrackingCode('ap-2024-abcd')).toBe('AP-2024-ABCD')
    })
  })

  describe('truncateText', () => {
    it('should not truncate if within limit', () => {
      expect(truncateText('short text', 20)).toBe('short text')
    })

    it('should truncate and add ellipsis', () => {
      expect(truncateText('this is a very long text that should be truncated', 10)).toBe(
        'this is a ...'
      )
    })

    it('should use default limit of 100', () => {
      const longText = 'a'.repeat(110)
      const truncated = truncateText(longText)
      expect(truncated.length).toBe(103) // 100 + 3 dots
      expect(truncated.endsWith('...')).toBe(true)
    })
  })

  describe('formatCEP', () => {
    it('should format valid CEP', () => {
      expect(formatCEP('12345678')).toBe('12345-678')
    })

    it('should remove non-digits', () => {
      expect(formatCEP('12.345-678')).toBe('12345-678')
    })

    it('should handle partial CEP', () => {
      expect(formatCEP('123')).toBe('123')
      expect(formatCEP('12345')).toBe('12345')
      expect(formatCEP('123456')).toBe('12345-6')
    })

    it('should limit to 8 digits', () => {
      expect(formatCEP('1234567890')).toBe('12345-678')
    })
  })
})
