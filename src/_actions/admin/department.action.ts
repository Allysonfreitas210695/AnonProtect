'use server'

import { adminActionClient, ActionError } from '@/_shared/utils/safe-action'
import * as departmentRepository from '@/_modules/department/department.data'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const departmentSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
})

export const createDepartmentAction = adminActionClient
  .schema(departmentSchema)
  .action(async ({ parsedInput: { name, description } }) => {
    try {
      await departmentRepository.createDepartment({ name, description })
      revalidatePath('/admin/settings')
      return { success: true, message: 'Departamento criado com sucesso' }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ActionError('Este departamento já existe')
      }
      throw new ActionError('Erro ao criar departamento')
    }
  })

export const deleteDepartmentAction = adminActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      await departmentRepository.deleteDepartment(id)
      revalidatePath('/admin/settings')
      return { success: true, message: 'Departamento excluído com sucesso' }
    } catch {
      throw new ActionError(
        'Erro ao excluir departamento. Verifique se não há denúncias vinculadas.'
      )
    }
  })
