/**
 * Hooks React Query para Unidades - Queries
 * Operações de leitura com cache e estado reativo
 */

import { useQuery } from '@tanstack/react-query'
import {
  getUnidades,
  getUnidadeById,
  buscarUnidadesPorNome,
  getCaps,
  getCapById,
  buscarCapsPorNome,
  getTiposUnidade,
  getTiposAdministracao
} from '@/modules/Unidades/services/unidades-service'
import { unidadeKeys } from '@/modules/Unidades/lib/query-keys'
import type { FiltrosUnidadesApi } from '@/modules/Unidades/types/unidade-api'

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