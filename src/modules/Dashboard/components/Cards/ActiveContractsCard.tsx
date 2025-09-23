/**
 * ==========================================
 * CARD DE CONTRATOS ATIVOS
 * ==========================================
 */

import { CheckCircle } from 'lucide-react'
import { LoadingMetricCard } from './MetricCard'
import { useDashboardMetrics } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

interface ActiveContractsCardProps {
  filters: DashboardFilters
  className?: string
}

export function ActiveContractsCard({
  filters,
  className,
}: ActiveContractsCardProps) {
  const { metrics, isLoading, error } = useDashboardMetrics(filters)

  return (
    <LoadingMetricCard
      title="Contratos Ativos"
      metric={metrics?.contratosAtivos || null}
      icon={CheckCircle}
      isLoading={isLoading}
      error={error}
      className={className}
      description="Contratos em vigência"
      data-testid="active-contracts-card"
    />
  )
}
