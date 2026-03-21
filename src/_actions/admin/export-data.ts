'use server'

import { getCurrentUser } from '@/_shared/lib/auth'
import { prisma } from '@/_shared/lib/prisma'

export async function exportUserData() {
  const user = await getCurrentUser()

  if (!user?.id) {
    throw new Error('Não autorizado')
  }

  const fullUserData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      accounts: true,
      sessions: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  })

  if (!fullUserData) {
    throw new Error('Usuário não encontrado')
  }

  // Remove campos sensíveis antes do export (como hashes de senha)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeData } = fullUserData

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      system: 'AnonProtect',
      compliance: 'LGPD (Lei 13.709/2018)',
      purpose: 'Portabilidade de Dados (Art. 18, V)',
    },
    data: safeData,
  }
}
