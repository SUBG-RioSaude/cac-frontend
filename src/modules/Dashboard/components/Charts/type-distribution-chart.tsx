/**
 * ==========================================
 * GRÁFICO DE DISTRIBUIÇÃO POR TIPO - OTIMIZADO
 * ==========================================
 * Gráfico de barras horizontais mostrando distribuição por tipo de contrato
 * Melhorias de Performance: React.memo para evitar re-renders desnecessários
 */

import { BarChart3 } from 'lucide-react'
import { memo } from 'react'
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

const TypeDistributionChartComponent = ({
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
  
  
  console.log(chartData)

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <Card className="flex h-[590px] w-full flex-col" data-testid="type-distribution-chart">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-brand-primary" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0 items-center justify-center">
          <div className="space-y-4 w-full">
            <Skeleton className="h-full w-full flex-1" />
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
      <Card className="flex h-[590px] w-full flex-col" data-testid="type-distribution-chart">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-red-700">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0 items-center justify-center">
          <div className="text-muted-foreground text-sm">
            Erro ao carregar dados do gráfico
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex h-[590px] w-full flex-col" data-testid="type-distribution-chart">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-brand-primary" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0 items-center justify-center">
          <div className="text-muted-foreground text-sm">
            Nenhum registro encontrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`${className} flex h-[590px] w-full flex-col`}
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
            layout="vertical"
            width={800}
            height={520}
            margin={{
              left: 80,
              right: 20,
              top: 20,
              bottom: 20,
            }}
          >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide /> {/* ✅ valores numéricos */}
            <YAxis
              dataKey="tipo"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={65}
              tick={{ fontSize: 12 }}
            />
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
            <Bar dataKey="quantidade" fill="#42b9eb" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// React.memo com comparação personalizada para evitar re-renders desnecessários
export const TypeDistributionChart = memo(
  TypeDistributionChartComponent,
  (prev, next) => {
    // Comparar filtros para decidir se deve re-renderizar
    return JSON.stringify(prev.filters) === JSON.stringify(next.filters)
  },
)
