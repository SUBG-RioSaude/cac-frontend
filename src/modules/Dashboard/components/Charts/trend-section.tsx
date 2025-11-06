/**
 * TrendSection - Gráfico de Tendência dos Contratos
 *
 * Exibe evolução dos contratos nos últimos 6 meses
 * Slide 2 do carousel do dashboard
 */

import { TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { StatusTrendData } from '../../types/dashboard'
import { CHART_COLORS } from '../../utils/chart-colors'

interface TrendSectionProps {
  data?: StatusTrendData[]
  isLoading?: boolean
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2a688f]" />
              Evolução dos Contratos
            </CardTitle>
            <CardDescription>
              Tendência dos últimos 6 meses por status
            </CardDescription>
          </div>

          {/* Legenda compacta */}
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS.chart2 }}
              />
              <span>Ativos</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: '#f59e0b' }}
              />
              <span>Pendentes</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: '#6b7280' }}
              />
              <span>Encerrados</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Gradiente para Ativos */}
              <linearGradient id="colorAtivos" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={CHART_COLORS.chart2}
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor={CHART_COLORS.chart2}
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Gradiente para Pendentes */}
              <linearGradient id="colorPendentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>

              {/* Gradiente para Encerrados */}
              <linearGradient id="colorEncerrados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7280" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6b7280" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toString()}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            />

            {/* Áreas empilhadas */}
            <Area
              type="monotone"
              dataKey="ativos"
              stackId="1"
              stroke={CHART_COLORS.chart2}
              strokeWidth={2}
              fill="url(#colorAtivos)"
              name="Ativos"
            />

            <Area
              type="monotone"
              dataKey="pendentes"
              stackId="1"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#colorPendentes)"
              name="Pendentes"
            />

            <Area
              type="monotone"
              dataKey="encerrados"
              stackId="1"
              stroke="#6b7280"
              strokeWidth={1.5}
              fill="url(#colorEncerrados)"
              name="Encerrados"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Resumo numérico */}
        <div className="bg-muted/30 mt-4 grid grid-cols-3 gap-4 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#42b9eb]">
              {data[data.length - 1]?.ativos ?? 0}
            </div>
            <div className="text-muted-foreground text-xs">Ativos Atual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#f59e0b]">
              {data[data.length - 1]?.pendentes ?? 0}
            </div>
            <div className="text-muted-foreground text-xs">Pendentes Atual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#6b7280]">
              {data[data.length - 1]?.encerrados ?? 0}
            </div>
            <div className="text-muted-foreground text-xs">
              Encerrados Atual
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
