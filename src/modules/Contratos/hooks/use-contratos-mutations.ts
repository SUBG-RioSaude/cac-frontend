/**
 * Hooks de mutations para contratos
 * Integra operações CRUD com TanStack React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/axios'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import { useToast } from '@/modules/Contratos/hooks/useToast'
import type { Contrato } from '@/modules/Contratos/types/contrato'

// Tipos para as mutations
interface CriarContratoData {
  numeroContrato?: string
  processoSei?: string
  categoriaObjeto?: string
  descricaoObjeto?: string
  tipoContratacao?: string
  tipoContrato?: string
  unidadeDemandante?: string
  unidadeGestora?: string
  contratacao?: string
  vigenciaInicial: string
  vigenciaFinal: string
  prazoInicialMeses: number
  valorGlobal: number
  formaPagamento?: string
  tipoTermoReferencia?: string
  termoReferencia?: string
  vinculacaoPCA?: string
  empresaId: string
  ativo: boolean
  unidadesVinculadas?: Array<{
    unidadeSaudeId: string
    valorAtribuido: number
    vigenciaInicialUnidade?: string
    vigenciaFinalUnidade?: string
    observacoes?: string
  }>
}

interface AtualizarContratoData extends Partial<CriarContratoData> {
  id: string
}

// Hook para criar contrato
export function useCreateContrato() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: CriarContratoData): Promise<Contrato> => {
      const response = await api.post('/Contratos', data)
      return response.data
    },

    onMutate: async () => {
      // Toast de loading
      return mutation.loading('Criando contrato')
    },

    onSuccess: (data, variables, context) => {
      // Dismiss loading toast
      if (context) {
        mutation.loading('').then(toast => toast && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      // Toast de sucesso
      mutation.success('Contrato criado', data.id)

      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contratoKeys.all })

      // Redirecionar para a página do contrato criado
      navigate(`/contratos/${data.id}`)
    },

    onError: (error, variables, context) => {
      // Dismiss loading toast
      if (context) {
        mutation.loading('').then(toast => toast && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      // Toast de erro com handling automático
      mutation.error('criar contrato', error)
    }
  })
}

// Hook para atualizar contrato
export function useUpdateContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: AtualizarContratoData): Promise<Contrato> => {
      const { id, ...updateData } = data
      const response = await api.put(`/Contratos/${id}`, updateData)
      return response.data
    },

    onMutate: async (data) => {
      // Toast de loading
      const loadingToast = mutation.loading('Atualizando contrato')

      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(data.id) })

      // Snapshot dos dados atuais para rollback
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(data.id))

      // Optimistic update
      queryClient.setQueryData(contratoKeys.detail(data.id), (old: Contrato | undefined) => old ? ({
        ...old,
        ...data
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (data, variables, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      // Toast de sucesso
      mutation.success('Contrato atualizado', data.id)

      // Invalidar caches relevantes
      const invalidateKeys = contratoKeys.invalidateOnUpdate(data.id)
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },

    onError: (error, variables, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      // Rollback optimistic update
      if (context?.previousContrato) {
        queryClient.setQueryData(
          contratoKeys.detail(variables.id), 
          context.previousContrato
        )
      }

      // Toast de erro
      mutation.error('atualizar contrato', error)
    }
  })
}

// Hook para deletar contrato (soft delete)
export function useDeleteContrato() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/Contratos/${id}`)
    },

    onMutate: async (id) => {
      // Toast de loading
      const loadingToast = mutation.loading('Removendo contrato')

      // Cancelar queries para evitar conflitos
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })

      // Snapshot para rollback
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      return { previousContrato, loadingToast }
    },

    onSuccess: (data, id, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      // Toast de sucesso
      mutation.success('Contrato removido')

      // Invalidar caches
      const invalidateKeys = contratoKeys.invalidateOnDelete(id)
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Redirecionar para lista de contratos
      navigate('/contratos')
    },

    onError: (error, id, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      // Toast de erro
      mutation.error('remover contrato', error)
    }
  })
}

// Hook para suspender contrato
export function useSuspendContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.patch(`/Contratos/${id}/suspender`)
    },

    onMutate: async (id) => {
      const loadingToast = mutation.loading('Suspendendo contrato')
      
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      queryClient.setQueryData(contratoKeys.detail(id), (old: Contrato | undefined) => old ? ({
        ...old,
        status: 'suspenso'
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (data, id, context) => {
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      mutation.success('Contrato suspenso')

      // Invalidar listas para refletir mudança de status
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, id, context) => {
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      // Rollback
      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(id), context.previousContrato)
      }

      mutation.error('suspender contrato', error)
    }
  })
}

// Hook para reativar contrato
export function useReactivateContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.patch(`/Contratos/${id}/reativar`)
    },

    onMutate: async (id) => {
      const loadingToast = mutation.loading('Reativando contrato')
      
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      queryClient.setQueryData(contratoKeys.detail(id), (old: Contrato | undefined) => old ? ({
        ...old,
        status: 'ativo'
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (data, id, context) => {
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      mutation.success('Contrato reativado')
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, id, context) => {
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(id), context.previousContrato)
      }

      mutation.error('reativar contrato', error)
    }
  })
}

// Hook para encerrar contrato
export function useEncerrarContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.patch(`/Contratos/${id}/encerrar`)
    },

    onMutate: async (id) => {
      const loadingToast = mutation.loading('Encerrando contrato')
      
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      queryClient.setQueryData(contratoKeys.detail(id), (old: Contrato | undefined) => old ? ({
        ...old,
        status: 'encerrado'
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (data, id, context) => {
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      mutation.success('Contrato encerrado')
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, id, context) => {
      if (context?.loadingToast) {
        context.loadingToast.then((toast: unknown) => toast && typeof toast === 'object' && toast !== null && 'dismiss' in toast && typeof toast.dismiss === 'function' && toast.dismiss())
      }

      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(id), context.previousContrato)
      }

      mutation.error('encerrar contrato', error)
    }
  })
}