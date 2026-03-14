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
import { REPORT_STATUS, REPORT_TYPES } from '@/_lib/constants'

const STATUS_COLORS = {
  PENDING: 'hsl(var(--warning))',
  IN_PROGRESS: 'hsl(var(--primary))',
  RESOLVED: 'hsl(var(--success))',
  REJECTED: 'hsl(var(--destructive))',
}

interface StatusChartProps {
  data: Array<{ status: string; count: number; percentage: number }>
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = data.map((item) => ({
    name: REPORT_STATUS[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
  }))

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Denúncias por Status</CardTitle>
        <CardDescription>Distribuição atual das denúncias</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }: { name: string; percentage: number }) =>
                `${name}: ${percentage}%`
              }
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}
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

interface CategoryChartProps {
  data: Array<{ category: string; count: number }>
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data
    .map((item) => ({
      name: REPORT_TYPES[item.category] || item.category,
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Denúncias por Categoria</CardTitle>
        <CardDescription>Tipos mais reportados</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              stroke="hsl(var(--foreground))"
            />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TimelineChartProps {
  data: Array<{ date: string; count: number }>
}

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Denúncias ao Longo do Tempo</CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
            <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
