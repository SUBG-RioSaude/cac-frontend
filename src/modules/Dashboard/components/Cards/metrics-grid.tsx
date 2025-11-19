import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import type { DashboardData } from '../../types/dashboard'

import {
  MetricCard,
  MetricCardContent,
  MetricCardHeader,
  MetricCardTitle,
} from './metric-card'

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
        ? (data.metrics.totalContratos.tendencia)
        : 'up',
      icon: FileText,
      description: 'vs. mês anterior',
    },
    {
      title: 'Contratos Vigentes',
      value: data ? data.metrics.contratosAtivos.atual.toString() : '0',
      change: data
        ? `${data.metrics.contratosAtivos.percentual > 0 ? '+' : ''}${data.metrics.contratosAtivos.percentual.toFixed(1)}%`
        : '+8.2%',
      trend: data
        ? (data.metrics.contratosAtivos.tendencia)
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
        ? (data.metrics.contratosVencendo.tendencia)
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
      trend: data ? (data.metrics.valorTotal.tendencia) : 'up',
      icon: DollarSign,
      description: 'vs. mês anterior',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <MetricCard key={i}>
            <MetricCardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-8 w-8 animate-pulse rounded" />
              </div>
            </MetricCardHeader>
            <MetricCardContent>
              <div className="bg-muted h-8 w-32 animate-pulse rounded" />
              <div className="bg-muted mt-2 h-4 w-40 animate-pulse rounded" />
            </MetricCardContent>
          </MetricCard>
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
          <motion.div
            key={metric.title}
            whileHover="hover"
            initial="initial"	
            className="transition-shadow duration-300 hover:shadow-md"
          >
            <MetricCard>	
              <MetricCardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <MetricCardTitle>{metric.title}</MetricCardTitle>

                    {/* Separator com animação de expansão no hover */}
                    <motion.div
                      className="bg-brand-secondary/60 h-[2px] rounded-full"
                      variants={{
                        initial: { width: '3rem' },
                        hover: { width: '10rem' },
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  </div>

                  <div className="bg-brand-secondary rounded-md p-1.5">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </MetricCardHeader>

              <MetricCardContent>
                <div className="text-brand-primary text-2xl font-semibold">
                  {metric.value}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                  <span className={`text-xs font-medium ${trendColor}`}>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    {metric.description}
                  </span>
                </div>
              </MetricCardContent>
            </MetricCard>
          </motion.div>
        )
      })}
    </div>
  )
}
