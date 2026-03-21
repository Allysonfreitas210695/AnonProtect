'use server'

import { getCurrentUser, signOut } from '@/_shared/lib/auth'
import { prisma } from '@/_shared/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function anonymizeUser() {
  const user = await getCurrentUser()

  if (!user?.id) {
    throw new Error('Não autorizado')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: 'Usuário Anonimizado (LGPD)',
      email: `anon-${user.id.slice(0, 8)}@anonprotect.local`,
      image: null,
      password: null,
      active: false,
    },
  })
  await signOut()

  return { success: true }
}
