import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { DashboardData } from '../../types/dashboard'

interface ContractsChartsProps {
  data?: DashboardData
  isLoading?: boolean
  detailed?: boolean
}

export const ContractsCharts = ({
  data,
  isLoading,
  detailed = false,
}: ContractsChartsProps) => {
  // Dados mockados temporários - TODO: substituir por dados reais da API
  const monthlyData = [
    { month: 'Jan', contratos: 98, valor: 1.8, vencimentos: 12 },
    { month: 'Fev', contratos: 112, valor: 2.1, vencimentos: 8 },
    { month: 'Mar', contratos: 125, valor: 2.4, vencimentos: 15 },
    { month: 'Abr', contratos: 108, valor: 2.0, vencimentos: 10 },
    { month: 'Mai', contratos: 142, valor: 2.8, vencimentos: 6 },
    { month: 'Jun', contratos: 156, valor: 3.2, vencimentos: 9 },
    { month: 'Jul', contratos: 134, valor: 2.6, vencimentos: 14 },
    { month: 'Ago', contratos: 148, valor: 2.9, vencimentos: 11 },
    { month: 'Set', contratos: 162, valor: 3.4, vencimentos: 7 },
    { month: 'Out', contratos: 178, valor: 3.8, vencimentos: 13 },
    { month: 'Nov', contratos: 195, valor: 4.2, vencimentos: 9 },
    { month: 'Dez', contratos: 210, valor: 4.6, vencimentos: 5 },
  ]

  const categoryData = data
    ? data.typeDistribution.map((item) => ({
        category: item.tipo,
        count: item.quantidade,
        percentage: item.percentual,
      }))
    : [
        { category: 'Serviços', count: 342, percentage: 38 },
        { category: 'Fornecimento', count: 256, percentage: 28 },
        { category: 'Locação', count: 189, percentage: 21 },
        { category: 'Consultoria', count: 98, percentage: 11 },
        { category: 'Outros', count: 18, percentage: 2 },
      ]

  const statusData = data
    ? data.statusDistribution.map((item) => ({
        status: item.name,
        count: item.value,
      }))
    : [
        { status: 'Ativos', count: 892 },
        { status: 'Pendentes', count: 156 },
        { status: 'Vencidos', count: 47 },
        { status: 'Renovados', count: 189 },
      ]

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card">
            <CardHeader>
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Evolução Mensal */}
      <Card className="bg-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Evolução de Contratos</CardTitle>
          <CardDescription>
            Contratos formalizados e valores nos últimos 12 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorContratos" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="contratos"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorContratos)"
                name="Contratos"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorValor)"
                name="Valor (M)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Contratos por Categoria */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Contratos por Categoria</CardTitle>
          <CardDescription>Distribuição por tipo de contrato</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--chart-3))"
                radius={[0, 8, 8, 0]}
                name="Quantidade"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status dos Contratos */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Status dos Contratos</CardTitle>
          <CardDescription>Distribuição por situação atual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="status"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--chart-4))"
                radius={[8, 8, 0, 0]}
                name="Quantidade"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vencimentos Mensais */}
      {detailed && (
        <Card className="bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Vencimentos por Mês</CardTitle>
            <CardDescription>Contratos com vencimento previsto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vencimentos"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={3}
                  name="Vencimentos"
                  dot={{ fill: 'hsl(var(--chart-5))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
