'use server'

import { prisma } from '@/app/_lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCategory(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    return { success: false, message: 'Nome é obrigatório' }
  }

  try {
    await prisma.category.create({
      data: {
        name,
        description: description || null,
      },
    })

    revalidatePath('/admin/settings')
    return { success: true, message: 'Categoria criada com sucesso!' }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, message: 'Categoria já existe' }
    }
    console.error('Error creating category:', error)
    return { success: false, message: 'Erro ao criar categoria' }
  }
}

export async function toggleCategory(prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'

  try {
    await prisma.category.update({
      where: { id },
      data: { active: !active },
    })

    revalidatePath('/admin/settings')
    return { success: true, message: active ? 'Categoria desativada' : 'Categoria ativada' }
  } catch (error) {
    console.error('Error toggling category:', error)
    return { success: false, message: 'Erro ao atualizar categoria' }
  }
}

export async function deleteCategory(prevState: any, formData: FormData) {
  const id = formData.get('id') as string

  try {
    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/admin/settings')
    return { success: true, message: 'Categoria excluída' }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, message: 'Erro ao excluir categoria' }
  }
}
