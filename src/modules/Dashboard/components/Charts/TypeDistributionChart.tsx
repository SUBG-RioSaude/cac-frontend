/**
 * ==========================================
 * GRÁFICO DE DISTRIBUIÇÃO POR TIPO
 * ==========================================
 * Gráfico de barras horizontais mostrando distribuição por tipo de contrato
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { CurrencyDisplay } from '@/components/ui/formatters'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'
import { useDashboardCharts } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

interface TypeDistributionChartProps {
  filters: DashboardFilters
  className?: string
}

// Configuração das cores para cada tipo
const chartConfig = {
  quantidade: {
    label: 'Quantidade',
    color: 'hsl(var(--chart-1))'
  },
  valor: {
    label: 'Valor (R$)',
    color: 'hsl(var(--chart-2))'
  }
}

export function TypeDistributionChart({ filters, className }: TypeDistributionChartProps) {
  const { typeDistribution, isLoading, error } = useDashboardCharts(filters)

  // Preparar dados para o gráfico
  const chartData = typeDistribution.map(item => ({
    tipo: item.tipo,
    quantidade: item.quantidade,
    percentual: item.percentual,
    valor: item.valor,
    valorFormatado: `R$ ${(item.valor / 1000000).toFixed(1)}M`
  }))

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <Card className={className}>
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
              {[1, 2, 3, 4, 5].map(i => (
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
            Erro ao carregar dados do gráfico
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
            Nenhum registro encontrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribuição por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="horizontal"
            margin={{
              left: 80,
            }}
            height={320}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="tipo"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={75}
            />
            <XAxis
              dataKey="quantidade"
              type="number"
              hide
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {data.tipo}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {data.quantidade} contratos ({data.percentual.toFixed(1)}%)
                          </span>
                          <span className="text-[0.70rem] text-muted-foreground">
                            Valor: <CurrencyDisplay value={data.valor} />
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

        {/* Tabela detalhada */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium">Detalhamento por Tipo</h4>
          <div className="space-y-2 text-sm">
            {chartData.map((item) => (
              <div key={item.tipo} className="flex items-center justify-between py-2 border-b border-muted/30">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: 'var(--color-quantidade)' }}
                  />
                  <span className="font-medium">{item.tipo}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {item.quantidade} ({item.percentual.toFixed(1)}%)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <CurrencyDisplay value={item.valor} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}