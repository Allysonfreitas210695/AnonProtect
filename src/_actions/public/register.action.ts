'use server'

import { actionClient } from '@/_utils/safe-action'
import { registerSchema } from '@/_schemas/auth'
import { prisma } from '@/_lib/prisma'
import { hash } from 'bcryptjs'

export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput: { name, email, password } }) => {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: 'Este email já está em uso' }
    }

    const hashedPassword = await hash(password, 10)

    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'SUPERVISOR', // Default role
        },
      })

      return { success: true, message: 'Conta criada com sucesso! Faça login.' }
    } catch {
      return { error: 'Erro ao criar conta' }
    }
  })
