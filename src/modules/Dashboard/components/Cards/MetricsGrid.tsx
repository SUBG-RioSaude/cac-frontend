import {
  FileText,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { DashboardData } from '../../types/dashboard'

interface MetricsGridProps {
  data?: DashboardData
  isLoading?: boolean
}

export const MetricsGrid = ({ data, isLoading }: MetricsGridProps) => {
  const metrics = [
    {
      title: 'Total de Contratos',
      value: data ? data.metrics.totalContratos.atual.toString() : '0',
      change: data
        ? `${data.metrics.totalContratos.percentual > 0 ? '+' : ''}${data.metrics.totalContratos.percentual.toFixed(1)}%`
        : '+12.5%',
      trend: data
        ? (data.metrics.totalContratos.tendencia as 'up' | 'down')
        : 'up',
      icon: FileText,
      description: 'vs. mês anterior',
    },
    {
      title: 'Contratos Ativos',
      value: data ? data.metrics.contratosAtivos.atual.toString() : '0',
      change: data
        ? `${data.metrics.contratosAtivos.percentual > 0 ? '+' : ''}${data.metrics.contratosAtivos.percentual.toFixed(1)}%`
        : '+8.2%',
      trend: data
        ? (data.metrics.contratosAtivos.tendencia as 'up' | 'down')
        : 'up',
      icon: CheckCircle2,
      description: 'vs. mês anterior',
    },
    {
      title: 'Contratos a Vencer',
      value: data ? data.metrics.contratosVencendo.atual.toString() : '0',
      change: data
        ? `${data.metrics.contratosVencendo.percentual > 0 ? '+' : ''}${data.metrics.contratosVencendo.percentual.toFixed(1)}%`
        : '-15.3%',
      trend: data
        ? (data.metrics.contratosVencendo.tendencia as 'up' | 'down')
        : 'down',
      icon: AlertCircle,
      description: 'vs. mês anterior',
    },
    {
      title: 'Valor Total',
      value: data
        ? `R$ ${(data.metrics.valorTotal.atual / 1000000).toFixed(1)}M`
        : 'R$ 0',
      change: data
        ? `${data.metrics.valorTotal.percentual > 0 ? '+' : ''}${data.metrics.valorTotal.percentual.toFixed(1)}%`
        : '+18.7%',
      trend: data
        ? (data.metrics.valorTotal.tendencia as 'up' | 'down')
        : 'up',
      icon: DollarSign,
      description: 'vs. mês anterior',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown
        const trendColor =
          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'

        return (
          <Card key={metric.title} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                <span className={`text-xs font-medium ${trendColor}`}>
                  {metric.change}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
