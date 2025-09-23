/**
 * ==========================================
 * HOOK DE DADOS DO DASHBOARD
 * ==========================================
 * Gerencia carregamento e cache dos dados do dashboard
 */

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  DashboardFilters,
  UseDashboardDataResult,
} from '../types/dashboard'
import { fetchDashboardData } from '../services/dashboard-service'

/**
 * Hook para gerenciar dados do dashboard com cache e refetch
 */
export const useDashboardData = (
  filters: DashboardFilters,
): UseDashboardDataResult => {
  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['dashboard-data', filters],
    queryFn: () => fetchDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const refetch = useCallback(() => {
    queryRefetch()
  }, [queryRefetch])

  return {
    data: data || null,
    isLoading,
    error: error?.message || null,
    refetch,
  }
}

/**
 * Hook para dados de métricas específicas (para uso em cards individuais)
 */
export const useDashboardMetrics = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useDashboardData(filters)

  return {
    metrics: data?.metrics || null,
    isLoading,
    error,
  }
}

/**
 * Hook para dados de gráficos
 */
export const useDashboardCharts = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useDashboardData(filters)

  return {
    statusDistribution: data?.statusDistribution || [],
    statusTrend: data?.statusTrend || [],
    typeDistribution: data?.typeDistribution || [],
    isLoading,
    error,
  }
}

/**
 * Hook para análise de riscos
 */
export const useRiskAnalysis = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useDashboardData(filters)

  return {
    riskAnalysis: data?.riskAnalysis || null,
    isLoading,
    error,
  }
}

/**
 * Hook para dados de tabelas (contratos e atividades recentes)
 */
export const useRecentData = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useDashboardData(filters)

  return {
    recentContracts: data?.recentContracts || [],
    recentActivities: data?.recentActivities || [],
    isLoading,
    error,
  }
}
