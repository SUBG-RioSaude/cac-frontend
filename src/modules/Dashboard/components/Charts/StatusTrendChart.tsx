/**
 * ==========================================
 * GRÁFICO DE TENDÊNCIA DE STATUS
 * ==========================================
 * Gráfico de linha mostrando evolução dos status nos últimos 6 meses
 */

import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

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

interface StatusTrendChartProps {
  filters: DashboardFilters
  className?: string
}

// Configuração das cores para cada status
const chartConfig = {
  ativos: {
    label: 'Ativos',
    color: 'hsl(var(--chart-1))',
  },
  pendentes: {
    label: 'Pendentes',
    color: 'hsl(var(--chart-2))',
  },
  encerrados: {
    label: 'Encerrados',
    color: 'hsl(var(--chart-3))',
  },
  suspensos: {
    label: 'Suspensos',
    color: 'hsl(var(--chart-4))',
  },
}

export const StatusTrendChart = ({
  filters,
  className,
}: StatusTrendChartProps) => {
  const { statusTrend, isLoading, error } = useDashboardCharts(filters)

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <Card className={className} data-testid="status-trend-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendência de Status (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-center gap-4">
              {Object.keys(chartConfig).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-sm" />
                  <Skeleton className="h-4 w-20" />
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
      <Card className={className} data-testid="status-trend-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <TrendingUp className="h-5 w-5" />
            Tendência de Status (6 meses)
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

  if (statusTrend.length === 0) {
    return (
      <Card className={className} data-testid="status-trend-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendência de Status (6 meses)
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
    <Card className={className} data-testid="status-trend-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tendência de Status (6 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={statusTrend}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="ativos"
              type="monotone"
              stroke="var(--color-ativos)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-ativos)',
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="pendentes"
              type="monotone"
              stroke="var(--color-pendentes)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-pendentes)',
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="encerrados"
              type="monotone"
              stroke="var(--color-encerrados)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-encerrados)',
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="suspensos"
              type="monotone"
              stroke="var(--color-suspensos)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-suspensos)',
              }}
              activeDot={{
                r: 6,
              }}
            />
            <ChartLegend
              content={<ChartLegendContent />}
              className="mt-6 flex-wrap justify-center gap-4"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
