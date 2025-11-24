'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { REPORT_STATUS, REPORT_TYPES } from '@/app/_lib/constants'

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444',
}

interface StatusChartProps {
  data: Array<{ status: string; count: number; percentage: number }>
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = data.map(item => ({
    name: REPORT_STATUS[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
  }))

  return (
    <Card>
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
              label={({ name, percentage }: any) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} />
              ))}
            </Pie>
            <Tooltip />
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
  const chartData = data.map(item => ({
    name: REPORT_TYPES[item.category] || item.category,
    count: item.count,
  })).sort((a, b) => b.count - a.count)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Denúncias por Categoria</CardTitle>
        <CardDescription>Tipos mais reportados</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
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
    <Card>
      <CardHeader>
        <CardTitle>Denúncias ao Longo do Tempo</CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
