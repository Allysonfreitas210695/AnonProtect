'use client'

import { useTranslations } from 'next-intl'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/_components/ui/button'
import { useRetryAnonymization } from '@/_hooks/admin/use-retry-anonymization'

export function RetryAnonymizationButton({ reportId }: { reportId: string }) {
  const t = useTranslations('ReportCard')
  const { retry, isExecuting } = useRetryAnonymization(reportId)

  return (
    <Button type="button" variant="outline" size="sm" onClick={retry} disabled={isExecuting}>
      <RefreshCw className={isExecuting ? 'animate-spin' : ''} />
      {isExecuting ? t('retryingAnonymization') : t('retryAnonymization')}
    </Button>
  )
}
