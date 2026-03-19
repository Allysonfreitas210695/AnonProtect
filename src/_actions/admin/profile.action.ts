'use server'

import { authActionClient } from '@/_shared/utils/safe-action'
import { profileSchema, updatePasswordSchema } from '@/_schemas/auth'
import { prisma } from '@/_shared/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export const updateProfileAction = authActionClient
  .schema(profileSchema)
  .action(async ({ parsedInput: { name, email }, ctx: { user } }) => {
    const userId = user.id

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && existingUser.id !== userId) {
      return { error: 'Este e-mail já está em uso por outro usuário' }
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { name, email },
      })

      revalidatePath('/', 'layout')
      return { success: true, message: 'Perfil atualizado com sucesso!' }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error: 'Erro ao atualizar perfil' }
    }
  })

export const updatePasswordAction = authActionClient
  .schema(updatePasswordSchema)
  .action(async ({ parsedInput: { currentPassword, newPassword }, ctx: { user } }) => {
    const userId = user.id

    const userData = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userData || !userData.password) {
      return { error: 'Usuário não encontrado' }
    }

    const passwordsMatch = await compare(currentPassword, userData.password)

    if (!passwordsMatch) {
      return { error: 'A senha atual está incorreta' }
    }

    const hashedNewPassword = await hash(newPassword, 10)

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      })

      return { success: true, message: 'Senha alterada com sucesso!' }
    } catch (error) {
      console.error('Error updating password:', error)
      return { error: 'Erro ao atualizar senha' }
    }
  })
