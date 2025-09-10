/**
 * ==========================================
 * UTILITÁRIOS DO DASHBOARD
 * ==========================================
 * Funções auxiliares para cálculos e formatações
 */

import type { DashboardMetric, RiskLevel, ActivityType, DashboardFilters } from '../types/dashboard'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato'
import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ========== CÁLCULOS DE MÉTRICAS ==========

/**
 * Calcula percentual de variação entre dois períodos
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number(((current - previous) / previous * 100).toFixed(2))
}

/**
 * Determina tendência baseada no percentual
 */
export const getTrend = (percentage: number): 'up' | 'down' | 'stable' => {
  if (percentage > 2) return 'up'
  if (percentage < -2) return 'down'
  return 'stable'
}

/**
 * Cria objeto de métrica do dashboard
 */
export const createDashboardMetric = (atual: number, anterior: number): DashboardMetric => {
  const percentual = calculatePercentageChange(atual, anterior)
  return {
    atual,
    anterior,
    percentual,
    tendencia: getTrend(percentual)
  }
}

// ========== ANÁLISE DE RISCOS ==========

/**
 * Verifica se contrato tem documentos vencidos ou vencendo
 */
export const hasExpiredOrExpiringDocs = (contrato: ContratoDetalhado): boolean => {
  // TODO: Implementar lógica baseada nos documentos do contrato
  // Por enquanto, simulação baseada em data de término
  const now = new Date()
  const endDate = parseISO(contrato.dataTermino)
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysUntilExpiry <= 30 // Docs vencendo em até 30 dias
}

/**
 * Verifica se contrato tem atrasos na entrega
 */
export const hasDeliveryDelays = (contrato: ContratoDetalhado): boolean => {
  // TODO: Implementar lógica baseada em cronograma/entregas
  // Por enquanto, simulação
  return contrato.status === 'suspenso'
}

/**
 * Verifica se contrato tem pendências de publicação
 */
export const hasPublicationPendencies = (contrato: ContratoDetalhado): boolean => {
  // TODO: Implementar lógica baseada em status de documentos
  // Por enquanto, simulação
  return contrato.status === 'em_aprovacao'
}

/**
 * Verifica se contrato está vencendo em 60, 45 ou 30 dias
 */
export const isExpiringSoon = (contrato: ContratoDetalhado): { isExpiring: boolean; days: number } => {
  const now = new Date()
  const endDate = parseISO(contrato.dataTermino)
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    isExpiring: daysUntilExpiry <= 60 && daysUntilExpiry > 0,
    days: daysUntilExpiry
  }
}

/**
 * Verifica se contrato tem alterações contratuais em andamento
 */
export const hasOngoingChanges = (contrato: ContratoDetalhado): boolean => {
  // TODO: Implementar lógica baseada em alterações contratuais
  // Por enquanto, simulação baseada em alguns critérios
  return contrato.status === 'ativo' && Math.random() > 0.8 // Simulação
}

/**
 * Classifica o nível de risco de um contrato
 */
export const classifyContractRisk = (contrato: ContratoDetalhado): RiskLevel => {
  // Alto Risco: Docs vencidos/vencendo, atrasos, pendências de publicação
  if (hasExpiredOrExpiringDocs(contrato) || 
      hasDeliveryDelays(contrato) || 
      hasPublicationPendencies(contrato)) {
    return 'alto'
  }
  
  // Médio Risco: Vencimentos em 60/45/30 dias, alterações em andamento
  const { isExpiring } = isExpiringSoon(contrato)
  if (isExpiring || hasOngoingChanges(contrato)) {
    return 'medio'
  }
  
  // Baixo Risco: Em conformidade
  return 'baixo'
}

/**
 * Gera motivos do risco para um contrato
 */
export const getRiskReasons = (contrato: ContratoDetalhado): string[] => {
  const reasons: string[] = []
  
  if (hasExpiredOrExpiringDocs(contrato)) {
    reasons.push('Documentação vencendo/vencida')
  }
  
  if (hasDeliveryDelays(contrato)) {
    reasons.push('Atraso na entrega')
  }
  
  if (hasPublicationPendencies(contrato)) {
    reasons.push('Pendência de publicação')
  }
  
  const { isExpiring, days } = isExpiringSoon(contrato)
  if (isExpiring) {
    reasons.push(`Vence em ${days} dias`)
  }
  
  if (hasOngoingChanges(contrato)) {
    reasons.push('Alterações contratuais em andamento')
  }
  
  return reasons.length > 0 ? reasons : ['Em conformidade']
}

// ========== FILTROS E PERÍODOS ==========

/**
 * Gera lista de períodos disponíveis (últimos 12 meses)
 */
export const generatePeriodOptions = () => {
  const options = []
  const today = new Date()
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    options.push({
      mes: date.getMonth() + 1,
      ano: date.getFullYear(),
      label: format(date, 'MMMM yyyy', { locale: ptBR }),
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
  }
  
  return options
}

/**
 * Filtros padrão do dashboard
 */
export const defaultFilters: DashboardFilters = {
  periodo: {
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
  },
  unidades: [],
  status: [],
  tipos: []
}

/**
 * Verifica se existem filtros ativos
 */
export const hasActiveFilters = (filters: DashboardFilters): boolean => {
  const today = new Date()
  const isCurrentPeriod = filters.periodo.mes === today.getMonth() + 1 && 
                         filters.periodo.ano === today.getFullYear()
  
  return !isCurrentPeriod || 
         filters.unidades.length > 0 || 
         filters.status.length > 0 || 
         filters.tipos.length > 0
}

// ========== FORMATAÇÕES ==========

/**
 * Formata números grandes com sufixos (K, M, B)
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Formata percentual com sinal e cor
 */
export const formatPercentage = (percentage: number): { text: string; color: string; icon: string } => {
  const absPercentage = Math.abs(percentage)
  const sign = percentage > 0 ? '+' : percentage < 0 ? '' : ''
  
  return {
    text: `${sign}${absPercentage.toFixed(1)}%`,
    color: percentage > 0 ? 'text-green-600' : percentage < 0 ? 'text-red-600' : 'text-gray-600',
    icon: percentage > 0 ? '↗' : percentage < 0 ? '↘' : '→'
  }
}

/**
 * Mapeia tipo de atividade para ícone e cor
 */
export const getActivityConfig = (type: ActivityType) => {
  const configs = {
    cadastrado: { icon: 'Plus', color: 'text-blue-600', bg: 'bg-blue-100' },
    aprovado: { icon: 'Check', color: 'text-green-600', bg: 'bg-green-100' },
    atualizado: { icon: 'Edit', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    cancelado: { icon: 'X', color: 'text-red-600', bg: 'bg-red-100' },
    renovado: { icon: 'RefreshCw', color: 'text-purple-600', bg: 'bg-purple-100' }
  }
  
  return configs[type] || configs.atualizado
}

/**
 * Seções do dashboard para navegação
 */
export const dashboardSections = [
  { id: 'cards', label: 'Métricas', icon: 'BarChart3', order: 1 },
  { id: 'charts', label: 'Gráficos', icon: 'PieChart', order: 2 },
  { id: 'recent', label: 'Recentes', icon: 'Clock', order: 3 },
  { id: 'risks', label: 'Riscos', icon: 'AlertTriangle', order: 4 },
  { id: 'activities', label: 'Atividades', icon: 'Activity', order: 5 }
]