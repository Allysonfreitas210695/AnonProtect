import { describe, expect, it, vi } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { getAllDepartments } from './department.query'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    department: {
      findMany: vi.fn(),
    },
  },
}))

describe('department.query', () => {
  describe('getAllDepartments', () => {
    it('should return all departments ordered by name', async () => {
      const mockDepartments = [{ name: 'IT' }]
      vi.mocked(prisma.department.findMany).mockResolvedValue(
        mockDepartments as unknown as Awaited<ReturnType<typeof prisma.department.findMany>>
      )

      const result = await getAllDepartments()

      expect(prisma.department.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      })
      expect(result).toEqual(mockDepartments)
    })
  })
})
