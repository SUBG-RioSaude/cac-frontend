/**
 * ==========================================
 * QUERY KEYS DO DASHBOARD
 * ==========================================
 * Factory para Query Keys do módulo de dashboard
 * Padroniza as chaves de cache para consistência e invalidação eficiente
 */

import type { DashboardFilters } from '../types/dashboard'

export const dashboardKeys = {
  // Base key para todo o dashboard
  all: ['dashboard'] as const,

  // Dados consolidados do dashboard
  data: () => [...dashboardKeys.all, 'data'] as const,
  dataWithFilters: (filtros?: Partial<DashboardFilters>) =>
    [...dashboardKeys.data(), filtros] as const,

  // Métricas específicas
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  metricsWithFilters: (filtros?: Partial<DashboardFilters>) =>
    [...dashboardKeys.metrics(), filtros] as const,

  // Gráficos e distribuições
  charts: () => [...dashboardKeys.all, 'charts'] as const,
  statusDistribution: () =>
    [...dashboardKeys.charts(), 'status-distribution'] as const,
  statusTrend: () => [...dashboardKeys.charts(), 'status-trend'] as const,
  typeDistribution: () =>
    [...dashboardKeys.charts(), 'type-distribution'] as const,

  // Contratos recentes
  recentContracts: (limit?: number) =>
    [...dashboardKeys.all, 'recent-contracts', limit] as const,

  // Atividades recentes
  recentActivities: (limit?: number) =>
    [...dashboardKeys.all, 'recent-activities', limit] as const,

  // Análise de riscos
  risks: () => [...dashboardKeys.all, 'risks'] as const,
  risksByLevel: (level: 'alto' | 'medio' | 'baixo') =>
    [...dashboardKeys.risks(), level] as const,

  // Para mutations - keys que devem ser invalidadas
  invalidateAll: () => [dashboardKeys.all] as const,

  invalidateMetrics: () =>
    [
      dashboardKeys.metrics(),
      dashboardKeys.data(),
      dashboardKeys.all,
    ] as const,

  invalidateCharts: () =>
    [
      dashboardKeys.charts(),
      dashboardKeys.statusDistribution(),
      dashboardKeys.statusTrend(),
      dashboardKeys.typeDistribution(),
      dashboardKeys.data(),
    ] as const,

  invalidateRisks: () => [dashboardKeys.risks(), dashboardKeys.data()] as const,

  // Invalidação quando um contrato é atualizado (vindo de outro módulo)
  invalidateOnContratoChange: () =>
    [
      dashboardKeys.all,
      dashboardKeys.data(),
      dashboardKeys.metrics(),
      dashboardKeys.recentContracts(),
      dashboardKeys.risks(),
    ] as const,
}

// Tipo para garantir type safety
export type DashboardQueryKey =
  | readonly ['dashboard']
  | readonly ['dashboard', 'data']
  | readonly ['dashboard', 'data', Partial<DashboardFilters> | undefined]
  | readonly ['dashboard', 'metrics']
  | readonly ['dashboard', 'metrics', Partial<DashboardFilters> | undefined]
  | readonly ['dashboard', 'charts']
  | readonly ['dashboard', 'charts', 'status-distribution']
  | readonly ['dashboard', 'charts', 'status-trend']
  | readonly ['dashboard', 'charts', 'type-distribution']
  | readonly ['dashboard', 'recent-contracts', number | undefined]
  | readonly ['dashboard', 'recent-activities', number | undefined]
  | readonly ['dashboard', 'risks']
  | readonly ['dashboard', 'risks', 'alto' | 'medio' | 'baixo']
