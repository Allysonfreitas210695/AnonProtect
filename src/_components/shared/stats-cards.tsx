import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

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
  const items = [
    {
      title: 'Total',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Em Andamento',
      value: stats.inProgress,
      icon: AlertCircle,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
    },
    {
      title: 'Resolvidos',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Média Resolução',
      value: `${stats.avgResolutionTime ?? 0}h`,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card
          key={item.title}
          className="group bg-card/50 ring-border hover:bg-card hover:ring-primary/20 relative overflow-hidden border-none shadow-sm ring-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-3">
            <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              {item.title}
            </CardTitle>
            <div
              className={`${item.bgColor} group-hover:bg-primary/20 rounded-xl p-2.5 transition-colors duration-300`}
            >
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-3xl font-extrabold tracking-tight">{item.value}</div>
          </CardContent>
          <div className="bg-primary absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full" />
        </Card>
      ))}
    </div>
  )
}
