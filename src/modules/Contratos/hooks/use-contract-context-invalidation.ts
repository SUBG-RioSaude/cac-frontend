/**
 * Hook para gerenciar invalidação inteligente do contexto do contrato
 * Evita invalidações desnecessárias e mantém UX fluida
 */

import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'

// Implementação simples de debounce
function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

interface UseContractContextInvalidationOptions {
  /**
   * Delay em ms para debounce das invalidações
   * @default 500
   */
  debounceDelay?: number
  
  /**
   * Se deve invalidar imediatamente sem debounce
   * @default false
   */
  immediate?: boolean
}

/**
 * Hook para invalidação inteligente do contexto do contrato
 * 
 * @param contratoId ID do contrato
 * @param options Opções de configuração
 * @returns Funções para invalidar o contexto
 */
export function useContractContextInvalidation(
  contratoId: string, 
  options: UseContractContextInvalidationOptions = {}
) {
  const { debounceDelay = 500, immediate = false } = options
  const queryClient = useQueryClient()
  
  /**
   * Invalidar todas as queries relacionadas ao contexto do contrato
   */
  const invalidateAll = useCallback(async () => {
    if (!contratoId) return
    
    console.log('🔄 Invalidating contract context queries for:', contratoId)
    
    await Promise.all([
      // Invalidar dados principais do contrato
      queryClient.invalidateQueries({
        queryKey: contratoKeys.detail(contratoId)
      }),
      
      // Refetch dados essenciais
      queryClient.refetchQueries({
        queryKey: contratoKeys.detail(contratoId)
      })
    ])
    
    console.log('✅ Contract context queries invalidated')
  }, [contratoId, queryClient])
  
  /**
   * Invalidação com debounce para evitar spam
   */
  const debouncedInvalidate = useMemo(
    () => debounce(() => {
      invalidateAll()
    }, debounceDelay),
    [invalidateAll, debounceDelay]
  )
  
  /**
   * Invalidar contexto - usa debounce por padrão
   */
  const invalidateContext = useCallback(() => {
    if (immediate) {
      invalidateAll()
    } else {
      debouncedInvalidate()
    }
  }, [immediate, invalidateAll, debouncedInvalidate])
  
  /**
   * Invalidar contexto imediatamente (sem debounce)
   */
  const invalidateContextImmediate = useCallback(() => {
    invalidateAll()
  }, [invalidateAll])
  
  /**
   * Invalidar apenas queries específicas de unidades
   */
  const invalidateUnitsOnly = useCallback(async () => {
    if (!contratoId) return
    
    console.log('🔄 Invalidating units queries for:', contratoId)
    
    // Para este caso, invalidamos o contexto completo pois as unidades
    // estão integradas no mesmo endpoint
    await invalidateAll()
  }, [contratoId, invalidateAll])
  
  return {
    invalidateContext,
    invalidateContextImmediate,
    invalidateUnitsOnly,
    invalidateAll
  }
}