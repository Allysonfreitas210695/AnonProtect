'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/_components/ui/card'

interface AdminAnalyticsDashboardProps {
  stats: {
    total: number
    statusStats: { status: string; count: number; percentage: number }[]
    categoryStats: { category: string; count: number }[]
    departmentStats: { departmentId: string; name: string; count: number }[]
    timelineData: { date: string; count: number }[]
    avgResolutionTime: number
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function AdminAnalyticsDashboard({ stats }: AdminAnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/40 ring-border/50 ring-1 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold tracking-wider uppercase">
              Total de Denúncias
            </CardDescription>
            <CardTitle className="text-3xl font-black">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 ring-border/50 ring-1 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold tracking-wider uppercase">
              Média de Resolução
            </CardDescription>
            <CardTitle className="text-3xl font-black">{stats.avgResolutionTime} dias</CardTitle>
          </CardHeader>
        </Card>
        {/* Adicionar mais metrics se necessário */}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline Chart */}
        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Evolução de Denúncias</CardTitle>
            <CardDescription>Volume de denúncias ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Distribuição por Status</CardTitle>
            <CardDescription>Proporção atual de denúncias</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusStats}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {stats.statusStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-4 space-y-2">
              {stats.statusStats.map((s, i) => (
                <div key={s.status} className="flex items-center gap-2 text-xs font-medium">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span>
                    {s.status}: {s.count} ({s.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Stats */}
        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Denúncias por Departamento</CardTitle>
            <CardDescription>Carga de trabalho por setor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentStats} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                    opacity={0.2}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Stats */}
        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Tipos de Ocorrência</CardTitle>
            <CardDescription>Categorias mais frequentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
