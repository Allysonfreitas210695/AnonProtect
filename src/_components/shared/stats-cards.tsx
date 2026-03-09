import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card"
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react"

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
      title: "Total",
      value: stats.total,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Em Andamento",
      value: stats.inProgress,
      icon: AlertCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Resolvidos",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Média Resolução",
      value: `${stats.avgResolutionTime ?? 0}h`,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.title} className="overflow-hidden border-none shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <div className={`${item.bgColor} p-2 rounded-lg`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atualizado em tempo real
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
