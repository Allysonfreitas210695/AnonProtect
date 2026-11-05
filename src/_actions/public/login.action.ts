'use server'

import { headers } from 'next/headers'
import { actionClient } from '@/_shared/utils/safe-action'
import { loginSchema } from '@/_schemas/auth'
import { signIn } from '@/_shared/lib/auth'
import { checkLoginRateLimit } from '@/_shared/lib/ratelimit'
import { getClientIp } from '@/_shared/lib/get-client-ip'
import { AuthError } from 'next-auth'

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const hdrs = await headers()
    const ip = getClientIp(hdrs)
    const { success: rateLimitOk } = await checkLoginRateLimit(ip)

    if (!rateLimitOk) {
      return { error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
    }

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

      throw error
    }
  })
