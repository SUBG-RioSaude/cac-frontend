/**
 * ==========================================
 * TIPOS DE STATUS PARA COMPONENTES GLOBAIS
 * ==========================================
 * Centraliza todos os tipos de status utilizados no sistema
 */

import type { LucideIcon } from 'lucide-react'

// Status para Contratos
export type StatusContrato =
  | 'vigente'
  | 'ativo'
  | 'vencendo'
  | 'vencido'
  | 'suspenso'
  | 'encerrado'
  | 'rascunho'
  | 'em_aprovacao'
  | 'indefinido'

// Status para Fornecedores
export type StatusFornecedor = 'ativo' | 'inativo' | 'suspenso'

// Status para Unidades
export type StatusUnidade = 'ativo' | 'inativo'

// Status genérico (união de todos)
export type Status = StatusContrato | StatusFornecedor | StatusUnidade

// Mapeamento para converter string genérica para status específico
export function parseStatusContrato(status?: string | null): StatusContrato {
  const normalizedStatus = status?.toLowerCase() ?? 'indefinido'

  // Retrocompatibilidade: mapear "ativo" para "vigente"
  if (normalizedStatus === 'ativo') {
    return 'vigente'
  }

  const validStatuses: StatusContrato[] = [
    'vigente',
    'vencendo',
    'vencido',
    'suspenso',
    'encerrado',
    'rascunho',
    'em_aprovacao',
    'indefinido',
  ]
  return validStatuses.includes(normalizedStatus as StatusContrato)
    ? (normalizedStatus as StatusContrato)
    : 'indefinido'
}

export function parseStatusFornecedor(
  status?: string | null,
): StatusFornecedor {
  const normalizedStatus = status?.toLowerCase() ?? 'ativo'
  const validStatuses: StatusFornecedor[] = ['ativo', 'inativo', 'suspenso']
  return validStatuses.includes(normalizedStatus as StatusFornecedor)
    ? (normalizedStatus as StatusFornecedor)
    : 'ativo'
}

export function parseStatusUnidade(status?: string | null): StatusUnidade {
  const normalizedStatus = status?.toLowerCase() ?? 'ativo'
  const validStatuses: StatusUnidade[] = ['ativo', 'inativo']
  return validStatuses.includes(normalizedStatus as StatusUnidade)
    ? (normalizedStatus as StatusUnidade)
    : 'ativo'
}

// Domínios de entidades
export type StatusDomain = 'contrato' | 'fornecedor' | 'unidade'

// Configuração visual para cada status
export interface StatusConfig {
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  label: string
  className: string
  icon?: LucideIcon
}

// Mapeamento de configurações por domínio
export interface StatusConfigMap {
  contrato: Record<StatusContrato, StatusConfig>
  fornecedor: Record<StatusFornecedor, StatusConfig>
  unidade: Record<StatusUnidade, StatusConfig>
}

// Props para o componente StatusBadge
export interface StatusBadgeProps {
  status: Status
  domain: StatusDomain
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
  className?: string
}
