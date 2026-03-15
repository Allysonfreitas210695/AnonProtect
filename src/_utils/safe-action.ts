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
    return e.message
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Sessão expirada ou usuário não autenticado')
  }

  return next({ ctx: { user } })
})

export const adminActionClient = authActionClient.use(async ({ next, ctx: { user } }) => {
  if (user.role !== 'ADMIN') {
    throw new Error('Acesso negado: Requer privilégios de Administrador')
  }

  return next({ ctx: { user } })
})

export const supervisorActionClient = authActionClient.use(async ({ next, ctx: { user } }) => {
  if (user.role !== 'SUPERVISOR' && user.role !== 'ADMIN') {
    throw new Error('Acesso negado: Requer privilégios de Supervisor ou superior')
  }

  return next({ ctx: { user } })
})
