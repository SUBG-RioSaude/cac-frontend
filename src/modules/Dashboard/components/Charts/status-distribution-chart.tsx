/**
 * ==========================================
 * GRÁFICO DE DISTRIBUIÇÃO POR STATUS
 * ==========================================
 * Gráfico pizza/donut mostrando distribuição dos contratos por status
 */

import { PieChart as PieChartIcon } from 'lucide-react'
import { useMemo } from 'react'
import { PieChart, Pie, Cell } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

import { useDashboardCharts } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

interface StatusDistributionChartProps {
  filters: DashboardFilters
  className?: string
}

export const StatusDistributionChart = ({
  filters,
  className,
}: StatusDistributionChartProps) => {
  const { statusDistribution, isLoading, error } = useDashboardCharts(filters)

  // Mapeamento de cores da marca por status
  const statusColorMap: Record<string, string> = {
    Ativo: '#42b9eb', // Azul Claro
    Vigente: '#42b9eb', // Azul Claro
    Vencendo: '#f59e0b', // Laranja (mantém semântica de alerta)
    Vencido: '#ef4444', // Vermelho (mantém semântica crítica)
    Suspenso: '#94a3b8', // Cinza
    Encerrado: '#2a688f', // Azul Escuro
    Indefinido: '#cbd5e1', // Cinza Claro
  }

  // Configuração do gráfico com cores da marca
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {}

    statusDistribution.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: statusColorMap[item.name] || item.color,
      }
    })

    return config
  }, [statusDistribution])

  // Preparar dados para o gráfico com cores da marca
  const chartData = statusDistribution.map((item) => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    fill: statusColorMap[item.name] || item.color,
  }))

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <Card className={className} data-testid="status-distribution-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribuição por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-sm" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className} data-testid="status-distribution-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <PieChartIcon className="h-5 w-5" />
            Distribuição por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
            Erro ao carregar dados do gráfico
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className={className} data-testid="status-distribution-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribuição por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
            Nenhum registro encontrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`${className} flex h-full w-full flex-col`}
      data-testid="status-distribution-chart"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="h-5 w-5 text-brand-primary" />
          Distribuição por Status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <PieChart width={400} height={200}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={`status-cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 text-sm [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
