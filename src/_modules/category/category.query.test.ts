import { describe, expect, it, vi } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { getAllCategories } from './category.query'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
  },
}))

describe('category.query', () => {
  describe('getAllCategories', () => {
    it('should return all categories ordered by name', async () => {
      const mockCategories = [{ name: 'B' }, { name: 'A' }]
      vi.mocked(prisma.category.findMany).mockResolvedValue(
        mockCategories as unknown as Awaited<ReturnType<typeof prisma.category.findMany>>
      )

      const result = await getAllCategories()

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      })
      expect(result).toEqual(mockCategories)
    })
  })
})
