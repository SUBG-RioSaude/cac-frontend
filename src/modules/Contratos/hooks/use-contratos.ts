/**
 * Hook para gerenciar contratos com TanStack React Query
 * Integra o service existente com cache, error handling e loading states
 */

import { useQuery } from '@tanstack/react-query'

import { useErrorHandler } from '@/hooks/use-error-handler'
import { createServiceLogger } from '@/lib/logger'
import { useToast } from '@/modules/Contratos/hooks/use-toast'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import {
  getContratos,
  getContratoDetalhado,
  type ContratoParametros,
} from '@/modules/Contratos/services/contratos-service'
import type { Contrato } from '@/modules/Contratos/types/contrato'

const logger = createServiceLogger('use-contratos')

export function useContratos(
  filtros: ContratoParametros = {},
  options?: {
    enabled?: boolean
    keepPreviousData?: boolean
    refetchOnMount?: boolean
  },
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
        const { status } = (error as { response: { status: number } }).response
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },

    throwOnError: (error: unknown) => {
      // Para erros críticos (5xx, 401, 403), usar o error handler que redireciona
      if (error && typeof error === 'object' && 'response' in error) {
        const { status } = (error as { response: { status: number } }).response

        if (status >= 500 || status === 401 || status === 403) {
          handleApiError(error)
          return true
        }
      }

      // Para outros erros, mostrar toast sem redirecionar
      toastQuery.error(error, 'Não foi possível carregar a lista de contratos')
      return false
    },
  })
}

// Hook especializado para buscar contrato por ID
export function useContrato(id: string, options?: { enabled?: boolean }) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.detail(id),
    queryFn: async () => {
      // Usar o fallback para buscar contrato por ID
      const response = await import('@/lib/axios').then(
        ({ executeWithFallback }) =>
          executeWithFallback<Contrato>({
            method: 'get',
            url: `/contratos/${id}`,
          }),
      )
      return response.data
    },

    enabled: options?.enabled ?? !!id,

    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const { status } = (error as { response: { status: number } }).response
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },

    throwOnError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const { status } = (error as { response: { status: number } }).response

        if (status === 404) {
          // Para 404, redirecionar para página específica
          handleApiError(error)
          return true
        }

        if (status >= 500 || status === 401 || status === 403) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(
        error,
        'Não foi possível carregar os detalhes do contrato',
      )
      return false
    },
  })
}

// Hook para contratos vencendo
export function useContratosVencendo(
  diasAntecipados = 30,
  options?: { enabled?: boolean },
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.vencendo(diasAntecipados),
    queryFn: async () => {
      const response = await import('@/lib/axios').then(
        ({ executeWithFallback }) =>
          executeWithFallback({
            method: 'get',
            url: '/contratos/vencendo',
            params: { diasAntecipados },
          }),
      )
      return response.data
    },

    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos

    throwOnError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const { status } = (error as { response: { status: number } }).response

        if (status >= 500 || status === 401 || status === 403) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(error, 'Não foi possível carregar contratos vencendo')
      return false
    },
  })
}

// Hook para contratos vencidos
export function useContratosVencidos(options?: { enabled?: boolean }) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.vencidos(),
    queryFn: async () => {
      const response = await import('@/lib/axios').then(
        ({ executeWithFallback }) =>
          executeWithFallback({
            method: 'get',
            url: '/contratos/vencidos',
          }),
      )
      return response.data
    },

    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos

    throwOnError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const { status } = (error as { response: { status: number } }).response

        if (status >= 500 || status === 401 || status === 403) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(error, 'Não foi possível carregar contratos vencidos')
      return false
    },
  })
}

// Hook especializado para buscar contrato detalhado
export function useContratoDetalhado(
  id: string,
  options?: { enabled?: boolean },
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.detalhado(id),
    queryFn: async () => {
      try {
        const resultado = await getContratoDetalhado(id)
        return resultado
      } catch (error) {
        logger.error('🎯 Hook: Erro capturado:', error as string)
        throw error
      }
    },

    enabled: options?.enabled ?? !!id,

    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object') {
        // Para timeouts, fazer mais tentativas
        if ('code' in error && error.code === 'ECONNABORTED') {
          return failureCount < 3 // 3 tentativas para timeouts
        }

        if ('response' in error) {
          const status = (error as { response: { status: number } }).response
            ?.status
          // Não retry para erros de cliente (4xx)
          if (status >= 400 && status < 500) {
            return false
          }
        }
      }
      return failureCount < 2
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial até 30s

    throwOnError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const { status } = (error as { response: { status: number } }).response

        if (status === 404) {
          // Para 404, redirecionar para página específica
          handleApiError(error)
          return true
        }

        if (status >= 500 || status === 401 || status === 403) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(
        error,
        'Não foi possível carregar os detalhes do contrato',
      )
      return false
    },
  })
}
