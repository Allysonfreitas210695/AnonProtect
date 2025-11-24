'use client'

import { useEffect, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateReportStatus } from '@/app/actions/reports'
import { Button } from "@/app/_components/ui/button"
import { toast } from 'sonner'

export function StatusUpdateForm({ reportId, currentStatus }: { reportId: string, currentStatus: string }) {
  const [state, formAction, isPending] = useActionState(updateReportStatus, null)
  
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
    } else if (state && !state.success) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="flex gap-2 items-center">
      <input type="hidden" name="reportId" value={reportId} />
      <select 
        name="status" 
        defaultValue={currentStatus} 
        className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="PENDING">Pendente</option>
        <option value="IN_PROGRESS">Em Análise</option>
        <option value="RESOLVED">Resolvido</option>
        <option value="REJECTED">Rejeitado</option>
      </select>
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? 'Atualizando...' : 'Atualizar'}
    </Button>
  )
}
