'use client'

import { useMessage } from '@/_hooks/public/use-message'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/_components/ui/form'
import { Loader2 } from 'lucide-react'

interface MessageFormProps {
  reportId: string
  code: string
}

export function MessageForm({ reportId, code }: MessageFormProps) {
  const { form, onSubmit, isExecuting } = useMessage(reportId, code)

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
                  placeholder="Digite sua mensagem..."
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
