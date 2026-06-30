import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAction } from 'next-safe-action/hooks'
import { registerAction } from '@/_actions/public/register.action'
import { toast } from 'sonner'
import { registerSchema } from '@/_schemas/auth'

export function useRegister() {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Registro desabilitado — action sempre lança ActionError
  const { execute, isExecuting } = useAction(registerAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Registro desabilitado')
    },
  })

  function onSubmit(values: z.infer<typeof registerSchema>) {
    execute(values)
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isExecuting,
  }
}
