import { describe, expect, it, vi } from 'vitest'
import { prisma } from '@/_shared/lib/prisma'
import { createDepartment, deleteDepartment } from './department.data'

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    department: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('department.data', () => {
  describe('createDepartment', () => {
    it('should create a department', async () => {
      const data = { name: 'IT' }
      vi.mocked(prisma.department.create).mockResolvedValue({
        id: '1',
        ...data,
      } as unknown as Awaited<ReturnType<typeof prisma.department.create>>)

      const result = await createDepartment(data)

      expect(prisma.department.create).toHaveBeenCalledWith({ data })
      expect(result.name).toBe('IT')
    })
  })

  describe('deleteDepartment', () => {
    it('should delete a department', async () => {
      const id = '1'
      vi.mocked(prisma.department.delete).mockResolvedValue({ id } as unknown as Awaited<
        ReturnType<typeof prisma.department.delete>
      >)

      await deleteDepartment(id)

      expect(prisma.department.delete).toHaveBeenCalledWith({ where: { id } })
    })
  })
})
