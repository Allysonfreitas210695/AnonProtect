import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toggleCategoryAction, deleteCategoryAction } from './category.action'
import { revalidatePath } from 'next/cache'
import * as categoryRepository from '@/_modules/category/category.data'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/_shared/utils/safe-action', () => {
  const mockAction =
    (
      fn: (args: {
        parsedInput: unknown
        ctx: { user: { id: string; role: string } }
      }) => Promise<unknown>
    ) =>
    async (input: unknown) => {
      try {
        const result = await fn({
          parsedInput: input,
          ctx: { user: { id: 'user-1', role: 'ADMIN' } },
        })
        return { data: result }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return { serverError: message }
      }
    }

  const clientMock = {
    schema: () => ({
      action: mockAction,
    }),
  }

  return {
    adminActionClient: clientMock,
    ActionError: class extends Error {},
  }
})

vi.mock('@/_shared/lib/auth', () => ({
  getCurrentUser: vi.fn(() =>
    Promise.resolve({
      id: 'user-1',
      role: 'ADMIN',
    })
  ),
}))

// Mock repository
vi.mock('@/_modules/category/category.data', () => ({
  toggleCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

describe('Category Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toggleCategoryAction', () => {
    it('should toggle category active status', async () => {
      const categoryId = 'c7333642-1e74-42f5-9377-df83d284693a'

      const result = await toggleCategoryAction({ id: categoryId, active: false })

      expect(categoryRepository.toggleCategory).toHaveBeenCalledWith(categoryId, false)
      expect(revalidatePath).toHaveBeenCalledWith('/admin/settings')
      expect(result?.data).toEqual({ success: true, message: 'Categoria ativada' })
    })
  })

  describe('deleteCategoryAction', () => {
    it('should delete a category', async () => {
      const categoryId = 'c7333642-1e74-42f5-9377-df83d284693a'

      const result = await deleteCategoryAction({ id: categoryId })

      expect(categoryRepository.deleteCategory).toHaveBeenCalledWith(categoryId)
      expect(revalidatePath).toHaveBeenCalledWith('/admin/settings')
      expect(result?.data).toEqual({ success: true, message: 'Categoria excluída com sucesso' })
    })
  })
})
