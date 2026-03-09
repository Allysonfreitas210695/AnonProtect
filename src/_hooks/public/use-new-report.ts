import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { reportSchema, type ReportInput } from '@/_schemas/report'
import { submitReportAction } from '@/_actions/public/report.action'

export function useNewReport() {
  const router = useRouter()

  const form = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: '',
      description: '',
    },
  })

  const { execute, isExecuting } = useAction(submitReportAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.trackingCode) {
        toast.success('Denúncia registrada com sucesso')
        router.push(`/report/success?code=${data.trackingCode}`)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao registrar denúncia')
    },
  })

  function onSubmit(values: ReportInput) {
    execute(values)
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isExecuting,
  }
}
