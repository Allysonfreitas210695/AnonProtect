'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { deleteDepartmentAction } from '@/_actions/admin/department.action'
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
import { Trash2, Loader2 } from 'lucide-react'

export function DepartmentActions({ id, name }: { id: string; name: string }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { execute: executeDelete, isExecuting: isDeleting } = useAction(deleteDepartmentAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
        setIsDeleteDialogOpen(false)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao excluir departamento')
    },
  })

  return (
    <>
      <Button
        onClick={() => setIsDeleteDialogOpen(true)}
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o departamento <strong>&quot;{name}&quot;</strong>?
              Denúncias vinculadas perderão a associação com este departamento.
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
