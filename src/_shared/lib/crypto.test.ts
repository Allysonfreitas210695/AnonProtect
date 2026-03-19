import { describe, it, expect, vi } from 'vitest'
import { encrypt, decrypt } from './crypto'

const mockKey = 'f1e2d3c4b5a697887766554433221100f1e2d3c4b5a697887766554433221100'

describe('Crypto Utility', () => {
  it('should encrypt and decrypt text correctly', () => {
    vi.stubEnv('ENCRYPTION_KEY', mockKey)

    const plainText = 'Esta é uma denúncia super secreta e anônima.'
    const encrypted = encrypt(plainText)

    expect(encrypted).toBeDefined()
    expect(encrypted).toContain(':')
    expect(encrypted).not.toBe(plainText)

    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(plainText)
  })

  it('should throw error if ENCRYPTION_KEY is missing or invalid', () => {
    vi.stubEnv('ENCRYPTION_KEY', '')
    expect(() => encrypt('test')).toThrow()

    vi.stubEnv('ENCRYPTION_KEY', 'short-key')
    expect(() => encrypt('test')).toThrow(
      'ENCRYPTION_KEY must be a 32-byte hex string (64 characters)'
    )
  })

  it('should generate different IVs for the same text', () => {
    vi.stubEnv('ENCRYPTION_KEY', mockKey)

    const text = 'Same text'
    const encrypted1 = encrypt(text)
    const encrypted2 = encrypt(text)

    expect(encrypted1).not.toBe(encrypted2)
    expect(decrypt(encrypted1)).toBe(text)
    expect(decrypt(encrypted2)).toBe(text)
  })
})
