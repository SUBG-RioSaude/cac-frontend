/**
 * Query Keys para React Query - Módulo Unidades
 * Padronização das chaves de cache e invalidação
 */

import type { FiltrosUnidadesApi } from '@/modules/Unidades/types/unidade-api'

export const unidadeKeys = {
  // Chave base
  all: ['unidades'] as const,

  // Listas
  lists: () => [...unidadeKeys.all, 'list'] as const,
  list: (filtros?: FiltrosUnidadesApi) => [...unidadeKeys.lists(), filtros] as const,

  // Detalhes
  details: () => [...unidadeKeys.all, 'detail'] as const,
  detail: (id: string) => [...unidadeKeys.details(), id] as const,

  // Busca
  searches: () => [...unidadeKeys.all, 'search'] as const,
  search: (nome: string) => [...unidadeKeys.searches(), nome] as const,

  // Auxiliares - CAPs
  caps: {
    all: ['caps'] as const,
    lists: () => [...unidadeKeys.caps.all, 'list'] as const,
    list: () => [...unidadeKeys.caps.lists()] as const,
    details: () => [...unidadeKeys.caps.all, 'detail'] as const,
    detail: (id: string) => [...unidadeKeys.caps.details(), id] as const,
    searches: () => [...unidadeKeys.caps.all, 'search'] as const,
    search: (nome: string) => [...unidadeKeys.caps.searches(), nome] as const,
  },

  // Auxiliares - Tipos
  tipos: {
    all: ['tipos'] as const,
    unidades: () => [...unidadeKeys.tipos.all, 'unidades'] as const,
    administracao: () => [...unidadeKeys.tipos.all, 'administracao'] as const,
  },

  // Invalidação automática
  invalidateOnCreate: () => [
    unidadeKeys.lists(),
    unidadeKeys.all
  ],

  invalidateOnUpdate: (id: string) => [
    unidadeKeys.detail(id),
    unidadeKeys.lists(),
    unidadeKeys.all
  ],

  invalidateOnDelete: (id: string) => [
    unidadeKeys.detail(id),
    unidadeKeys.lists(),
    unidadeKeys.all
  ]
}