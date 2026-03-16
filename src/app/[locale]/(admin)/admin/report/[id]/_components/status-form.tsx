'use client'

import { useTranslations } from 'next-intl'
import { useReportStatus } from '@/_hooks/admin/use-report-status'
import { Button } from '@/_components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/_components/ui/form'
import { Loader2 } from 'lucide-react'
import { ReportStatus } from '@/_generated/prisma'

export function StatusUpdateForm({
  reportId,
  currentStatus,
}: {
  reportId: string
  currentStatus: ReportStatus
}) {
  const t = useTranslations('Status')
  const { form, onSubmit, isExecuting } = useReportStatus(reportId, currentStatus)

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="mb-0 space-y-0">
              <FormControl>
                <select
                  {...field}
                  disabled={isExecuting}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="PENDING">{t('PENDING')}</option>
                  <option value="IN_PROGRESS">{t('IN_PROGRESS')}</option>
                  <option value="RESOLVED">{t('RESOLVED')}</option>
                  <option value="REJECTED">{t('REJECTED')}</option>
                  <option value="ARCHIVED">{t('ARCHIVED')}</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" variant="secondary" disabled={isExecuting}>
          {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('update')}
        </Button>
      </form>
    </Form>
  )
}
