import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { z } from 'zod'
import { useState } from 'react'
import {
  createInvestigationNoteAction,
  deleteInvestigationNoteAction,
} from '@/_actions/admin/report.action'

const createNoteSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

export function useInvestigationNotes(reportId: string) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  const form = useForm<z.infer<typeof createNoteSchema>>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      content: '',
    },
  })

  // Hook for Creating
  const { execute: executeCreate, isExecuting: isCreating } = useAction(
    createInvestigationNoteAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message)
          form.reset()
        } else if (data?.message) {
          toast.error(data.message)
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Erro ao adicionar nota')
      },
    }
  )

  // Hook for Deleting
  const { execute: executeDelete, isExecuting: isDeleting } = useAction(
    deleteInvestigationNoteAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message)
          setIsDeleteDialogOpen(false)
          setNoteToDelete(null)
        } else if (data?.message) {
          toast.error(data.message)
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Erro ao excluir nota')
      },
    }
  )

  // Submit Handlers
  function onSubmitCreate(values: z.infer<typeof createNoteSchema>) {
    executeCreate({
      reportId,
      content: values.content,
    })
  }

  function onClickDelete(noteId: string) {
    setNoteToDelete(noteId)
    setIsDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (noteToDelete) {
      executeDelete({ noteId: noteToDelete })
    }
  }

  return {
    form,
    onSubmitCreate: form.handleSubmit(onSubmitCreate),
    isCreating,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    onClickDelete,
    handleConfirmDelete,
  }
}
