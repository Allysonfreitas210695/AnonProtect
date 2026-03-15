'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Department } from '@/_generated/prisma'
import { Button } from '@/_components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/_components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select'
import { Textarea } from '@/_components/ui/textarea'
import { Label } from '@/_components/ui/label'
import { Share2, Loader2 } from 'lucide-react'
import { forwardReportAction } from '@/_actions/admin/report.action'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

export function ForwardReportForm({
  reportId,
  departments,
}: {
  reportId: string
  departments: Department[]
}) {
  const t = useTranslations('Forward')
  const [open, setOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string>('')
  const [description, setDescription] = useState('')

  const { execute, isExecuting } = useAction(forwardReportAction, {
    onSuccess: () => {
      toast.success(t('success'))
      setOpen(false)
      setSelectedDept('')
      setDescription('')
    },
    onError: (error) => {
      toast.error(error.error.serverError || t('error'))
    },
  })

  const handleForward = () => {
    if (!selectedDept) {
      toast.error(t('selectDeptError'))
      return
    }
    if (!description) {
      toast.error(t('reasonError'))
      return
    }

    execute({
      reportId,
      departmentId: selectedDept,
      description,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          {t('submit')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="department">{t('department')}</Label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger id="department">
                <SelectValue placeholder={t('selectDepartment')} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">{t('reason')}</Label>
            <Textarea
              id="reason"
              placeholder={t('reasonPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExecuting}>
            {t('cancel')}
          </Button>
          <Button onClick={handleForward} disabled={isExecuting}>
            {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
