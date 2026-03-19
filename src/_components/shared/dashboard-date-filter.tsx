'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select'
import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function DashboardDateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('Dashboard.filter')

  const currentPeriod = searchParams.get('period') || '30d'

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '30d') {
      params.delete('period') // Default
    } else {
      params.set('period', value)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted hover:bg-muted/80 flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all">
        <Calendar className="text-muted-foreground h-4 w-4" />
      </div>
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="bg-card hover:bg-muted/50 focus:ring-primary/20 w-[180px] rounded-lg border-none font-medium shadow-sm transition-all">
          <SelectValue placeholder={t('placeholder')} />
        </SelectTrigger>
        <SelectContent className="border-border/50 rounded-xl shadow-xl">
          <SelectItem value="7d" className="focus:bg-primary/10 py-2.5">
            {t('last7Days')}
          </SelectItem>
          <SelectItem value="30d" className="focus:bg-primary/10 py-2.5">
            {t('last30Days')}
          </SelectItem>
          <SelectItem value="90d" className="focus:bg-primary/10 py-2.5">
            {t('last90Days')}
          </SelectItem>
          <SelectItem value="all" className="focus:bg-primary/10 py-2.5">
            {t('allTime')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
