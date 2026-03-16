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

export function DashboardDateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

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
      <div className="bg-muted border-border/50 hover:bg-muted/80 flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition-all">
        <Calendar className="text-muted-foreground h-4 w-4" />
      </div>
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="bg-card border-border/50 hover:bg-muted/50 focus:ring-primary/20 w-[180px] rounded-lg font-medium shadow-sm transition-all">
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent className="border-border/50 rounded-xl shadow-xl">
          <SelectItem value="7d" className="focus:bg-primary/10 py-2.5">
            Últimos 7 dias
          </SelectItem>
          <SelectItem value="30d" className="focus:bg-primary/10 py-2.5">
            Últimos 30 dias
          </SelectItem>
          <SelectItem value="90d" className="focus:bg-primary/10 py-2.5">
            Últimos 90 dias
          </SelectItem>
          <SelectItem value="all" className="focus:bg-primary/10 py-2.5">
            Todo o período
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
