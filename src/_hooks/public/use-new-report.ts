import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { reportSchema, type ReportInput } from '@/_schemas/report'
import { submitReportAction } from '@/_actions/public/report.action'
import { useS3Upload } from '@/_hooks/public/use-s3-upload'

export function useNewReport() {
  const router = useRouter()
  const { uploadFiles, isUploading } = useS3Upload()

  const form = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      categoryId: '',
      description: '',
    },
  })

  const { execute, isExecuting: isSubmitting } = useAction(submitReportAction, {
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

  async function onSubmit(values: ReportInput, files?: File[]) {
    let attachments: { url: string; fileName: string; fileSize: number; type: string }[] = []
    if (files && files.length > 0) {
      attachments = await uploadFiles(files)
    }

    execute({ ...values, attachments })
  }

  return {
    form,
    onSubmit: (files?: File[]) => form.handleSubmit((values) => onSubmit(values, files))(),
    isExecuting: isSubmitting || isUploading,
  }
}
