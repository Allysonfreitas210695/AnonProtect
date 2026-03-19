import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { z } from 'zod'
import { sendAdminReplyAction } from '@/_actions/admin/report.action'

const sendAdminReplySchema = z.object({
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
})

export function useAdminMessage(reportId: string) {
  const form = useForm<z.infer<typeof sendAdminReplySchema>>({
    resolver: zodResolver(sendAdminReplySchema),
    defaultValues: {
      content: '',
    },
  })

  const { execute, isExecuting } = useAction(sendAdminReplyAction, {
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

  function onSubmit(values: z.infer<typeof sendAdminReplySchema>) {
    execute({
      reportId,
      content: values.content,
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isExecuting,
  }
}
