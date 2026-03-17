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
import { StickyNote, Trash2, Plus } from 'lucide-react'
import { formatCompactDateTime } from '@/_utils/formatters'
import { cn } from '@/_lib/utils'

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
      <Card className="bg-card/40 flex h-[600px] flex-col overflow-hidden shadow-2xl backdrop-blur-xl">
        <CardHeader className="bg-muted/30 px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="text-primary h-5 w-5" />
            {t('internalTitle')}
            <Badge variant="secondary" className="bg-primary/10 text-primary ml-auto border-none">
              {notes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Notes List (Scrollable) */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-6">
            {notes.length === 0 ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted/50 mb-4 rounded-full p-6 shadow-inner">
                  <StickyNote className="h-10 w-10 opacity-20" />
                </div>
                <p className="font-medium">{t('noNotes')}</p>
                <p className="text-sm opacity-60">{t('privateNoteHint')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {notes.map((note) => {
                  const isCurrentUser = currentUser?.id === note.userId
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        'flex max-w-[85%] flex-col transition-all',
                        isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2 px-1">
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-50">
                          {isCurrentUser ? t('you') : (note.author.name ?? t('removedAuthor'))}
                        </span>
                        <span className="text-[10px] opacity-40">
                          {formatCompactDateTime(note.createdAt)}
                        </span>
                      </div>

                      <div
                        className={cn(
                          'group relative rounded-2xl px-4 py-3 shadow-sm transition-all',
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted/50 text-foreground rounded-tl-none backdrop-blur-sm'
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>

                        {(isCurrentUser || currentUser?.role === 'ADMIN') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onClickDelete(note.id)}
                            disabled={isDeleting}
                            className={cn(
                              'bg-background absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100',
                              'text-destructive hover:bg-destructive/10'
                            )}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}

                        {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                          <div className="mt-1 text-[9px] italic opacity-50">
                            {t('editedAt', { date: formatCompactDateTime(note.updatedAt) })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add Note Form (Fixed at bottom) */}
          <div className="bg-muted/30 p-4 lg:p-6">
            <Form {...form}>
              <form onSubmit={onSubmitCreate} className="flex items-end gap-3">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t('addNotePlaceholder')}
                          rows={1}
                          className="bg-background/50 focus-visible:ring-primary/20 max-h-[120px] min-h-[44px] resize-none border-none"
                          disabled={isCreating}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              onSubmitCreate()
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-full"
                  loading={isCreating}
                  disabled={!form.watch('content')}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          </div>
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
            <Button variant="destructive" onClick={handleConfirmDelete} loading={isDeleting}>
              {t(isDeleting ? 'deleting' : 'deleteConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
