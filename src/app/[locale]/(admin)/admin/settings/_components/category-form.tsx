'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { createCategoryAction } from '@/_actions/admin/category.action'
import { categorySchema, CategoryInput } from '@/_schemas/category'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Textarea } from '@/_components/ui/textarea'
import { Label } from '@/_components/ui/label'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/_components/ui/form'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'

export function CategoryForm() {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const { execute, isExecuting } = useAction(createCategoryAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message)
        form.reset()
      } else if (data?.message) {
        toast.error(data.message)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Erro ao criar categoria')
    },
  })

  function onSubmit(values: CategoryInput) {
    execute(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="name">Nome da Categoria *</Label>
              <FormControl>
                <Input {...field} id="name" placeholder="Ex: Bullying, Assédio, Violência..." />
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
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <FormControl>
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Breve descrição sobre este tipo de denúncia..."
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
          {isExecuting ? 'Adicionando...' : 'Adicionar Categoria'}
        </Button>
      </form>
    </Form>
  )
}
