import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCategoryAction, deleteCategoryAction } from '../../_actions/admin/category.action'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock repository
vi.mock('../../_data-access/admin/category.repository', () => ({
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  toggleCategory: vi.fn(),
}))

// Mutable mock for auth
let mockUser: { id: string; role: string; name: string } | null = null

vi.mock('../../_lib/auth', () => ({
  getCurrentUser: vi.fn(() => Promise.resolve(mockUser)),
}))

describe('Role-Based Access Control Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
  })

  describe('ADMIN Persona', () => {
    beforeEach(() => {
      mockUser = { id: 'admin-1', role: 'ADMIN', name: 'Admin User' }
    })

    it('should allow ADMIN to create a category', async () => {
      const input = { name: 'Fraude', description: 'Atividades fraudulentas' }
      const result = await createCategoryAction(input)

      expect(result?.data).toEqual({ success: true, message: 'Categoria criada com sucesso' })
    })

    it('should allow ADMIN to delete a category', async () => {
      const input = { id: '00000000-0000-0000-0000-000000000000' }
      const result = await deleteCategoryAction(input)

      expect(result?.data).toEqual({ success: true, message: 'Categoria excluída com sucesso' })
    })
  })

  describe('SUPERVISOR Persona', () => {
    beforeEach(() => {
      mockUser = { id: 'supervisor-1', role: 'SUPERVISOR', name: 'Supervisor User' }
    })

    it('should block SUPERVISOR from creating a category', async () => {
      const input = { name: 'Fraude', description: 'Atividades fraudulentas' }

      // next-safe-action throws internal errors to handleServerError if not handled in middleware
      // but here it returns validationErrors or serverError
      const result = await createCategoryAction(input)

      expect(result?.serverError).toBe('Acesso negado: Requer privilégios de Administrador')
    })

    it('should block SUPERVISOR from deleting a category', async () => {
      const input = { id: '00000000-0000-0000-0000-000000000000' }
      const result = await deleteCategoryAction(input)

      expect(result?.serverError).toBe('Acesso negado: Requer privilégios de Administrador')
    })
  })

  describe('Unauthenticated Persona', () => {
    beforeEach(() => {
      mockUser = null
    })

    it('should block unauthenticated users from admin actions', async () => {
      const result = await createCategoryAction({ name: 'Test', description: 'Test' })
      expect(result?.serverError).toBe('Sessão expirada ou usuário não autenticado')
    })
  })
})
