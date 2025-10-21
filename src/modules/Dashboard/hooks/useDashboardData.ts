/**
 * ==========================================
 * HOOK DE DADOS DO DASHBOARD
 * ==========================================
 * Gerencia carregamento e cache dos dados do dashboard
 */

import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getDashboardDataMock } from '../data/dashboard-mock'
import { fetchDashboardData } from '../services/dashboard-service'
import type {
  DashboardFilters,
  UseDashboardDataResult,
} from '../types/dashboard'

// Flag para habilitar modo mock (útil durante desenvolvimento)
// Em testes, sempre usar fetchDashboardData para permitir mocking
const isTestEnvironment = () => {
  // Detecta se estamos em ambiente de teste
  return (
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' ||
      process.env.VITEST === 'true' ||
      import.meta.env.MODE === 'test' ||
      // Fallback: detecta se há funções de teste globais
      (typeof globalThis !== 'undefined' &&
        ('vi' in globalThis || 'describe' in globalThis)))
  )
}

const USE_MOCK_DATA = import.meta.env.DEV && !isTestEnvironment()

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
    queryFn: USE_MOCK_DATA
      ? () => getDashboardDataMock(800)
      : () => fetchDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
