/**
 * Hooks React Query para Unidades - Queries
 * Operações de leitura com cache e estado reativo
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import {
  getUnidades,
  getUnidadeById,
  buscarUnidadesPorNome,
  buscarUnidadesPorNomeOuSigla,
  getCaps,
  getCapById,
  buscarCapsPorNome,
  getTiposUnidade,
  getTiposAdministracao
} from '@/modules/Unidades/services/unidades-service'
import { unidadeKeys } from '@/modules/Unidades/lib/query-keys'
import type { FiltrosUnidadesApi, UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

// ========== QUERIES PRINCIPAIS - UNIDADES ==========

interface UseUnidadesOptions {
  enabled?: boolean
  keepPreviousData?: boolean
  refetchOnMount?: boolean
}

export function useUnidades(
  filtros?: FiltrosUnidadesApi, 
  options?: UseUnidadesOptions
) {
  return useQuery({
    queryKey: unidadeKeys.list(filtros),
    queryFn: async () => {
      return await getUnidades(filtros)
    },
    enabled: options?.enabled ?? true,
    placeholderData: options?.keepPreviousData ? (prev) => prev : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always'
  })
}

export function useUnidade(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.detail(id),
    queryFn: async () => {
      return await getUnidadeById(id)
    },
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always'
  })
}

export function useBuscarUnidades(nome: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.search(nome),
    queryFn: async () => {
      return await buscarUnidadesPorNomeOuSigla(nome)
    },
    enabled: (options?.enabled ?? true) && nome.trim().length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

/**
 * Hook para buscar unidades apenas por nome (comportamento original)
 * Mantido para compatibilidade se necessário
 */
export function useBuscarUnidadesPorNome(nome: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.search(nome),
    queryFn: async () => {
      return await buscarUnidadesPorNome(nome)
    },
    enabled: (options?.enabled ?? true) && nome.trim().length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

// ========== QUERIES AUXILIARES - CAPS ==========

export function useCaps(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.caps.list(),
    queryFn: async () => {
      return await getCaps()
    },
    enabled: options?.enabled ?? true,
    staleTime: 10 * 60 * 1000, // 10 minutos - dados relativamente estáticos
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

export function useCap(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.caps.detail(id),
    queryFn: async () => {
      return await getCapById(id)
    },
    enabled: options?.enabled ?? !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

export function useBuscarCaps(nome: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.caps.search(nome),
    queryFn: async () => {
      return await buscarCapsPorNome(nome)
    },
    enabled: (options?.enabled ?? true) && nome.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

// ========== QUERIES AUXILIARES - TIPOS ==========

export function useTiposUnidade(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.tipos.unidades(),
    queryFn: async () => {
      return await getTiposUnidade()
    },
    enabled: options?.enabled ?? true,
    staleTime: 30 * 60 * 1000, // 30 minutos - dados muito estáticos
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

export function useTiposAdministracao(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: unidadeKeys.tipos.administracao(),
    queryFn: async () => {
      return await getTiposAdministracao()
    },
    enabled: options?.enabled ?? true,
    staleTime: 30 * 60 * 1000, // 30 minutos - dados muito estáticos
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}

// ========== HOOK PARA MÚLTIPLAS UNIDADES - OTIMIZADO ==========

/**
 * Hook otimizado para buscar múltiplas unidades por ID usando cache compartilhado
 * Reduz significativamente o número de requisições através de deduplicação inteligente
 */
export function useUnidadesByIds(
  ids: string[],
  options?: { enabled?: boolean }
) {
  const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)))
  
  // Usar useQueries com configurações otimizadas para reduzir requests
  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: unidadeKeys.detail(id),
      queryFn: async () => await getUnidadeById(id),
      enabled: (options?.enabled ?? true) && !!id,
      staleTime: 10 * 60 * 1000, // 10 minutos - aumentado para reduzir refetches
      gcTime: 15 * 60 * 1000, // 15 minutos - cache mais longo
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // Não refetch se já tem dados em cache
      // Configurações importantes para reduzir requests
      retry: 1, // Reduzir tentativas de retry
      retryDelay: 1000,
      networkMode: 'online' as const
    }))
  })

  // Processar resultados manualmente
  const map = uniqueIds.reduce<Record<string, UnidadeSaudeApi>>((acc, id, idx) => {
    const q = queries[idx]
    if (q?.data) acc[id] = q.data as UnidadeSaudeApi
    return acc
  }, {})

  const isLoading = queries.some(q => q.isLoading && !q.data)
  const isFetching = queries.some(q => q.isFetching)
  const error = queries.find(q => q.error)?.error

  return {
    data: map,
    isLoading,
    isFetching,
    error
  }
}