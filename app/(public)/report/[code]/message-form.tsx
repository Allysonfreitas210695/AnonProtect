'use client'

import { useActionState } from 'react'
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { sendMessage } from '@/app/actions/messages'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface MessageFormProps {
  reportId: string
  code: string
}

export function MessageForm({ reportId, code }: MessageFormProps) {
  const [state, formAction] = useActionState(sendMessage, null)

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
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="sender" value="USER" />
      <Input
        type="text"
        name="content"
        placeholder="Digite sua mensagem..."
        required
        autoComplete="off"
      />
      <Button type="submit">
        Enviar
      </Button>
    </form>
  )
}
