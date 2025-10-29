/**
 * ==========================================
 * CARD DE CONTRATOS A VENCER
 * ==========================================
 */

import { AlertCircle } from 'lucide-react'

import { useDashboardMetrics } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

import { StatusMetricCard } from './metric-card'

interface ExpiringContractsCardProps {
  filters: DashboardFilters
  className?: string
}

export const ExpiringContractsCard = ({
  filters,
  className,
}: ExpiringContractsCardProps) => {
  const { metrics, isLoading, error } = useDashboardMetrics(filters)

  const metric = metrics?.contratosVencendo
  const status = metric && metric.atual > 0 ? 'warning' : 'success'

  return (
    <StatusMetricCard
      title="Contratos a Vencer"
      value={metric?.atual ?? 0}
      metric={metric ?? undefined}
      icon={AlertCircle}
      isLoading={isLoading}
      error={error}
      status={status}
      className={className}
      description="Vencendo nos próximos 60 dias"
      data-testid="expiring-contracts-card"
    />
  )
}
