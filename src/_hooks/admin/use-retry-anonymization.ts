import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { retryAnonymizationAction } from '@/_actions/admin/ai-reanalysis.action'

export function useRetryAnonymization(reportId: string) {
  const { execute, isExecuting } = useAction(retryAnonymizationAction, {
    onSuccess: ({ data }) => {
      if (data?.message) toast.success(data.message)
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao anonimizar denúncia')
    },
  })

  return { retry: () => execute({ reportId }), isExecuting }
}
