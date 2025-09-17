/**
 * ==========================================
 * QUERY KEYS PARA FUNCIONÁRIOS
 * ==========================================
 * Factory para Query Keys do módulo de funcionários
 * Padroniza as chaves de cache para consistência e invalidação eficiente
 */

import type { FuncionarioParametros, LotacaoParametros } from '@/modules/Funcionarios/types/funcionario-api'

export const funcionarioKeys = {
  // Base key para todos os funcionários
  all: ['funcionarios'] as const,
  
  // Listas de funcionários
  lists: () => [...funcionarioKeys.all, 'list'] as const,
  list: (filtros?: Partial<FuncionarioParametros>) => [...funcionarioKeys.lists(), filtros] as const,
  
  // Funcionário individual
  details: () => [...funcionarioKeys.all, 'detail'] as const,
  detail: (id: string) => [...funcionarioKeys.details(), id] as const,
  
  // Buscas específicas
  byMatricula: (matricula: string) => [...funcionarioKeys.all, 'matricula', matricula] as const,
  byCpf: (cpf: string) => [...funcionarioKeys.all, 'cpf', cpf] as const,
  
  // Buscas por contexto
  byLotacao: (lotacao: string) => [...funcionarioKeys.all, 'lotacao', lotacao] as const,
  byNome: (nome: string) => [...funcionarioKeys.all, 'nome', nome] as const,
  apenasAtivos: () => [...funcionarioKeys.all, 'ativos'] as const,
  
  // Para mutations - keys que devem ser invalidadas
  invalidateOnUpdate: (id: string) => [
    funcionarioKeys.detail(id),
    funcionarioKeys.lists(),
    funcionarioKeys.all
  ] as const,
  
  invalidateOnCreate: () => [
    funcionarioKeys.lists(),
    funcionarioKeys.all
  ] as const,
  
  invalidateOnDelete: (id: string) => [
    funcionarioKeys.detail(id),
    funcionarioKeys.lists(),
    funcionarioKeys.all
  ] as const,
}

export const lotacaoKeys = {
  // Base key para todas as lotações
  all: ['lotacoes'] as const,
  
  // Listas de lotações
  lists: () => [...lotacaoKeys.all, 'list'] as const,
  list: (filtros?: Partial<LotacaoParametros>) => [...lotacaoKeys.lists(), filtros] as const,
  
  // Lotação individual
  details: () => [...lotacaoKeys.all, 'detail'] as const,
  detail: (id: string) => [...lotacaoKeys.details(), id] as const,
  
  // Buscas específicas
  byCodigo: (codigo: string) => [...lotacaoKeys.all, 'codigo', codigo] as const,
  byNome: (nome: string) => [...lotacaoKeys.all, 'nome', nome] as const,
  apenasAtivas: () => [...lotacaoKeys.all, 'ativas'] as const,
  
  // Para mutations - keys que devem ser invalidadas
  invalidateOnUpdate: (id: string) => [
    lotacaoKeys.detail(id),
    lotacaoKeys.lists(),
    lotacaoKeys.all
  ] as const,
  
  invalidateOnCreate: () => [
    lotacaoKeys.lists(),
    lotacaoKeys.all
  ] as const,
  
  invalidateOnDelete: (id: string) => [
    lotacaoKeys.detail(id),
    lotacaoKeys.lists(),
    lotacaoKeys.all
  ] as const,
}

// Tipos para type safety
export type FuncionarioQueryKey = 
  | readonly ['funcionarios']
  | readonly ['funcionarios', 'list']
  | readonly ['funcionarios', 'list', Partial<FuncionarioParametros> | undefined]
  | readonly ['funcionarios', 'detail']
  | readonly ['funcionarios', 'detail', string]
  | readonly ['funcionarios', 'matricula', string]
  | readonly ['funcionarios', 'cpf', string]
  | readonly ['funcionarios', 'lotacao', string]
  | readonly ['funcionarios', 'nome', string]
  | readonly ['funcionarios', 'ativos']

export type LotacaoQueryKey = 
  | readonly ['lotacoes']
  | readonly ['lotacoes', 'list']
  | readonly ['lotacoes', 'list', Partial<LotacaoParametros> | undefined]
  | readonly ['lotacoes', 'detail']
  | readonly ['lotacoes', 'detail', string]
  | readonly ['lotacoes', 'codigo', string]
  | readonly ['lotacoes', 'nome', string]
  | readonly ['lotacoes', 'ativas']