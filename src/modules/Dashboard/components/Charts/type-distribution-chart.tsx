/**
 * ==========================================
 * GRÁFICO DE DISTRIBUIÇÃO POR TIPO
 * ==========================================
 * Gráfico de barras horizontais mostrando distribuição por tipo de contrato
 */

import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { CurrencyDisplay } from '@/components/ui/formatters'
import { Skeleton } from '@/components/ui/skeleton'

import { useDashboardCharts } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

interface TypeDistributionChartProps {
  filters: DashboardFilters
  className?: string
}

// Configuração das cores com paleta da marca
const chartConfig = {
  quantidade: {
    label: 'Quantidade',
    color: '#42b9eb', // Azul Claro da marca
  },
  valor: {
    label: 'Valor (R$)',
    color: '#2a688f', // Azul Escuro da marca
  },
}

export const TypeDistributionChart = ({
  filters,
  className,
}: TypeDistributionChartProps) => {
  const { typeDistribution, isLoading, error } = useDashboardCharts(filters)

  // Preparar dados para o gráfico
  const chartData = typeDistribution.map((item) => ({
    tipo: item.tipo,
    quantidade: item.quantidade,
    percentual: item.percentual,
    valor: item.valor,
    valorFormatado: `R$ ${(item.valor / 1000000).toFixed(1)}M`,
  }))

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <Card className={className} data-testid="type-distribution-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-80 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
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
      <Card className={className} data-testid="type-distribution-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-80 items-center justify-center text-sm">
            Erro ao carregar dados do gráfico
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className={className} data-testid="type-distribution-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-80 items-center justify-center text-sm">
            Nenhum registro encontrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`${className} flex h-full w-full flex-col`}
      data-testid="type-distribution-chart"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-brand-primary" />
          Distribuição por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="horizontal"
            width={500}
            height={200}
            margin={{
              left: 70,
              right: 12,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="tipo"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={65}
              tick={{ fontSize: 12 }}
            />
            <XAxis dataKey="quantidade" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload.length > 0) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  const data = payload[0].payload as {
                    tipo: string
                    quantidade: number
                    percentual: number
                    valor: number
                  }
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <div className="grid gap-1">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-[0.70rem] font-semibold uppercase">
                            {data.tipo}
                          </span>
                          <span className="text-foreground text-sm font-bold">
                            {data.quantidade} contratos ({data.percentual.toFixed(1)}%)
                          </span>
                          <span className="text-muted-foreground text-[0.70rem]">
                            <CurrencyDisplay value={data.valor} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="quantidade"
              fill="var(--color-quantidade)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
