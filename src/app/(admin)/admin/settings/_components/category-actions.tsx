'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { toggleCategoryAction, deleteCategoryAction } from '@/_actions/admin/category.action'
import { Button } from '@/_components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/_components/ui/dialog'
import { toast } from 'sonner'
import { Power, Trash2, Loader2 } from 'lucide-react'

export function CategoryActions({
  id,
  active,
  name,
}: {
  id: string
  active: boolean
  name: string
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { execute: executeToggle, isExecuting: isToggling } = useAction(toggleCategoryAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
      } else if (data?.message) {
        toast.error(data.message)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao alterar status da categoria')
    },
  })

  const { execute: executeDelete, isExecuting: isDeleting } = useAction(deleteCategoryAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
        setIsDeleteDialogOpen(false)
      } else if (data?.message) {
        toast.error(data.message)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao excluir categoria')
    },
  })

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => executeToggle({ id, active })}
          variant="outline"
          size="sm"
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}
        </Button>

        <Button
          onClick={() => setIsDeleteDialogOpen(true)}
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a categoria <strong>&quot;{name}&quot;</strong>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => executeDelete({ id })}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
