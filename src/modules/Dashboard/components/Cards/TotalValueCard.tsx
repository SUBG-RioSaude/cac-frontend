/**
 * ==========================================
 * CARD DE VALOR TOTAL
 * ==========================================
 */

import { DollarSign } from 'lucide-react'

import { useDashboardMetrics } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

import { LoadingMetricCard } from './MetricCard'

interface TotalValueCardProps {
  filters: DashboardFilters
  className?: string
}

export const TotalValueCard = ({ filters, className }: TotalValueCardProps) => {
  const { metrics, isLoading, error } = useDashboardMetrics(filters)

  return (
    <LoadingMetricCard
      title="Valor Total"
      metric={metrics?.valorTotal ?? null}
      icon={DollarSign}
      isLoading={isLoading}
      error={error}
      format="currency"
      className={className}
      description="Valor total dos contratos"
      data-testid="total-value-card"
    />
  )
}
