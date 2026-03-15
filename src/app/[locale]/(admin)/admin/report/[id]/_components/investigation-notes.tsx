'use client'

import { useTranslations } from 'next-intl'
import { InvestigationNote } from '@/_generated/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Button } from '@/_components/ui/button'
import { Textarea } from '@/_components/ui/textarea'
import { Badge } from '@/_components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/_components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/_components/ui/dialog'
import { useInvestigationNotes } from '@/_hooks/admin/use-investigation-notes'
import { StickyNote, Trash2, Plus, Loader2 } from 'lucide-react'
import { formatCompactDateTime } from '@/_utils/formatters'

interface AuthUser {
  id: string
  role?: string | null
  name?: string | null
  email?: string | null
}

interface InvestigationNotesProps {
  reportId: string
  notes: (InvestigationNote & {
    author: {
      id: string
      name: string | null
      email: string | null
    }
  })[]
  currentUser?: AuthUser | null
}

export function InvestigationNotes({ reportId, notes, currentUser }: InvestigationNotesProps) {
  const t = useTranslations('Investigation')
  const {
    form,
    onSubmitCreate,
    isCreating,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    onClickDelete,
    handleConfirmDelete,
  } = useInvestigationNotes(reportId)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            {t('title')}
            <Badge variant="secondary" className="ml-auto">
              {notes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Note Form */}
          <Form {...form}>
            <form onSubmit={onSubmitCreate} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('addNotePlaceholder')}
                        rows={4}
                        className="resize-none"
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isCreating ? t('addingNote') : t('addNoteSubmit')}
              </Button>
            </form>
          </Form>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <StickyNote className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>{t('noNotes')}</p>
              <p className="text-sm">{t('privateNoteHint')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="hover:bg-muted/50 space-y-2 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {note.author.name ?? t('removedAuthor')}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatCompactDateTime(note.createdAt)}
                      </p>
                    </div>
                    {(currentUser?.id === note.userId || currentUser?.role === 'ADMIN') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onClickDelete(note.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                    <p className="text-muted-foreground text-xs italic">
                      {t('editedAt', { date: formatCompactDateTime(note.updatedAt) })}
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
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>{t('deleteDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t('deleteCancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? t('deleting') : t('deleteConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
