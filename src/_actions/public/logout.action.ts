'use server'

import { signOut } from '@/_shared/lib/auth'

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
