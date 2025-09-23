/**
 * ==========================================
 * GRÁFICO DE DISTRIBUIÇÃO POR STATUS
 * ==========================================
 * Gráfico pizza/donut mostrando distribuição dos contratos por status
 */

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
import { PieChart as PieChartIcon } from 'lucide-react'
import { useDashboardCharts } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

interface StatusDistributionChartProps {
  filters: DashboardFilters
  className?: string
}

export function StatusDistributionChart({
  filters,
  className,
}: StatusDistributionChartProps) {
  const { statusDistribution, isLoading, error } = useDashboardCharts(filters)

  // Configuração do gráfico
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {}

    statusDistribution.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.color,
      }
    })

    return config
  }, [statusDistribution])

  // Preparar dados para o gráfico
  const chartData = statusDistribution.map((item) => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    fill: item.color,
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
    <Card className={className} data-testid="status-distribution-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Distribuição por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>

        {/* Estatísticas detalhadas */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: item.fill }}
                />
                <span>{item.name}</span>
              </div>
              <div className="font-medium">
                {item.value} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
