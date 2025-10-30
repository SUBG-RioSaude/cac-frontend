/**
 * Hook específico para contratos de uma empresa/fornecedor
 */

import { useQuery } from '@tanstack/react-query'

import { useErrorHandler } from '@/hooks/use-error-handler'
import { useToast } from '@/modules/Contratos/hooks/use-toast'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import {
  getContratosPorEmpresa,
  type ContratoParametros,
} from '@/modules/Contratos/services/contratos-service'

// Hook para buscar contratos de uma empresa específica
export function useContratosPorEmpresa(
  empresaId: string,
  filtros: Omit<ContratoParametros, 'empresaId'> = {},
  options?: {
    enabled?: boolean
    keepPreviousData?: boolean
  },
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: contratoKeys.porEmpresa(empresaId, filtros),
    queryFn: () => getContratosPorEmpresa(empresaId, filtros),

    enabled: options?.enabled !== false && !!empresaId,
    placeholderData: options?.keepPreviousData ? (prev) => prev : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos

    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const { status } = (error as { response: { status: number } }).response
        // Não retry para erros de cliente (4xx)
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
          // Para 404, não mostrar toast (empresa pode não ter contratos)
          return false
        }

        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(
        error,
        'Não foi possível carregar os contratos do fornecedor',
      )
      return false
    },
  })
}
