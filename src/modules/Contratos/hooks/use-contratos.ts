/**
 * Hook para gerenciar contratos com TanStack React Query
 * Integra o service existente com cache, error handling e loading states
 */

import { useQuery } from '@tanstack/react-query'
import { getContratos, type ContratoParametros } from '@/modules/Contratos/services/contratos-service'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import { useToast } from '@/modules/Contratos/hooks/useToast'
import { useErrorHandler } from '@/hooks/use-error-handler'
import type { Contrato } from '@/modules/Contratos/types/contrato'

export function useContratos(
  filtros: ContratoParametros = {},
  options?: {
    enabled?: boolean
    keepPreviousData?: boolean
    refetchOnMount?: boolean
  }
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.list(filtros),
    queryFn: () => getContratos(filtros),
    
    // Configurações específicas desta query
    enabled: options?.enabled ?? true,
    placeholderData: options?.keepPreviousData ? (prev) => prev : undefined,
    refetchOnMount: options?.refetchOnMount ?? true,
    
    // Error handling customizado
    retry: (failureCount, error: unknown) => {
      // Não retry para erros de cliente (4xx)
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },

    onError: (error: unknown) => {
      // Para erros críticos (5xx, 401, 403), usar o error handler que redireciona
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return
        }
      }

      // Para outros erros, mostrar toast sem redirecionar
      toastQuery.error(error, "Não foi possível carregar a lista de contratos")
    }
  })
}

// Hook especializado para buscar contrato por ID
export function useContrato(id: string, options?: { enabled?: boolean }) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.detail(id),
    queryFn: async () => {
      // Usar o service existente ou criar um novo método
      const { data } = await import('@/lib/axios').then(({ api }) => 
        api.get<Contrato>(`/Contratos/${id}`)
      )
      return data
    },
    
    enabled: options?.enabled ?? !!id,
    
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },

    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        if (status === 404) {
          // Para 404, redirecionar para página específica
          handleApiError(error)
          return
        }
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return
        }
      }

      toastQuery.error(error, "Não foi possível carregar os detalhes do contrato")
    }
  })
}

// Hook para contratos vencendo
export function useContratosVencendo(diasAntecipados = 30, options?: { enabled?: boolean }) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.vencendo(diasAntecipados),
    queryFn: async () => {
      const { data } = await import('@/lib/axios').then(({ api }) => 
        api.get('/Contratos/vencendo', {
          params: { diasAntecipados }
        })
      )
      return data
    },
    
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return
        }
      }

      toastQuery.error(error, "Não foi possível carregar contratos vencendo")
    }
  })
}

// Hook para contratos vencidos
export function useContratosVencidos(options?: { enabled?: boolean }) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.vencidos(),
    queryFn: async () => {
      const { data } = await import('@/lib/axios').then(({ api }) => 
        api.get('/Contratos/vencidos')
      )
      return data
    },
    
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return
        }
      }

      toastQuery.error(error, "Não foi possível carregar contratos vencidos")
    }
  })
}