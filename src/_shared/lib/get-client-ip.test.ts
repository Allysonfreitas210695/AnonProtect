import { describe, expect, it } from 'vitest'
import { getClientIp } from './get-client-ip'

describe('getClientIp', () => {
  it('returns cf-connecting-ip when present', () => {
    const hdrs = new Headers({
      'cf-connecting-ip': '1.2.3.4',
      'x-forwarded-for': '5.6.7.8, 9.10.11.12',
    })
    expect(getClientIp(hdrs)).toBe('1.2.3.4')
  })

  it('returns the last IP of x-forwarded-for when cf-connecting-ip is absent', () => {
    const hdrs = new Headers({ 'x-forwarded-for': '5.6.7.8, 9.10.11.12' })
    expect(getClientIp(hdrs)).toBe('9.10.11.12')
  })

  it('trims whitespace from the last x-forwarded-for IP', () => {
    const hdrs = new Headers({ 'x-forwarded-for': '5.6.7.8,   9.10.11.12  ' })
    expect(getClientIp(hdrs)).toBe('9.10.11.12')
  })

  it('falls back to 127.0.0.1 when no headers are present', () => {
    const hdrs = new Headers()
    expect(getClientIp(hdrs)).toBe('127.0.0.1')
  })
})
