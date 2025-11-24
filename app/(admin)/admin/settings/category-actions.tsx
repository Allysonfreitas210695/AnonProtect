'use client'

import { useEffect, useActionState } from 'react'
import { toggleCategory, deleteCategory } from './actions'
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Power, Trash2 } from 'lucide-react'

export function CategoryActions({ id, active, name }: { id: string, active: boolean, name: string }) {
  const [toggleState, toggleAction] = useActionState(toggleCategory, null)
  const [deleteState, deleteAction] = useActionState(deleteCategory, null)
  
  useEffect(() => {
    if (toggleState?.success) {
      toast.success(toggleState.message)
    } else if (toggleState?.message) {
      toast.error(toggleState.message)
    }
  }, [toggleState])

  useEffect(() => {
    if (deleteState?.success) {
      toast.success(deleteState.message)
    } else if (deleteState?.message) {
      toast.error(deleteState.message)
    }
  }, [deleteState])

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
      const formData = new FormData()
      formData.append('id', id)
      deleteAction(formData)
    }
  }

  return (
    <div className="flex gap-2">
      <form action={toggleAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="active" value={String(active)} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
        >
          <Power className="h-4 w-4" />
        </Button>
      </form>
      
      <Button
        onClick={handleDelete}
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
