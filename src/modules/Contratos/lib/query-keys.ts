/**
 * Factory para Query Keys do módulo de contratos
 * Padroniza as chaves de cache para consistência e invalidação eficiente
 */

import type { ContratoParametros } from '@/modules/Contratos/services/contratos-service'

export const contratoKeys = {
  // Base key para todos os contratos
  all: ['contratos'] as const,
  
  // Listas de contratos
  lists: () => [...contratoKeys.all, 'list'] as const,
  list: (filtros?: Partial<ContratoParametros>) => [...contratoKeys.lists(), filtros] as const,
  
  // Contrato individual
  details: () => [...contratoKeys.all, 'detail'] as const,
  detail: (id: string) => [...contratoKeys.details(), id] as const,
  
  // Queries relacionadas
  related: (id: string) => [...contratoKeys.all, 'related', id] as const,
  
  // Queries específicas por contexto
  byEmpresa: (empresaId: string) => [...contratoKeys.all, 'empresa', empresaId] as const,
  byUnidade: (unidadeId: string) => [...contratoKeys.all, 'unidade', unidadeId] as const,
  vencendo: (dias?: number) => [...contratoKeys.all, 'vencendo', dias] as const,
  vencidos: () => [...contratoKeys.all, 'vencidos'] as const,
  
  // Para mutations - keys que devem ser invalidadas
  invalidateOnCreate: () => [
    contratoKeys.lists(),
    contratoKeys.all
  ] as const,
  
  invalidateOnUpdate: (id: string) => [
    contratoKeys.detail(id),
    contratoKeys.lists(),
    contratoKeys.related(id)
  ] as const,
  
  invalidateOnDelete: (id: string) => [
    contratoKeys.detail(id),
    contratoKeys.lists(),
    contratoKeys.related(id)
  ] as const
}

// Query keys para empresas/fornecedores
export const empresaKeys = {
  // Base key para todas as empresas
  all: ['empresas'] as const,
  
  // Listas de empresas
  lists: () => [...empresaKeys.all, 'list'] as const,
  list: (filtros?: any) => [...empresaKeys.all, 'list', filtros] as const,
  
  // Empresa individual
  details: () => [...empresaKeys.all, 'detail'] as const,
  detail: (id: string) => [...empresaKeys.all, 'detail', id] as const,
  
  // Consulta por CNPJ
  byCnpj: (cnpj: string) => [...empresaKeys.all, 'cnpj', cnpj] as const,
  
  // Para mutations - keys que devem ser invalidadas
  invalidateOnCreate: () => [
    empresaKeys.lists(),
    empresaKeys.all
  ] as const,
  
  invalidateOnUpdate: (id: string) => [
    empresaKeys.detail(id),
    empresaKeys.lists(),
    empresaKeys.byCnpj(id)
  ] as const,
  
  invalidateOnDelete: (id: string) => [
    empresaKeys.detail(id),
    empresaKeys.lists(),
    empresaKeys.byCnpj(id)
  ] as const
}

// Tipo para garantir type safety - definindo tipos específicos
export type ContratoQueryKey = 
  | readonly ['contratos']
  | readonly ['contratos', 'list']
  | readonly ['contratos', 'list', Partial<ContratoParametros> | undefined]
  | readonly ['contratos', 'detail']
  | readonly ['contratos', 'detail', string]

export type EmpresaQueryKey = 
  | readonly ['empresas']
  | readonly ['empresas', 'list']
  | readonly ['empresas', 'list', any]
  | readonly ['empresas', 'detail']
  | readonly ['empresas', 'detail', string]
  | readonly ['empresas', 'cnpj', string]