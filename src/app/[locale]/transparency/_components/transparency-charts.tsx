'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { REPORT_STATUS } from '@/_lib/constants'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--info))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
]

interface ChartData {
  name: string
  value: number
}

const STATUS_COLORS = {
  PENDING: 'hsl(var(--warning))',
  IN_PROGRESS: 'hsl(var(--primary))',
  RESOLVED: 'hsl(var(--success))',
  REJECTED: 'hsl(var(--destructive))',
  ARCHIVED: 'hsl(var(--secondary))',
}

export function PublicStatusChart({ data }: { data: ChartData[] }) {
  const chartData = data.map((item) => ({
    name: REPORT_STATUS[item.name] || item.name,
    value: item.value,
    status: item.name,
  }))

  return (
    <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Status das Denúncias</CardTitle>
        <CardDescription>Como estamos processando os relatos recebidos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] ||
                    COLORS[index % COLORS.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PublicCategoryChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Tipos de Ocorrências</CardTitle>
        <CardDescription>Categorias mais frequentes reportadas anonimamente</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PublicTimelineChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Evolução Temporal</CardTitle>
        <CardDescription>Volume de denúncias recebidas nos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
