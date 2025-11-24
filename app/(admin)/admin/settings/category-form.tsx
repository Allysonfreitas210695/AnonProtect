'use client'

import { useEffect, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createCategory } from './actions'
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { Label } from "@/app/_components/ui/label"
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function CategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, null)
  
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      // Reset form
      const form = document.getElementById('category-form') as HTMLFormElement
      form?.reset()
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form id="category-form" action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria *</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: Bullying, Assédio, Violência..."
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Breve descrição sobre este tipo de denúncia..."
          rows={3}
        />
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      <Plus className="mr-2 h-4 w-4" />
      {pending ? 'Adicionando...' : 'Adicionar Categoria'}
    </Button>
  )
}
