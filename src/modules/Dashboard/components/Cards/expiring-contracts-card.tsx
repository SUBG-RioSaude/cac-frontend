/**
 * ==========================================
 * CARD DE CONTRATOS A VENCER (CONFIGURÁVEL)
 * ==========================================
 * Card flexível que aceita diferentes períodos de antecedência (30, 60, 90 dias)
 */

import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Clock, AlertTriangle } from 'lucide-react'

import { getContratosVencendo } from '@/modules/Contratos/services/contratos-service'

import type { DashboardFilters } from '../../types/dashboard'

import { LoadingMetricCard } from './metric-card'

interface ExpiringContractsCardProps {
  filters: DashboardFilters
  diasAntecedencia?: 30 | 60 | 90
  className?: string
}

export const ExpiringContractsCard = ({
  filters,
  diasAntecedencia = 30,
  className,
}: ExpiringContractsCardProps) => {
  // Buscar contratos vencendo usando o endpoint específico
  const { data, isLoading, error } = useQuery({
    queryKey: ['contratos-vencendo', diasAntecedencia, filters.unidades],
    queryFn: async () => {
      const result = await getContratosVencendo(diasAntecedencia, {
        unidadeSaudeId:
          filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      })
      return result
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Buscar dados do período anterior para comparação
  const { data: previousData } = useQuery({
    queryKey: [
      'contratos-vencendo-anterior',
      diasAntecedencia,
      filters.unidades,
    ],
    queryFn: async () => {
      // Buscar mesmo período do mês anterior
      const result = await getContratosVencendo(diasAntecedencia, {
        unidadeSaudeId:
          filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      })
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Calcular métrica com percentual
  const atual = data?.totalRegistros ?? 0
  const anterior = previousData?.totalRegistros ?? atual
  const percentual =
    anterior > 0 ? ((atual - anterior) / anterior) * 100 : atual > 0 ? 100 : 0
  const tendencia = atual > anterior ? 'up' : atual < anterior ? 'down' : 'up'

  const metric = {
    atual,
    percentual,
    tendencia,
  }

  // Definir ícone e cor baseado no período
  const iconMap = {
    30: AlertTriangle, // Mais urgente
    60: AlertCircle, // Atenção moderada
    90: Clock, // Menos urgente
  }

  const Icon = iconMap[diasAntecedencia]

  return (
    <LoadingMetricCard
      title={`Contratos a Vencer (${diasAntecedencia}d)`}
      metric={metric}
      icon={Icon}
      isLoading={isLoading}
      error={error ?? null}
      className={className}
      description={`Vencendo nos próximos ${diasAntecedencia} dias`}
      data-testid={`expiring-contracts-card-${diasAntecedencia}`}
    />
  )
}
