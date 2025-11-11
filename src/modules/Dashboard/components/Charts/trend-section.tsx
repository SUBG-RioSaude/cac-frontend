/**
 * TrendSection - Gráfico de Tendência dos Contratos
 *
 * Exibe evolução dos contratos nos últimos 6 meses
 * Versão melhorada com ChartContainer e tooltip customizado
 */

import { TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

import type { StatusTrendData } from '../../types/dashboard'

interface TrendSectionProps {
  data?: StatusTrendData[]
  isLoading?: boolean
}

// Configuração de cores do gráfico usando APENAS cores do manual de marca
const chartConfig = {
  ativos: {
    label: 'Ativos',
    color: '#42b9eb', // Azul Claro - Brand Secondary
  },
  pendentes: {
    label: 'Pendentes',
    color: '#2a688f', // Azul Escuro - Brand Primary
  },
  encerrados: {
    label: 'Encerrados',
    color: '#eceded', // Cinza Claro - Brand Gray Light
  },
  suspensos: {
    label: 'Suspensos',
    color: '#2a688f', // Azul Escuro - Brand Primary
  },
}

export const TrendSection = ({ data, isLoading }: TrendSectionProps) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Evolução dos Contratos</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p className="text-sm">Sem dados disponíveis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="text-brand-primary h-5 w-5" />
              Evolução dos Contratos
            </CardTitle>
            <CardDescription className="text-xs">
              Tendência dos últimos 6 meses
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Gradientes suaves para cada área */}
              <linearGradient id="fillAtivos" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ativos)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ativos)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPendentes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-pendentes)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pendentes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillEncerrados" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-encerrados)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-encerrados)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            {/* Áreas empilhadas com animação suave */}
            <Area
              dataKey="ativos"
              type="natural"
              fill="url(#fillAtivos)"
              fillOpacity={0.4}
              stroke="var(--color-ativos)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="pendentes"
              type="natural"
              fill="url(#fillPendentes)"
              fillOpacity={0.4}
              stroke="var(--color-pendentes)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="encerrados"
              type="natural"
              fill="url(#fillEncerrados)"
              fillOpacity={0.4}
              stroke="var(--color-encerrados)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>

        {/* Resumo detalhado com melhor aproveitamento de espaço */}
        {data && data.length > 0 && (
          <div className="bg-muted/30 mt-2 grid grid-cols-3 gap-3 rounded-lg p-3">
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: chartConfig.ativos.color }}
                />
                <span className="text-muted-foreground text-xs font-medium">
                  Ativos
                </span>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: chartConfig.ativos.color }}
              >
                {data[data.length - 1]?.ativos ?? 0}
              </p>
              <p className="text-muted-foreground text-[10px]">
                Contratos vigentes
              </p>
            </div>

            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: chartConfig.pendentes.color }}
                />
                <span className="text-muted-foreground text-xs font-medium">
                  Pendentes
                </span>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: chartConfig.pendentes.color }}
              >
                {data[data.length - 1]?.pendentes ?? 0}
              </p>
              <p className="text-muted-foreground text-[10px]">
                Aguardando aprovação
              </p>
            </div>

            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <div className="bg-muted-foreground/30 h-2.5 w-2.5 rounded-full" />
                <span className="text-muted-foreground text-xs font-medium">
                  Encerrados
                </span>
              </div>
              <p className="text-muted-foreground text-2xl font-bold">
                {data[data.length - 1]?.encerrados ?? 0}
              </p>
              <p className="text-muted-foreground text-[10px]">Finalizados</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
