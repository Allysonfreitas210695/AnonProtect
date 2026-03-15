'use server'

import { signOut } from '@/_lib/auth'

/**
 * Encerra a sessão do usuário e redireciona para o login.
 */
export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
