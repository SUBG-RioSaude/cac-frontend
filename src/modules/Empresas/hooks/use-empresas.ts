/**
 * Hooks para gerenciar empresas/fornecedores com TanStack React Query
 * Integra o service existente com cache, error handling e loading states
 */

import React from 'react'
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query'
import { toast } from 'sonner'
import { empresaKeys } from '../lib/query-keys'
import { useToast } from '@/modules/Contratos/hooks/useToast'
import { useErrorHandler } from '@/hooks/use-error-handler'
import type { 
  EmpresaRequest, 
  EmpresaResponse, 
  AtualizarEmpresaDto,
  EmpresaParametros,
  CriarContatoDto,
  AtualizarContatoDto,
  ContatoResponse,
  ContatoOperationData
} from '../types/empresa'
import type { FiltrosFornecedorApi } from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'
import { 
  consultarEmpresaPorCNPJ, 
  cadastrarEmpresa,
  getEmpresas,
  getEmpresaById,
  updateEmpresa,
  deleteEmpresa,
  getEmpresasStatus,
  createContato,
  updateContato,
  deleteContato,
  getFornecedoresResumo
} from '../services/empresa-service'

// ========== HOOKS EXISTENTES (PRESERVADOS) ==========

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

  const query = useQuery({
    queryKey: empresaKeys.byCnpj(cnpj),
    queryFn: async () => {
      const result = await consultarEmpresaPorCNPJ(cnpj)
      if (result === null) {
        throw new Error('Empresa não encontrada')
      }
      return result
    },
    
    enabled: options?.enabled ?? (!!cnpj && cnpj.length === 14 && /^\d{14}$/.test(cnpj)),
    
    retry: (failureCount, error: unknown) => {
      if (error instanceof Error && error.message === 'Empresa não encontrada') {
        return false
      }
      
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        if (status === 404) {
          return false
        }
      }
      return failureCount < 2
    },

    throwOnError: (error: unknown) => {
      if (error instanceof Error && error.message === 'Empresa não encontrada') {
        return false
      }
      
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return true
        }
        
        if (status === 404) {
          return false
        }
      }

      toastQuery.error(error, "Erro ao consultar empresa por CNPJ")
      return false
    },
    
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })

  React.useEffect(() => {
    if (query.data && options?.onSuccess) {
      options.onSuccess(query.data)
    }
  }, [query.data, options?.onSuccess, options])

  React.useEffect(() => {
    if (query.error && options?.onError) {
      options.onError(query.error)
    }
  }, [query.error, options?.onError, options])

  return query
}

/**
 * Hook para cadastrar nova empresa
 * Mutation para operação de POST
 */
export function useCadastrarEmpresa() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  const mutationResult = useMutation({
    mutationFn: async (data: EmpresaRequest): Promise<EmpresaResponse> => {
      return await cadastrarEmpresa(data)
    },

    onMutate: async () => {
      const loadingToast = mutation.loading('Cadastrando empresa')
      return { loadingToast }
    },

    onSuccess: (data, variables, context) => {
      if (context?.loadingToast) {
        toast.success('Empresa cadastrada com sucesso', {
          id: context.loadingToast,
          description: `ID: ${data.id}`,
          duration: 3000,
        })
      } else {
        mutation.success('Empresa cadastrada com sucesso', data.id)
      }

      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: empresaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: empresaKeys.all })
      queryClient.invalidateQueries({ queryKey: empresaKeys.status() })
      
      // Invalidar cache específico do CNPJ cadastrado
      queryClient.invalidateQueries({ 
        queryKey: empresaKeys.byCnpj(variables.cnpj) 
      })
    },

    onError: (error, _variables, context) => {
      if (context?.loadingToast) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        toast.error('Erro ao cadastrar empresa', {
          id: context.loadingToast,
          description: errorMessage,
          duration: 5000,
        })
      } else {
        mutation.error('cadastrar empresa', error)
      }
    }
  })

  return {
    ...mutationResult,
    resetMutation: () => mutationResult.reset()
  }
}

// ========== NOVOS HOOKS ==========

/**
 * Hook para listar empresas com paginação e filtros
 */
export function useEmpresas(
  parametros?: EmpresaParametros,
  options?: {
    enabled?: boolean
    keepPreviousData?: boolean
    refetchOnMount?: boolean
  }
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: empresaKeys.list(parametros),
    queryFn: async () => {
      return await getEmpresas(parametros)
    },
    
    enabled: options?.enabled ?? true,
    placeholderData: options?.keepPreviousData ? (prev) => prev : undefined,
    refetchOnMount: options?.refetchOnMount ?? true,
    
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
        
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(error, "Não foi possível carregar a lista de empresas")
      return false
    }
  })
}

/**
 * Hook para buscar empresa por ID
 */
export function useEmpresa(id: string, options?: { enabled?: boolean }) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()

  return useQuery({
    queryKey: empresaKeys.detail(id),
    queryFn: async () => {
      return await getEmpresaById(id)
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
 * Hook para atualizar empresa
 */
export function useUpdateEmpresa() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: { id: string, dados: AtualizarEmpresaDto }): Promise<EmpresaResponse> => {
      return await updateEmpresa(data.id, data.dados)
    },

    onMutate: async () => {
      const loadingToast = mutation.loading('Atualizando empresa')
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context?.loadingToast) {
        try {
          toast.dismiss(context.loadingToast)
        } catch (error) {
          // Ignora erro se o toast já foi dismissado
        }
      }

      mutation.success('Empresa atualizada com sucesso')

      // Invalidar caches específicos
      empresaKeys.invalidateOnUpdate(variables.id).forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    },

    onError: (error, _variables, context) => {
      if (context?.loadingToast) {
        try {
          toast.dismiss(context.loadingToast)
        } catch (error) {
          // Ignora erro se o toast já foi dismissado
        }
      }

      mutation.error('atualizar empresa', error)
    }
  })
}

