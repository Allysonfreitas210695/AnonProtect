import { describe, expect, it } from 'vitest'
import { isValidEmail, isValidTrackingCode, isValidUUID, sanitizeInput } from './validators'

describe('validators', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@domain.com')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test.example.com')).toBe(false)
      expect(isValidEmail('test@example')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidTrackingCode', () => {
    it('should return true for valid AP tracking codes', () => {
      expect(isValidTrackingCode('AP-2026-ABCD-EFGH-JKMN-PQRS')).toBe(true)
      expect(isValidTrackingCode('AP-2026-XY9Z-2345-789A-BCDE')).toBe(true)
      expect(isValidTrackingCode('AP-2099-ZZZZ-ZZZZ-ZZZZ-ZZZZ')).toBe(true)
      expect(isValidTrackingCode('AP-2024-XXXX-XXXX-XXXX-XXXX')).toBe(true)
    })

    it('should return false for invalid tracking codes', () => {
      expect(isValidTrackingCode('RPT-ABC123')).toBe(false)
      expect(isValidTrackingCode('AP-2024-AB12')).toBe(false)
      expect(isValidTrackingCode('AP-2024-ABC')).toBe(false)
      expect(isValidTrackingCode('AP-24-ABCD')).toBe(false)
      expect(isValidTrackingCode('ap-2024-abcd-efgh-jkmn-pqrs')).toBe(false)
      expect(isValidTrackingCode('')).toBe(false)
    })
  })

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true)
    })

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false)
      expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false)
      expect(isValidUUID('')).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello')
    })

    it('should remove < and > characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should handle complex inputs', () => {
      expect(sanitizeInput('  <b>Bold</b>  ')).toBe('bBold/b')
    })
  })
})
