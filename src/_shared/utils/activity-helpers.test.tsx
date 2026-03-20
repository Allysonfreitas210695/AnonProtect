import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActivityAction } from '@/_generated/prisma'
import { getActivityColor, getActivityIcon } from './activity-helpers'

describe('activity-helpers', () => {
  describe('getActivityIcon', () => {
    it('should return a Lucide icon for each action', () => {
      const actions = Object.values(ActivityAction)
      actions.forEach((action) => {
        const icon = getActivityIcon(action as ActivityAction)
        const { container } = render(icon)
        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveClass('lucide')
      })
    })

    it('should return AlertCircle icon for unknown action', () => {
      // @ts-expect-error - testing default case
      const icon = getActivityIcon('UNKNOWN')
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      // Lucide AlertCircle might render as circle-alert in some versions
      expect(
        svg?.classList.contains('lucide-alert-circle') ||
          svg?.classList.contains('lucide-circle-alert')
      ).toBe(true)
    })
  })

  describe('getActivityColor', () => {
    it('should return correct background color class for each action', () => {
      expect(getActivityColor(ActivityAction.CREATED)).toBe('bg-blue-500')
      expect(getActivityColor(ActivityAction.STATUS_CHANGED)).toBe('bg-green-500')
      expect(getActivityColor(ActivityAction.ASSIGNED)).toBe('bg-purple-500')
      expect(getActivityColor(ActivityAction.MESSAGE_SENT)).toBe('bg-yellow-500')
      expect(getActivityColor(ActivityAction.NOTE_ADDED)).toBe('bg-orange-500')
      expect(getActivityColor(ActivityAction.EVIDENCE_ADDED)).toBe('bg-pink-500')
    })

    it('should return gray for unknown action', () => {
      // @ts-expect-error - testing default case
      expect(getActivityColor('UNKNOWN')).toBe('bg-gray-500')
    })
  })
})
