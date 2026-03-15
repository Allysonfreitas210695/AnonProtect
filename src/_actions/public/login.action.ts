'use server'

import { actionClient } from '@/_utils/safe-action'
import { loginSchema } from '@/_schemas/auth'
import { signIn } from '@/_lib/auth'
import { AuthError } from 'next-auth'

/**
 * Realiza a autenticação do usuário.
 *
 * @param {string} email - E-mail do usuário.
 * @param {string} password - Senha do usuário.
 * @returns {Promise<{ error: string } | void>} Retorna erro se falhar ou nada em caso de sucesso (redirect).
 */
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
            return { error: 'O e-mail ou a senha inserida está incorreta.' }
          case 'AccessDenied':
            return { error: 'Acesso negado. Por favor, verifique suas permissões.' }
          case 'OAuthSignInError':
            return { error: 'Ocorreu um erro ao tentar entrar com o Google.' }
          default:
            return { error: 'Ocorreu um erro inesperado na autenticação.' }
        }
      }

      throw error // Re-throw para o Next.js lidar com redirects
    }
  })
