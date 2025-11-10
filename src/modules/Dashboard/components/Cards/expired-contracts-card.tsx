/**
 * ==========================================
 * CARD DE CONTRATOS VENCIDOS
 * ==========================================
 * Mostra total de contratos que já venceram
 */

import { useQuery } from '@tanstack/react-query'
import { AlertOctagon } from 'lucide-react'

import { getContratosVencidos } from '@/modules/Contratos/services/contratos-service'

import type { DashboardFilters } from '../../types/dashboard'

import { LoadingMetricCard } from './metric-card'

interface ExpiredContractsCardProps {
  filters: DashboardFilters
  className?: string
}

export const ExpiredContractsCard = ({
  filters,
  className,
}: ExpiredContractsCardProps) => {
  // Buscar contratos vencidos usando o endpoint específico
  const { data, isLoading, error } = useQuery({
    queryKey: ['contratos-vencidos', filters.unidades],
    queryFn: async () => {
      const result = await getContratosVencidos({
        unidadeSaudeId:
          filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      })
      return result
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Buscar dados do período anterior para comparação (opcional, pode ser 0)
  const { data: previousData } = useQuery({
    queryKey: ['contratos-vencidos-anterior', filters.unidades],
    queryFn: async () => {
      // Para contratos vencidos, não faz muito sentido comparar com período anterior
      // mas mantemos a estrutura para consistência
      const result = await getContratosVencidos({
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
    tendencia: tendencia as 'up' | 'down',
  }

  return (
    <LoadingMetricCard
      title="Contratos Vencidos"
      metric={metric}
      icon={AlertOctagon}
      isLoading={isLoading}
      error={error ?? null}
      className={className}
      description="Requerem atenção urgente"
      data-testid="expired-contracts-card"
    />
  )
}
