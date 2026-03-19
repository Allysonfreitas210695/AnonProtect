import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { z } from 'zod'
import { sendMessageAction } from '@/_actions/public/message.action'

const sendMessageSchema = z.object({
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
})

export function useMessage(reportId: string, code: string) {
  const form = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
    },
  })

  const { execute, isExecuting } = useAction(sendMessageAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
        form.reset()
      } else if (data?.message) {
        toast.error(data.message)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao enviar mensagem')
    },
  })

  function onSubmit(values: z.infer<typeof sendMessageSchema>) {
    execute({
      reportId,
      code,
      content: values.content,
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isExecuting,
  }
}
