import * as React from 'react'

import { cn, currencyUtils } from '@/lib/utils'

const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'group bg-card text-card-foreground rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md',
      className,
    )}
    {...props}
  />
))
MetricCard.displayName = 'MetricCard'

const MetricCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-0 p-3 pb-1.5', className)}
    {...props}
  />
))
MetricCardHeader.displayName = 'MetricCardHeader'

const MetricCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-foreground text-[13px] font-medium', className)}
    {...props}
  >
    {children}
  </h3>
))
MetricCardTitle.displayName = 'MetricCardTitle'

const MetricCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-3 pt-0', className)} {...props} />
))
MetricCardContent.displayName = 'MetricCardContent'

// Componente auxiliar para cards com loading e métricas
interface LoadingMetricCardProps {
  title: string
  metric: {
    atual: number
    percentual: number
    tendencia: 'up' | 'down'
  } | null
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
  error?: string | null
  className?: string
  description?: string
  format?: 'number' | 'currency'
  'data-testid'?: string
}

export const LoadingMetricCard = ({
  title,
  metric,
  icon: Icon,
  isLoading,
  error,
  className,
  description,
  format = 'number',
  'data-testid': testId,
}: LoadingMetricCardProps) => {
  if (isLoading) {
    return (
      <MetricCard className={className} data-testid={testId}>
        <MetricCardHeader>
          <div className="flex items-center justify-between">
            <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            <div className="bg-muted h-6 w-6 animate-pulse rounded" />
          </div>
        </MetricCardHeader>
        <MetricCardContent>
          <div className="bg-muted h-6 w-28 animate-pulse rounded" />
          <div className="bg-muted mt-1 h-3 w-32 animate-pulse rounded" />
        </MetricCardContent>
      </MetricCard>
    )
  }

  if (error) {
    return (
      <MetricCard className={className} data-testid={testId}>
        <MetricCardHeader>
          <MetricCardTitle>{title}</MetricCardTitle>
        </MetricCardHeader>
        <MetricCardContent>
          <p className="text-destructive text-sm">Erro ao carregar dados</p>
        </MetricCardContent>
      </MetricCard>
    )
  }

  const TrendIcon =
    metric?.tendencia === 'up' ? (
      <span className="text-green-600">↑</span>
    ) : (
      <span className="text-red-600">↓</span>
    )
  const trendColor =
    metric?.tendencia === 'up' ? 'text-green-600' : 'text-red-600'

  // Formatar valor baseado no tipo
  const formatValue = (value: number) => {
    if (format === 'currency') {
      return currencyUtils.formatar(value)
    }
    return value.toLocaleString('pt-BR')
  }

  return (
    <MetricCard className={className} data-testid={testId}>
      <MetricCardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <MetricCardTitle>{title}</MetricCardTitle>
            <div className="bg-brand-secondary/60 h-[1.5px] w-11 rounded-full transition-all duration-300 group-hover:w-20" />
          </div>
          <div className="bg-brand-secondary rounded-md p-1.5">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </MetricCardHeader>
      <MetricCardContent>
        <div className="text-brand-primary text-2xl font-bold">
          {formatValue(metric?.atual ?? 0)}
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          {TrendIcon}
          <span className={`text-[13px] font-medium ${trendColor}`}>
            {metric?.percentual ?? 0}%
          </span>
          {description && (
            <span className="text-muted-foreground ml-1 text-[13px]">
              {description}
            </span>
          )}
        </div>
      </MetricCardContent>
    </MetricCard>
  )
}

// Componente para cards de status
interface StatusMetricCardProps extends LoadingMetricCardProps {
  status?: 'success' | 'warning' | 'danger'
}

export const StatusMetricCard = (props: StatusMetricCardProps) => {
  return <LoadingMetricCard {...props} />
}

export { MetricCard, MetricCardHeader, MetricCardTitle, MetricCardContent }
