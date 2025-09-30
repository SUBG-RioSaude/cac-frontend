/**
 * Hook otimizado para busca em lote de unidades
 * Resolve o problema de N+1 queries reduzindo múltiplas chamadas individuais
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useMemo } from 'react'

import { createServiceLogger } from '@/lib/logger'
import { unidadeKeys } from '@/modules/Unidades/lib/query-keys'
import { getUnidadeById } from '@/modules/Unidades/services/unidades-service'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

const logger = createServiceLogger('use-unidades-batch')

/**
 * Hook para busca otimizada de múltiplas unidades
 * Utiliza cache compartilhado e execução em lote para reduzir requests
 */
export function useUnidadesBatch(
  ids: string[],
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient()
  const [unidadesData, setUnidadesData] = useState<
    Partial<Record<string, UnidadeSaudeApi>>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const uniqueIds = useMemo(() => {
    return Array.from(new Set(ids.filter(Boolean)))
  }, [ids])

  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled || uniqueIds.length === 0) {
      return
    }

    const fetchUnidades = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const resultMap: Partial<Record<string, UnidadeSaudeApi>> = {}
        const idsToFetch: string[] = []

        // Verificar cache primeiro
        for (const id of uniqueIds) {
          const cached = queryClient.getQueryData<UnidadeSaudeApi>(
            unidadeKeys.detail(id),
          )
          if (cached) {
            resultMap[id] = cached
          } else {
            idsToFetch.push(id)
          }
        }

        // Buscar apenas os que não estão em cache, mas em lote usando Promise.allSettled
        if (idsToFetch.length > 0) {
          const promises = idsToFetch.map(async (id) => {
            try {
              const unidade = await getUnidadeById(id)
              // Cachear o resultado
              queryClient.setQueryData(unidadeKeys.detail(id), unidade)
              return { id, data: unidade, success: true }
            } catch (fetchError) {
              logger.warn({
                operation: 'buscar_unidade_batch',
                unidadeId: id,
                error: fetchError instanceof Error ? fetchError.message : String(fetchError)
              }, `Erro ao buscar unidade ${id}`)
              return { id, error: fetchError, success: false }
            }
          })

          const results = await Promise.allSettled(promises)

          results.forEach((result) => {
            if (
              result.status === 'fulfilled' &&
              result.value.success &&
              result.value.data
            ) {
              resultMap[result.value.id] = result.value.data
            }
          })
        }

        setUnidadesData(resultMap)
      } catch (err) {
        const errorObj = err as Error
        setError(errorObj)
        logger.error({
          operation: 'buscar_unidades_lote',
          error: errorObj.message,
          stack: errorObj.stack
        }, 'Erro ao buscar unidades em lote')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchUnidades()
  }, [uniqueIds, enabled, queryClient])

  return {
    data: unidadesData,
    isLoading,
    error,
    // Helper para obter nome da unidade
    getNome: (id: string) => {
      const unidade = unidadesData[id]
      return unidade?.nome ?? `Unidade ${id}`
    },
    // Verificar se uma unidade específica está carregando
    isUnidadeLoading: (id: string) => isLoading && !unidadesData[id],
  }
}

/**
 * Hook individual otimizado que usa o cache compartilhado
 * Para casos onde apenas uma unidade é necessária
 */
export function useUnidadeSingle(id: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: unidadeKeys.detail(id),
    queryFn: async () => {
      // Verificar se já está em cache de outro hook
      const cached = queryClient.getQueryData<UnidadeSaudeApi>(
        unidadeKeys.detail(id),
      )
      if (cached) {
        return cached
      }
      return await getUnidadeById(id)
    },
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    networkMode: 'online',
  })
}
