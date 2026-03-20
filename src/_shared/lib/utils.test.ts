import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('should handle conditional class names', () => {
    expect(cn('bg-red-500', true && 'text-white', false && 'p-4')).toBe('bg-red-500 text-white')
  })

  it('should resolve tailwind conflicts', () => {
    expect(cn('p-2 p-4')).toBe('p-4')
    expect(cn('px-2 p-4')).toBe('p-4')
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('should handle undefined and null values', () => {
    expect(cn('bg-red-500', undefined, null, 'text-white')).toBe('bg-red-500 text-white')
  })

  it('should handle array of class names', () => {
    expect(cn(['bg-red-500', 'text-white'])).toBe('bg-red-500 text-white')
  })
})
