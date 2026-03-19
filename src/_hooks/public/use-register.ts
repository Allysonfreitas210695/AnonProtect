import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAction } from 'next-safe-action/hooks'
import { registerAction } from '@/_actions/public/register.action'
import { toast } from 'sonner'
import { registerSchema } from '@/_schemas/auth'
import { useRouter } from 'next/navigation'

export function useRegister() {
  const router = useRouter()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { execute, isExecuting } = useAction(registerAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
        router.push('/login')
      } else if (data?.error) {
        toast.error(data.error)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao criar conta')
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
