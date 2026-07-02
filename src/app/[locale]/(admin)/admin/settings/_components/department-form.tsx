'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { createDepartmentAction } from '@/_actions/admin/department.action'
import { z } from 'zod'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Textarea } from '@/_components/ui/textarea'
import { Label } from '@/_components/ui/label'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/_components/ui/form'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function DepartmentForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  const { execute, isExecuting } = useAction(createDepartmentAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
        form.reset()
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao criar departamento')
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => execute(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>Nome do Departamento *</Label>
              <FormControl>
                <Input {...field} placeholder="Ex: Recursos Humanos, Compliance, TI..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Label>Descrição (Opcional)</Label>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Responsabilidades e escopo deste departamento..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isExecuting} className="w-full">
          {isExecuting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isExecuting ? 'Adicionando...' : 'Adicionar Departamento'}
        </Button>
      </form>
    </Form>
  )
}
