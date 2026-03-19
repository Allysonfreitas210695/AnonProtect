import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { ReportStatusInput, reportStatusSchema } from '@/_schemas/report'
import { updateReportStatusAction } from '@/_actions/admin/report.action'
import { ReportStatus } from '@/_generated/prisma'

export function useReportStatus(reportId: string, currentStatus: ReportStatus) {
  const form = useForm<ReportStatusInput>({
    resolver: zodResolver(reportStatusSchema),
    defaultValues: {
      reportId,
      status: currentStatus,
    },
  })

  const { execute, isExecuting } = useAction(updateReportStatusAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
      } else if (data?.message) {
        toast.error(data.message)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao atualizar status')
    },
  })

  function onSubmit(values: ReportStatusInput) {
    execute(values)
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isExecuting,
  }
}