/**
 * Hook para excluir empresa
 */
export function useDeleteEmpresa() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return await deleteEmpresa(id)
    },

    onMutate: async () => {
      const loadingToast = mutation.loading('Excluindo empresa')
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context?.loadingToast) {
        try {
          toast.dismiss(context.loadingToast)
        } catch (error) {
          // Ignora erro se o toast já foi dismissado
        }
      }

      mutation.success('Empresa excluída com sucesso')

      // Invalidar caches específicos
      empresaKeys.invalidateOnDelete(variables).forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    },

    onError: (error, _variables, context) => {
      if (context?.loadingToast) {
        try {
          toast.dismiss(context.loadingToast)
        } catch (error) {
          // Ignora erro se o toast já foi dismissado
        }
      }

      mutation.error('excluir empresa', error)
    }
  })
}

/**
 * Hook para buscar status de empresas
 */
export function useEmpresasStatus() {
  const { query: toastQuery } = useToast()

  return useQuery({
    queryKey: empresaKeys.status(),
    queryFn: async () => {
      return await getEmpresasStatus()
    },
    
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
    
    throwOnError: (error: unknown) => {
      toastQuery.error(error, "Erro ao carregar status das empresas")
      return false
    }
  })
}

// ========== HOOKS PARA CONTATOS ==========

/**
 * Hook para criar contato
 */
export function useCreateContato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: ContatoOperationData): Promise<ContatoResponse> => {
      return await createContato(data.empresaId, data.contato as CriarContatoDto)
    },

    onSuccess: (_data, variables) => {
      mutation.success('Contato criado com sucesso')

      empresaKeys.invalidateOnContatoCreate(variables.empresaId).forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    },

    onError: (error) => {
      mutation.error('criar contato', error)
    }
  })
}

/**
 * Hook para atualizar contato
 */
export function useUpdateContato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: ContatoOperationData): Promise<ContatoResponse> => {
      if (!data.contatoId) {
        throw new Error('ID do contato é obrigatório para atualização')
      }
      return await updateContato(data.empresaId, data.contatoId, data.contato as AtualizarContatoDto)
    },

    onSuccess: (_data, variables) => {
      mutation.success('Contato atualizado com sucesso')

      if (variables.contatoId) {
        empresaKeys.invalidateOnContatoUpdate(variables.empresaId, variables.contatoId).forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
    },

    onError: (error) => {
      mutation.error('atualizar contato', error)
    }
  })
}

/**
 * Hook para excluir contato
 */
export function useDeleteContato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: { empresaId: string, contatoId: string }): Promise<void> => {
      return await deleteContato(data.empresaId, data.contatoId)
    },

    onSuccess: (_data, variables) => {
      mutation.success('Contato excluído com sucesso')

      empresaKeys.invalidateOnContatoDelete(variables.empresaId, variables.contatoId).forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    },

    onError: (error) => {
      mutation.error('excluir contato', error)
    }
  })
}

// ========== HOOKS PARA FORNECEDORES RESUMO ==========

/**
 * Hook para listar fornecedores com resumo de contratos
 * Substitui o Zustand store por React Query
 */
export function useFornecedoresResumo(
  filtros?: FiltrosFornecedorApi,
  options?: {
    enabled?: boolean
    keepPreviousData?: boolean
    refetchOnMount?: boolean
  }
) {
  const { query: toastQuery } = useToast()
  const { handleApiError } = useErrorHandler()


  const queryKey = empresaKeys.fornecedoresResumo(filtros)

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getFornecedoresResumo(filtros)
      return result
    },

    enabled: options?.enabled ?? true,
    placeholderData: options?.keepPreviousData ? (prev) => prev : undefined,
    refetchOnMount: options?.refetchOnMount ?? true,

    // Cache reduzido para debug - originalmente 2 minutos
    staleTime: 0, // Desabilitado temporariamente para debug

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

        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
          return true
        }
      }

      toastQuery.error(error, "Não foi possível carregar a lista de fornecedores")
      return false
    }
  })
}

/**
 * Hook para buscar múltiplas empresas por ID e retornar um mapa id->empresa
 */
export function useEmpresasByIds(
  ids: string[],
  options?: { enabled?: boolean }
) {
  const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)))
  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: empresaKeys.detail(id),
      queryFn: async () => await getEmpresaById(id),
      enabled: (options?.enabled ?? true) && !!id,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }))
  })

  const map = uniqueIds.reduce<Record<string, EmpresaResponse>>((acc, id, idx) => {
    const q = queries[idx]
    if (q?.data) acc[id] = q.data as EmpresaResponse
    return acc
  }, {})

  const isLoading = queries.some(q => q.isLoading)
  const isFetching = queries.some(q => q.isFetching)
  const error = queries.find(q => q.error)?.error

  return { data: map, isLoading, isFetching, error }
}
