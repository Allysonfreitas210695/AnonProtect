'use client'

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
                  <option value="PENDING">Pendente</option>
                  <option value="IN_PROGRESS">Em Análise</option>
                  <option value="RESOLVED">Resolvido</option>
                  <option value="REJECTED">Rejeitado</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" variant="secondary" disabled={isExecuting}>
          {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
        </Button>
      </form>
    </Form>
  )
}
