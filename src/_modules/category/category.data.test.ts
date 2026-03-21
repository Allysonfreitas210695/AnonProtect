import { describe, expect, it, vi } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { createCategory, deleteCategory, toggleCategory } from './category.data'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    category: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('category.data', () => {
  describe('createCategory', () => {
    it('should create a category', async () => {
      const data = { name: 'Test Category', description: 'Test Description' }
      vi.mocked(prisma.category.create).mockResolvedValue({
        id: '1',
        ...data,
        active: true,
      } as unknown as Awaited<ReturnType<typeof prisma.category.create>>)

      const result = await createCategory(data)

      expect(prisma.category.create).toHaveBeenCalledWith({ data })
      expect(result.name).toBe('Test Category')
    })
  })

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const id = '1'
      vi.mocked(prisma.category.delete).mockResolvedValue({ id } as unknown as Awaited<
        ReturnType<typeof prisma.category.delete>
      >)

      await deleteCategory(id)

      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id } })
    })
  })

  describe('toggleCategory', () => {
    it('should update active status', async () => {
      const id = '1'
      const active = false
      vi.mocked(prisma.category.update).mockResolvedValue({ id, active } as unknown as Awaited<
        ReturnType<typeof prisma.category.update>
      >)

      await toggleCategory(id, active)

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id },
        data: { active },
      })
    })
  })
})
