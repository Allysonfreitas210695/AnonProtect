'use client'

import { useEffect, useActionState, useState } from 'react'
import { InvestigationNote } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Textarea } from '@/app/_components/ui/textarea'
import { Badge } from '@/app/_components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/_components/ui/dialog'
import { createInvestigationNote, deleteInvestigationNote } from '@/app/_actions/investigation'
import { toast } from 'sonner'
import { StickyNote, Trash2, Plus } from 'lucide-react'

interface InvestigationNotesProps {
  reportId: string
  notes: (InvestigationNote & {
    author: {
      id: string
      name: string
      email: string
    }
  })[]
}

export function InvestigationNotes({ reportId, notes }: InvestigationNotesProps) {
  const [createState, createAction] = useActionState(createInvestigationNote, null)
  const [deleteState, deleteAction] = useActionState(deleteInvestigationNote, null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (createState?.success) {
      toast.success(createState.message)
      // Reset form
      const form = document.getElementById('note-form') as HTMLFormElement
      form?.reset()
    } else if (createState?.message) {
      toast.error(createState.message)
    }
  }, [createState])

  useEffect(() => {
    if (deleteState?.success) {
      toast.success(deleteState.message)
      setIsDeleteDialogOpen(false)
      setNoteToDelete(null)
    } else if (deleteState?.message) {
      toast.error(deleteState.message)
    }
  }, [deleteState])

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (noteToDelete) {
      const formData = new FormData()
      formData.append('noteId', noteToDelete)
      formData.append('reportId', reportId)
      deleteAction(formData)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notas de Investigação
            <Badge variant="secondary" className="ml-auto">
              {notes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Note Form */}
          <form id="note-form" action={createAction} className="space-y-4">
            <input type="hidden" name="reportId" value={reportId} />
            <div>
              <Textarea
                name="content"
                placeholder="Adicione uma nota sobre a investigação..."
                rows={4}
                required
                className="resize-none"
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Nota
            </Button>
          </form>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <StickyNote className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Nenhuma nota adicionada ainda.</p>
              <p className="text-sm">Adicione notas privadas sobre a investigação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="space-y-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{note.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(note.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                    <p className="text-xs italic text-muted-foreground">
                      Editado em{' '}
                      {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
