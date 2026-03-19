import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    inProgress: number
    resolved: number
    avgResolutionTime?: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations('Stats')

  const items = [
    {
      title: t('total'),
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('pending'),
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: t('inProgress'),
      value: stats.inProgress,
      icon: AlertCircle,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
    },
    {
      title: t('resolved'),
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: t('avgResolutionTime'),
      value: t('avgResolutionValue', { count: stats.avgResolutionTime ?? 0 }),
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <Card
          key={item.title}
          className="group bg-card relative overflow-hidden border-none shadow-md transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-muted-foreground group-hover:text-foreground text-[10px] font-black tracking-widest uppercase transition-colors">
              {item.title}
            </CardTitle>
            <div
              className={`${item.bgColor} group-hover:bg-primary/20 rounded-xl p-2.5 shadow-sm transition-all duration-500 group-hover:rotate-12`}
            >
              <item.icon className={`h-4 w-4 transition-transform ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-black tracking-tighter transition-all group-hover:translate-x-1 lg:text-4xl">
              {item.value}
            </div>
          </CardContent>
          <div className="from-primary absolute bottom-0 left-0 h-1.5 w-0 bg-linear-to-r to-transparent opacity-50 blur-[1px] transition-all duration-700 group-hover:w-full" />
        </Card>
      ))}
    </div>
  )
}
