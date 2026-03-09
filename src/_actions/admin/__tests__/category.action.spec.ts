import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toggleCategoryAction, deleteCategoryAction } from '../category.action'
import { revalidatePath } from 'next/cache'
import * as categoryRepository from '@/_data-access/admin/category.repository'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock auth
vi.mock('@/_lib/auth', () => ({
  getCurrentUser: vi.fn(() => Promise.resolve({
    id: 'user-1',
    role: 'ADMIN',
  })),
}))

// Mock repository
vi.mock('@/_data-access/admin/category.repository', () => ({
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
