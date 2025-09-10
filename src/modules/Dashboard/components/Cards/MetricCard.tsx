/**
 * ==========================================
 * COMPONENTE BASE DE CARD DE MÉTRICA
 * ==========================================
 * Card reutilizável para exibir métricas com comparativo
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import type { DashboardMetric } from '../../types/dashboard'
import { formatPercentage, formatLargeNumber } from '../../utils/dashboard-utils'

interface MetricCardProps {
  title: string
  value: number | string
  metric?: DashboardMetric
  icon: LucideIcon
  className?: string
  isLoading?: boolean
  error?: string | null
  format?: 'number' | 'currency' | 'percentage'
  suffix?: string
  description?: string
}

export function MetricCard({
  title,
  value,
  metric,
  icon: Icon,
  className,
  isLoading = false,
  error = null,
  format = 'number',
  suffix,
  description
}: MetricCardProps) {
  // Formatação do valor principal
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return `R$ ${formatLargeNumber(val)}`
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'number':
      default:
        return formatLargeNumber(val)
    }
  }

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-32" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('border-red-200 bg-red-50/50', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xs text-red-600">
            Erro ao carregar dados
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados de comparativo se disponível
  let trendIcon = null
  let trendText = ''
  let trendColor = 'text-muted-foreground'

  if (metric) {
    const { text, color } = formatPercentage(metric.percentual)
    trendText = text
    trendColor = color
    
    if (metric.tendencia === 'up') {
      trendIcon = <TrendingUp className="h-3 w-3" />
    } else if (metric.tendencia === 'down') {
      trendIcon = <TrendingDown className="h-3 w-3" />
    } else {
      trendIcon = <Minus className="h-3 w-3" />
    }
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Valor Principal */}
          <div className="flex items-baseline gap-1">
            <div className="text-2xl font-bold">
              {formatValue(value)}
            </div>
            {suffix && (
              <div className="text-sm text-muted-foreground">
                {suffix}
              </div>
            )}
          </div>
          
          {/* Comparativo */}
          {metric && (
            <div className="flex items-center gap-1 text-xs">
              <div className={cn('flex items-center gap-0.5', trendColor)}>
                {trendIcon}
                <span className="font-medium">
                  {trendText}
                </span>
              </div>
              <span className="text-muted-foreground">
                vs mês anterior
              </span>
            </div>
          )}
          
          {/* Descrição adicional */}
          {description && (
            <div className="text-xs text-muted-foreground mt-1">
              {description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de card de métrica com loading automático
 */
interface LoadingMetricCardProps extends Omit<MetricCardProps, 'value' | 'metric'> {
  metric: DashboardMetric | null | undefined
  isLoading: boolean
}

export function LoadingMetricCard({
  metric,
  isLoading,
  format = 'number',
  ...props
}: LoadingMetricCardProps) {
  return (
    <MetricCard
      {...props}
      value={metric?.atual || 0}
      metric={metric || undefined}
      isLoading={isLoading}
      format={format}
    />
  )
}

/**
 * Variantes especializadas do MetricCard
 */

// Card para valores monetários
export function CurrencyMetricCard(props: Omit<MetricCardProps, 'format'>) {
  return <MetricCard {...props} format="currency" />
}

// Card para percentuais
export function PercentageMetricCard(props: Omit<MetricCardProps, 'format'>) {
  return <MetricCard {...props} format="percentage" />
}

// Card com indicador de status
interface StatusMetricCardProps extends MetricCardProps {
  status: 'success' | 'warning' | 'danger' | 'info'
}

export function StatusMetricCard({ status, className, ...props }: StatusMetricCardProps) {
  const statusClasses = {
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50', 
    danger: 'border-red-200 bg-red-50/50',
    info: 'border-blue-200 bg-blue-50/50'
  }
  
  return (
    <MetricCard
      {...props}
      className={cn(statusClasses[status], className)}
    />
  )
}