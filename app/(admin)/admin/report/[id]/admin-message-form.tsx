'use client'

import { useActionState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendAdminReply } from '@/app/actions/messages'
import { toast } from 'sonner'

interface AdminMessageFormProps {
  reportId: string
}

export function AdminMessageForm({ reportId }: AdminMessageFormProps) {
  const [state, formAction] = useActionState(sendAdminReply, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      // Reset form
      const form = document.querySelector('form') as HTMLFormElement
      form?.reset()
    } else if (state && !state.success) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="reportId" value={reportId} />
      <Input
        type="text"
        name="content"
        placeholder="Responder como Admin..."
        required
        autoComplete="off"
      />
      <Button type="submit">
        Enviar
      </Button>
    </form>
  )
}
