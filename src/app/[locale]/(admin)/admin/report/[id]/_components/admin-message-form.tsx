'use client'

import { useTranslations } from 'next-intl'
import { useAdminMessage } from '@/_hooks/admin/use-admin-message'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/_components/ui/form'
import { Loader2 } from 'lucide-react'

interface AdminMessageFormProps {
  reportId: string
}

export function AdminMessageForm({ reportId }: AdminMessageFormProps) {
  const t = useTranslations('Communication')
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
                  placeholder={t('placeholder')}
                  autoComplete="off"
                  disabled={isExecuting}
                />
              </FormControl>
              <FormMessage className="absolute -bottom-5" />
            </FormItem>
          )}
        />
        <Button type="submit" loading={isExecuting}>
          {t('submit')}
        </Button>
      </form>
    </Form>
  )
}
