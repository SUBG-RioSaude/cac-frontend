/**
 * Factory para Query Keys do módulo de Empresas
 * Padroniza as chaves de cache para consistência e invalidação eficiente
 */

import type { EmpresaParametros } from '../types/empresa'

export const empresaKeys = {
  // Base key para todas as empresas
  all: ['empresas'] as const,
  
  // Listas de empresas
  lists: () => [...empresaKeys.all, 'list'] as const,
  list: (filtros?: Partial<EmpresaParametros>) => [...empresaKeys.lists(), filtros] as const,
  
  // Empresa individual
  details: () => [...empresaKeys.all, 'detail'] as const,
  detail: (id: string) => [...empresaKeys.details(), id] as const,
  
  // Consulta por CNPJ
  byCnpjs: () => [...empresaKeys.all, 'cnpj'] as const,
  byCnpj: (cnpj: string) => [...empresaKeys.byCnpjs(), cnpj] as const,
  
  // Status de empresas
  status: () => [...empresaKeys.all, 'status'] as const,
  
  // Contatos de uma empresa
  contatos: (empresaId: string) => [...empresaKeys.detail(empresaId), 'contatos'] as const,
  contato: (empresaId: string, contatoId: string) => [...empresaKeys.contatos(empresaId), contatoId] as const,
  
  // Para mutations - keys que devem ser invalidadas
  invalidateOnCreate: () => [
    empresaKeys.lists(),
    empresaKeys.all,
    empresaKeys.status()
  ] as const,
  
  invalidateOnUpdate: (id: string) => [
    empresaKeys.detail(id),
    empresaKeys.lists(),
    empresaKeys.status()
  ] as const,
  
  invalidateOnDelete: (id: string) => [
    empresaKeys.detail(id),
    empresaKeys.lists(),
    empresaKeys.status(),
    empresaKeys.contatos(id)
  ] as const,

  // Para mutations de contatos
  invalidateOnContatoCreate: (empresaId: string) => [
    empresaKeys.detail(empresaId),
    empresaKeys.contatos(empresaId)
  ] as const,

  invalidateOnContatoUpdate: (empresaId: string, contatoId: string) => [
    empresaKeys.detail(empresaId),
    empresaKeys.contatos(empresaId),
    empresaKeys.contato(empresaId, contatoId)
  ] as const,

  invalidateOnContatoDelete: (empresaId: string, contatoId: string) => [
    empresaKeys.detail(empresaId),
    empresaKeys.contatos(empresaId),
    empresaKeys.contato(empresaId, contatoId)
  ] as const,

  // Fornecedores resumo
  fornecedoresResumos: () => [...empresaKeys.all, 'fornecedores-resumo'] as const,
  fornecedoresResumo: (filtros?: unknown) => [...empresaKeys.fornecedoresResumos(), filtros] as const,
}

// Tipo para garantir type safety das query keys
export type EmpresaQueryKey = 
  | readonly ['empresas']
  | readonly ['empresas', 'list']
  | readonly ['empresas', 'list', Partial<EmpresaParametros> | undefined]
  | readonly ['empresas', 'detail']
  | readonly ['empresas', 'detail', string]
  | readonly ['empresas', 'cnpj']
  | readonly ['empresas', 'cnpj', string]
  | readonly ['empresas', 'status']
  | readonly ['empresas', 'detail', string, 'contatos']
  | readonly ['empresas', 'detail', string, 'contatos', string]