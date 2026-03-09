import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAction } from 'next-safe-action/hooks'
import { loginAction } from '@/_actions/public/login.action'
import { toast } from 'sonner'
import { loginSchema } from '@/_schemas/auth'

export function useLogin() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { execute, isExecuting } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      if (data?.error) {
        toast.error(data.error)
      } // Note: O redirecionamento de sucesso é tratado pelo NextAuth internamente na Action
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao realizar login')
    },
  })

  function onSubmit(values: z.infer<typeof loginSchema>) {
    execute(values)
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isExecuting,
  }
}
