/**
 * ==========================================
 * TIPAGEM DO DASHBOARD DE CONTRATOS
 * ==========================================
 * Tipos específicos para métricas, filtros e análises do dashboard
 */

import type { ContratoStatus, TipoContrato } from '@/modules/Contratos/types/contrato'

// ========== MÉTRICAS DO DASHBOARD ==========

export interface DashboardMetric {
  atual: number
  anterior: number
  percentual: number
  tendencia: 'up' | 'down' | 'stable'
}

export interface DashboardMetrics {
  totalContratos: DashboardMetric
  contratosAtivos: DashboardMetric
  contratosVencendo: DashboardMetric
  valorTotal: DashboardMetric
}

// ========== FILTROS GLOBAIS ==========

export interface DashboardFilters {
  periodo: {
    mes: number
    ano: number
  }
  unidades: string[] // IDs das unidades
  status: ContratoStatus[]
  tipos: TipoContrato[]
}

// ========== DADOS DE GRÁFICOS ==========

export interface StatusDistributionData {
  name: string
  value: number
  color: string
  percentage: number
}

export interface StatusTrendData {
  mes: string
  ativos: number
  pendentes: number
  encerrados: number
  suspensos: number
}

export interface TypeDistributionData {
  tipo: string
  quantidade: number
  percentual: number
  valor: number
}

// ========== CONTRATOS RECENTES ==========

export interface RecentContract {
  id: string
  numero: string
  objeto: string
  valor: number
  vigencia: {
    inicio: string
    fim: string
  }
  status: ContratoStatus
  fornecedor: string
  dataFormalizacao: string
}

// ========== ATIVIDADES RECENTES ==========

export type ActivityType = 'cadastrado' | 'aprovado' | 'atualizado' | 'cancelado' | 'renovado'

export interface DashboardActivity {
  id: string
  tipo: ActivityType
  contratoId: string
  contratoNumero: string
  descricao: string
  dataHora: string
  usuario?: string
}

// ========== ANÁLISE DE RISCOS ==========

export type RiskLevel = 'alto' | 'medio' | 'baixo'

export interface RiskAnalysis {
  level: RiskLevel
  count: number
  contratos: RiskContract[]
  description: string
}

export interface RiskContract {
  id: string
  numero: string
  objeto: string
  risco: RiskLevel
  motivos: string[]
  diasVencimento?: number
  valorRisco?: number
}

export interface DashboardRisks {
  alto: RiskAnalysis
  medio: RiskAnalysis
  baixo: RiskAnalysis
  total: number
}

// ========== DADOS CONSOLIDADOS DO DASHBOARD ==========

export interface DashboardData {
  metrics: DashboardMetrics
  statusDistribution: StatusDistributionData[]
  statusTrend: StatusTrendData[]
  typeDistribution: TypeDistributionData[]
  recentContracts: RecentContract[]
  recentActivities: DashboardActivity[]
  riskAnalysis: DashboardRisks
  lastUpdated: string
}

// ========== CONFIGURAÇÃO DE SEÇÕES ==========

export interface DashboardSection {
  id: string
  label: string
  icon: string
  order: number
}

// ========== PERÍODOS DISPONÍVEIS ==========

export interface PeriodOption {
  mes: number
  ano: number
  label: string
  value: string
}

// ========== TIPOS PARA HOOKS ==========

export interface UseDashboardDataResult {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export interface UseFiltersResult {
  filters: DashboardFilters
  updateFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}