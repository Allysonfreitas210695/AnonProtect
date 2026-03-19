'use server'

import { adminActionClient } from '@/_shared/utils/safe-action'
import * as categoryRepository from '@/_modules/category/category.data'
import { categorySchema } from '@/_schemas/category'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const createCategoryAction = adminActionClient
  .schema(categorySchema)
  .action(async ({ parsedInput: { name, description } }) => {
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

export const toggleCategoryAction = adminActionClient
  .schema(z.object({ id: z.string().uuid(), active: z.boolean() }))
  .action(async ({ parsedInput: { id, active } }) => {
    await categoryRepository.toggleCategory(id, active)
    revalidatePath('/admin/settings')
    return { success: true, message: active ? 'Categoria desativada' : 'Categoria ativada' }
  })

export const deleteCategoryAction = adminActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id } }) => {
    await categoryRepository.deleteCategory(id)
    revalidatePath('/admin/settings')
    return { success: true, message: 'Categoria excluída com sucesso' }
  })
