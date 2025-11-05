/**
 * SparklineChart - Mini-gráfico para cards de métrica
 *
 * Exibe uma linha de tendência compacta para visualização rápida
 * Usado dentro dos cards de métricas para mostrar evolução
 */

import { Line, LineChart, ResponsiveContainer } from 'recharts'

import { CHART_COLORS } from '../../utils/chart-colors'

interface SparklineChartProps {
  data: Array<{ value: number }>
  color?: string
  className?: string
}

export const SparklineChart = ({
  data,
  color = CHART_COLORS.chart2,
  className,
}: SparklineChartProps) => {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={60} className={className}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
