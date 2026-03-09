'use client'

import { useAdminMessage } from '@/_hooks/admin/use-admin-message'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/_components/ui/form'
import { Loader2 } from 'lucide-react'

interface AdminMessageFormProps {
  reportId: string
}

export function AdminMessageForm({ reportId }: AdminMessageFormProps) {
  const { form, onSubmit, isExecuting } = useAdminMessage(reportId)

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex w-full gap-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="relative mb-0 flex-1 space-y-0">
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Responder como Admin..."
                  autoComplete="off"
                  disabled={isExecuting}
                />
              </FormControl>
              <FormMessage className="absolute -bottom-5" />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isExecuting}>
          {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
        </Button>
      </form>
    </Form>
  )
}
