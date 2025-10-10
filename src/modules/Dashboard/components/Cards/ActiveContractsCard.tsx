/**
 * ==========================================
 * CARD DE CONTRATOS ATIVOS
 * ==========================================
 */

import { CheckCircle } from 'lucide-react'

import { useDashboardMetrics } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

import { LoadingMetricCard } from './MetricCard'

interface ActiveContractsCardProps {
  filters: DashboardFilters
  className?: string
}

export const ActiveContractsCard = ({
  filters,
  className,
}: ActiveContractsCardProps) => {
  const { metrics, isLoading, error } = useDashboardMetrics(filters)

  return (
    <LoadingMetricCard
      title="Contratos Ativos"
      metric={metrics?.contratosAtivos ?? null}
      icon={CheckCircle}
      isLoading={isLoading}
      error={error}
      className={className}
      description="Contratos em vigência"
      data-testid="active-contracts-card"
    />
  )
}
