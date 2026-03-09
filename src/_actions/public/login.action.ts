'use server'

import { actionClient } from '@/_utils/safe-action'
import { loginSchema } from '@/_schemas/auth'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      await signIn('credentials', {
        email,
        password,
        redirectTo: '/admin',
      })
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return { error: 'Credenciais inválidas' }
          default:
            return { error: 'Algo deu errado' }
        }
      }

      throw error // Re-throw para o Next.js lidar com redirects
    }
  })
