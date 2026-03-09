import { createSafeActionClient } from 'next-safe-action'
import { getCurrentUser } from '@/_lib/auth'

export class ActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActionError'
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error('Action error:', e.message)
    return 'Erro interno do servidor'
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Sessão expirada ou usuário não autenticado')
  }

  return next({ ctx: { user } })
})
