'use client'

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

interface ForwardReportFormProps {
  reportId: string
  departments: Department[]
}

export function ForwardReportForm({ reportId, departments }: ForwardReportFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string>('')
  const [description, setDescription] = useState('')

  const { execute, isExecuting } = useAction(forwardReportAction, {
    onSuccess: () => {
      toast.success('Denúncia encaminhada com sucesso')
      setOpen(false)
      setSelectedDept('')
      setDescription('')
    },
    onError: (error) => {
      toast.error(error.error.serverError || 'Erro ao encaminhar denúncia')
    },
  })

  const handleForward = () => {
    if (!selectedDept) {
      toast.error('Selecione um departamento')
      return
    }
    if (!description) {
      toast.error('Informe uma justificativa')
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
          Encaminhar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encaminhar Denúncia</DialogTitle>
          <DialogDescription>
            Envie esta denúncia para um departamento específico para análise.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Selecione o departamento" />
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
            <Label htmlFor="reason">Justificativa / Observações</Label>
            <Textarea
              id="reason"
              placeholder="Descreva por que está encaminhando esta denúncia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExecuting}>
            Cancelar
          </Button>
          <Button onClick={handleForward} disabled={isExecuting}>
            {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Encaminhar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
