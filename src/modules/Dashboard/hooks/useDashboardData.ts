/**
 * ==========================================
 * HOOK DE DADOS DO DASHBOARD - OTIMIZADO
 * ==========================================
 * Gerencia carregamento e cache dos dados do dashboard
 * Melhorias de Performance - Fase 1: Debounce + Smooth Transitions
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useDebouncedValue } from '@/hooks/use-debounced-value'

import { fetchDashboardData } from '../services/dashboard-service'
import type {
  DashboardFilters,
  UseDashboardDataResult,
} from '../types/dashboard'

/**
 * Hook para gerenciar dados do dashboard com cache e refetch
 * OTIMIZADO: Aplica debounce de 500ms nos filtros para reduzir chamadas HTTP
 */
export const useDashboardData = (
  filters: DashboardFilters,
): UseDashboardDataResult => {
  // Debounce de filtros para evitar requisições excessivas
  const debouncedFilters = useDebouncedValue(filters, 500)

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['dashboard-data', debouncedFilters],
    queryFn: () => fetchDashboardData(debouncedFilters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Melhorias de UX
    placeholderData: keepPreviousData, // Mantém dados anteriores durante loading
  })

  const refetch = useCallback(() => {
    void queryRefetch()
  }, [queryRefetch])

  return {
    data: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  }
}

/**
 * Hook para dados de métricas específicas (para uso em cards individuais)
 */
export const useDashboardMetrics = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useDashboardData(filters)

  return {
    metrics: data?.metrics ?? null,
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
    statusDistribution: data?.statusDistribution ?? [],
    statusTrend: data?.statusTrend ?? [],
    typeDistribution: data?.typeDistribution ?? [],
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
    riskAnalysis: data?.riskAnalysis ?? null,
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
    recentContracts: data?.recentContracts ?? [],
    recentActivities: data?.recentActivities ?? [],
    isLoading,
    error,
  }
}
