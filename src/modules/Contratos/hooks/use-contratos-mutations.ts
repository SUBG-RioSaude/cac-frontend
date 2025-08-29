/**
 * Hooks de mutations para contratos
 * Integra operações CRUD com TanStack React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { executeWithFallback } from '@/lib/axios'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import { useToast } from '@/modules/Contratos/hooks/useToast'
import type { Contrato } from '@/modules/Contratos/types/contrato'

// Tipos para as mutations

export interface CriarContratoData {
  numeroContrato?: string
  processoSei?: string
  categoriaObjeto?: string
  descricaoObjeto?: string
  tipoContratacao?: string
  tipoContrato?: string
  unidadeDemandanteId?: string
  unidadeGestoraId?: string
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
  ativo?: boolean
  unidadesVinculadas?: Array<{
    unidadeSaudeId: string
    valorAtribuido: number
    observacoes?: string
  }>
  documentos?: Array<{
    tipoDocumento: string
    urlDocumento: string
    dataEntrega: string
    observacoes?: string
  }>
  funcionarios?: Array<{
    funcionarioId: string
    tipoGerencia: 1 | 2 // 1=Gestor, 2=Fiscal
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
      const response = await executeWithFallback<Contrato>({
        method: 'post',
        url: '/Contratos',
        data
      })
      return response.data
    },

    onMutate: async () => {
      // Toast de loading
      const loadingToast = mutation.loading('Criando contrato')
      return { loadingToast }
    },

    onSuccess: (data, _variables, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Toast de sucesso
      mutation.success('Contrato criado', data.id)

      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contratoKeys.all })

      // Redirecionar para a página do contrato criado
      navigate(`/contratos/${data.id}`)
    },

    onError: (error, _variables, context) => {
      // Dismiss loading toast
      if (context?.loadingToast) {
        toast.dismiss(context.loadingToast)
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
      const response = await executeWithFallback<Contrato>({
        method: 'put',
        url: `/Contratos/${id}`,
        data: updateData
      })
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

    onSuccess: (data, _variables, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.success call
      }

      // Toast de sucesso
      mutation.success('Contrato atualizado', data.id)

      // Invalidar caches relevantes
      const invalidateKeys = contratoKeys.invalidateOnUpdate(data.id)
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },

    onError: (error, _variables, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.error call
      }

      // Rollback optimistic update
      if (context?.previousContrato) {
        queryClient.setQueryData(
          contratoKeys.detail(_variables.id), 
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
      await executeWithFallback({
        method: 'delete',
        url: `/Contratos/${id}`
      })
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

    onSuccess: (_data, id, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.success call
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

    onError: (error, _id, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.error call
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
      await executeWithFallback({
        method: 'patch',
        url: `/Contratos/${id}/suspender`
      })
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

    onSuccess: (_data, _id, context) => {
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.success call
      }

      mutation.success('Contrato suspenso')

      // Invalidar listas para refletir mudança de status
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, _id, context) => {
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.error call
      }

      // Rollback
      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(_id), context.previousContrato)
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
      await executeWithFallback({
        method: 'patch',
        url: `/Contratos/${id}/reativar`
      })
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

    onSuccess: (_data, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      mutation.success('Contrato reativado')
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(_id), context.previousContrato)
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
      await executeWithFallback({
        method: 'patch',
        url: `/Contratos/${id}/encerrar`
      })
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

    onSuccess: (_data, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      mutation.success('Contrato encerrado')
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(_id), context.previousContrato)
      }

      mutation.error('encerrar contrato', error)
    }
  })
}