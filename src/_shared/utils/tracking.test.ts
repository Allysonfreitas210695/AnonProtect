import { describe, expect, it, vi } from 'vitest'
import { formatCaseNumber, generateTrackingCode, hashTrackingCode } from './tracking'

describe('tracking', () => {
  describe('generateTrackingCode', () => {
    it('should generate a code in the format AP-YYYY-XXXX-XXXX-XXXX-XXXX', () => {
      const code = generateTrackingCode()
      const year = new Date().getFullYear().toString()
      const regex = new RegExp(`^AP-${year}-[2-9A-HJ-NP-Z]{4}(-[2-9A-HJ-NP-Z]{4}){3}$`)
      expect(code).toMatch(regex)
    })

    it('should not contain ambiguous characters (0, 1, I, L, O)', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateTrackingCode()
        const randomPart = code.split('-').slice(2).join('')
        expect(randomPart).not.toMatch(/[01ILO]/)
      }
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

  describe('hashTrackingCode', () => {
    it('gera o SHA-256 em hexadecimal, igual ao encode(sha256(...), hex) da migration', () => {
      // echo -n 'AP-2026-ABCD-EFGH-JKMN-PQRS' | sha256sum
      expect(hashTrackingCode('AP-2026-ABCD-EFGH-JKMN-PQRS')).toBe(
        '662d3fa55afa7b457e77ac1b8befeefd52890ab94c2230cbd2891089a2b50ce8'
      )
    })

    it('ignora espaços e letras minúsculas no código digitado', () => {
      expect(hashTrackingCode('  ap-2026-abcd-efgh-jkmn-pqrs ')).toBe(
        hashTrackingCode('AP-2026-ABCD-EFGH-JKMN-PQRS')
      )
    })

    it('não contém o código em claro', () => {
      const code = generateTrackingCode()
      expect(hashTrackingCode(code)).not.toContain(code)
      expect(hashTrackingCode(code)).toMatch(/^[0-9a-f]{64}$/)
    })
  })

  describe('formatCaseNumber', () => {
    it('preenche com zeros à esquerda', () => {
      expect(formatCaseNumber(42)).toBe('000042')
      expect(formatCaseNumber(1234567)).toBe('1234567')
    })
  })
})
