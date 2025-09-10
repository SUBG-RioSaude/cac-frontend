/**
 * ==========================================
 * CARD DE TOTAL DE CONTRATOS
 * ==========================================
 */

import { FileText } from 'lucide-react'
import { LoadingMetricCard } from './MetricCard'
import { useDashboardMetrics } from '../../hooks/useDashboardData'
import type { DashboardFilters } from '../../types/dashboard'

interface TotalContractsCardProps {
  filters: DashboardFilters
  className?: string
}

export function TotalContractsCard({ filters, className }: TotalContractsCardProps) {
  const { metrics, isLoading, error } = useDashboardMetrics(filters)

  return (
    <LoadingMetricCard
      title="Total de Contratos"
      metric={metrics?.totalContratos || null}
      icon={FileText}
      isLoading={isLoading}
      error={error}
      className={className}
      description="Contratos cadastrados no sistema"
    />
  )
}