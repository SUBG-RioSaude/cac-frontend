/**
 * Hooks para gerenciar empresas/fornecedores com TanStack React Query
 * Integra o service existente com cache, error handling e loading states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cadastrarEmpresa, consultarEmpresaPorCNPJ } from '@/modules/Contratos/services/contratos-service'
import { empresaKeys } from '@/modules/Contratos/lib/query-keys'
import { useToast } from './useToast'
import { useErrorHandler } from '@/hooks/use-error-handler'
import type { EmpresaRequest, EmpresaResponse } from '@/modules/Contratos/types/empresa'

/**
 * Hook para consultar empresa por CNPJ
 * Usado para verificar se a empresa já está cadastrada
 */
export function useConsultarEmpresaPorCNPJ(
  cnpj: string,
  options?: {
    enabled?: boolean
    onSuccess?: (data: EmpresaResponse) => void
    onError?: (error: unknown) => void
  }
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: empresaKeys.byCnpj(cnpj),
    queryFn: () => consultarEmpresaPorCNPJ(cnpj),
    
    // Só executa quando o CNPJ for válido e completo
    enabled: options?.enabled ?? (!!cnpj && cnpj.length >= 18),
    
    // Não retry para CNPJs não encontrados (404)
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        if (status === 404) {
          return false // Não retry para 404
        }
      }
      return failureCount < 2
    },

    // Error handling customizado
    throwOnError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        // Para erros críticos (5xx, 401, 403), usar o error handler
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return true
        }
        
        // Para 404 (empresa não encontrada), não é um erro crítico
        if (status === 404) {
          return false
        }
      }

      // Para outros erros, mostrar toast sem redirecionar
      toastQuery.error(error, "Erro ao consultar empresa por CNPJ")
      return false
    },

    // Callbacks
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    
    // Cache por 5 minutos para consultas de CNPJ
    staleTime: 5 * 60 * 1000,
    
    // Não refetch automaticamente
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

/**
 * Hook para cadastrar nova empresa
 * Mutation para operação de POST
 */
export function useCadastrarEmpresa() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: EmpresaRequest): Promise<EmpresaResponse> => {
      return await cadastrarEmpresa(data)
    },

    onMutate: async () => {
      // Toast de loading
      const loadingToast = mutation.loading('Cadastrando empresa')
      return { loadingToast }
    },

    onSuccess: (data, variables, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Toast de sucesso
      mutation.success('Empresa cadastrada com sucesso', data.id)

      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: empresaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: empresaKeys.all })
      
      // Invalidar cache específico do CNPJ cadastrado
      queryClient.invalidateQueries({ 
        queryKey: empresaKeys.byCnpj(variables.cnpj) 
      })
    },

    onError: (error, _variables, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Toast de erro com handling automático
      mutation.error('cadastrar empresa', error)
    }
  })
}

/**
 * Hook para buscar empresa por ID
 * Query para operação de GET
 */
export function useEmpresa(id: string, options?: { enabled?: boolean }) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: empresaKeys.detail(id),
    queryFn: async () => {
      // Usar o service existente ou criar um novo método
      const { api } = await import('@/lib/axios')
      const { data } = await api.get<EmpresaResponse>(`/api/Empresas/${id}`, {
        baseURL: import.meta.env.VITE_API_URL_EMPRESA
      })
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

    throwOnError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        if (status === 404) {
          // Para 404, redirecionar para página específica
          handleApiError(error)
          return true
        }
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(error, "Não foi possível carregar os detalhes da empresa")
      return false
    }
  })
}

/**
 * Hook para listar empresas com filtros
 * Query para operação de GET com paginação
 */
export function useEmpresas(
  filtros?: any,
  options?: {
    enabled?: boolean
    keepPreviousData?: boolean
    refetchOnMount?: boolean
  }
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: empresaKeys.list(filtros),
    queryFn: async () => {
      // Usar o service existente ou criar um novo método
      const { api } = await import('@/lib/axios')
      const { data } = await api.get('/api/Empresas', {
        baseURL: import.meta.env.VITE_API_URL_EMPRESA,
        params: filtros
      })
      return data
    },
    
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

    throwOnError: (error: unknown) => {
      // Para erros críticos (5xx, 401, 403), usar o error handler que redireciona
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return true
        }
      }

      // Para outros erros, mostrar toast sem redirecionar
      toastQuery.error(error, "Não foi possível carregar a lista de empresas")
      return false
    }
  })
}
