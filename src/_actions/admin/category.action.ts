'use server'

import { adminActionClient } from '@/_utils/safe-action'
import * as categoryRepository from '@/_data-access/admin/category.repository'
import { categorySchema } from '@/_schemas/category'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

/**
 * Cria uma nova categoria de denúncia.
 *
 * @param {string} name - Nome da categoria.
 * @param {string} description - Descrição da categoria.
 * @returns {Promise<ActionResult>} Resultado da operação.
 */
export const createCategoryAction = adminActionClient
  .schema(categorySchema)
  .action(async ({ parsedInput: { name, description } }) => {
    // ... existing code
    try {
      await categoryRepository.createCategory({ name, description })
      revalidatePath('/admin/settings')
      return { success: true, message: 'Categoria criada com sucesso' }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        return { success: false, message: 'Esta categoria já existe' }
      }
      return { success: false, message: 'Erro ao criar categoria' }
    }
  })

/**
 * Ativa ou desativa uma categoria.
 *
 * @param {string} id - ID da categoria.
 * @param {boolean} active - Status de ativação desejado.
 * @returns {Promise<ActionResult>} Resultado da operação.
 */
export const toggleCategoryAction = adminActionClient
  .schema(z.object({ id: z.string().uuid(), active: z.boolean() }))
  .action(async ({ parsedInput: { id, active } }) => {
    await categoryRepository.toggleCategory(id, active)
    revalidatePath('/admin/settings')
    return { success: true, message: active ? 'Categoria desativada' : 'Categoria ativada' }
  })

/**
 * Exclui permanentemente uma categoria.
 *
 * @param {string} id - ID da categoria a ser excluída.
 * @returns {Promise<ActionResult>} Resultado da operação.
 */
export const deleteCategoryAction = adminActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id } }) => {
    await categoryRepository.deleteCategory(id)
    revalidatePath('/admin/settings')
    return { success: true, message: 'Categoria excluída com sucesso' }
  })
