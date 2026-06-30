'use server'

import { ActionError, actionClient } from '@/_shared/utils/safe-action'
import { registerSchema } from '@/_schemas/auth'

export const registerAction = actionClient.schema(registerSchema).action(async () => {
  throw new ActionError('Registro desabilitado')
})
