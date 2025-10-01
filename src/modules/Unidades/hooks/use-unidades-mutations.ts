/**
 * Hooks React Query para Unidades - Mutations
 * Operações CRUD com toast feedback e invalidação automática
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { createHookLogger } from '@/lib/logger'
import { unidadeKeys } from '@/modules/Unidades/lib/query-keys'
import {
  createUnidade,
  updateUnidade,
  deleteUnidade,
} from '@/modules/Unidades/services/unidades-service'
import type {
  UnidadeSaudeApi,
  UnidadeSaudeCreateApi,
  UnidadeSaudeUpdateApi,
} from '@/modules/Unidades/types/unidade-api'

// ========== HOOK PARA CRIAR UNIDADE ==========

export function useCreateUnidade() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const logger = createHookLogger('useCreateUnidade', 'Unidades')

  return useMutation({
    mutationFn: async (
      data: UnidadeSaudeCreateApi,
    ): Promise<UnidadeSaudeApi> => {
      return await createUnidade(data)
    },

    onMutate: () => {
      // Toast de loading
      const loadingToast = toast.loading('Criando unidade de saúde...')
      return { loadingToast }
    },

    onSuccess: (data, _variables, context) => {
      // Dismiss loading toast
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Toast de sucesso
      toast.success('Unidade de saúde criada com sucesso', {
        description: `Unidade "${data.nome}" foi criada`,
      })

      // Invalidar caches relevantes
      const invalidateKeys = unidadeKeys.invalidateOnCreate()
      invalidateKeys.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key })
      })

      // Redirecionar para a página da unidade criada
      navigate(`/unidades/${data.id}`)
    },

    onError: (error, _variables, context) => {
      // Dismiss loading toast
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Log de erro
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        'Erro ao criar unidade',
      )
      toast.error('Erro ao criar unidade de saúde', {
        description:
          error instanceof Error
            ? error.message
            : 'Tente novamente em alguns instantes',
      })
    },
  })
}

// ========== HOOK PARA ATUALIZAR UNIDADE ==========

export function useUpdateUnidade() {
  const queryClient = useQueryClient()
  const logger = createHookLogger('useUpdateUnidade', 'Unidades')

  return useMutation({
    mutationFn: async (
      data: UnidadeSaudeUpdateApi,
    ): Promise<UnidadeSaudeApi> => {
      return await updateUnidade(data)
    },

    onMutate: async (data) => {
      // Toast de loading
      const loadingToast = toast.loading('Atualizando unidade de saúde...')

      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey: unidadeKeys.detail(data.id) })

      // Snapshot dos dados atuais para rollback
      const previousUnidade = queryClient.getQueryData(
        unidadeKeys.detail(data.id),
      )

      // Optimistic update
      queryClient.setQueryData(
        unidadeKeys.detail(data.id),
        (old: UnidadeSaudeApi | undefined) => (old ? { ...old, ...data } : old),
      )

      return { previousUnidade, loadingToast }
    },

    onSuccess: (data, _variables, context) => {
      // Dismiss loading toast
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Toast de sucesso
      toast.success('Unidade de saúde atualizada', {
        description: `Unidade "${data.nome}" foi atualizada com sucesso`,
      })

      // Invalidar caches relevantes
      const invalidateKeys = unidadeKeys.invalidateOnUpdate(data.id)
      invalidateKeys.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key })
      })
    },

    onError: (error, variables, context) => {
      // Dismiss loading toast
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Rollback optimistic update
      if (context.previousUnidade) {
        queryClient.setQueryData(
          unidadeKeys.detail(variables.id),
          context.previousUnidade,
        )
      }

      // Log de erro
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          unidadeId: variables.id,
        },
        'Erro ao atualizar unidade',
      )
      toast.error('Erro ao atualizar unidade de saúde', {
        description:
          error instanceof Error
            ? error.message
            : 'Tente novamente em alguns instantes',
      })
    },
  })
}

// ========== HOOK PARA DELETAR UNIDADE ==========

export function useDeleteUnidade() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const logger = createHookLogger('useDeleteUnidade', 'Unidades')

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await deleteUnidade(id)
    },

    onMutate: async (id) => {
      // Toast de loading
      const loadingToast = toast.loading('Removendo unidade de saúde...')

      // Cancelar queries para evitar conflitos
      await queryClient.cancelQueries({ queryKey: unidadeKeys.detail(id) })

      // Snapshot para rollback
      const previousUnidade = queryClient.getQueryData(unidadeKeys.detail(id))

      return { previousUnidade, loadingToast }
    },

    onSuccess: (_data, id, context) => {
      // Dismiss loading toast
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Toast de sucesso
      toast.success('Unidade de saúde removida com sucesso')

      // Invalidar caches
      const invalidateKeys = unidadeKeys.invalidateOnDelete(id)
      invalidateKeys.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key })
      })

      // Redirecionar para lista de unidades
      navigate('/unidades')
    },

    onError: (error, _id, context) => {
      // Dismiss loading toast
      if (context.loadingToast) {
        toast.dismiss(context.loadingToast)
      }

      // Log de erro
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        'Erro ao deletar unidade',
      )
      toast.error('Erro ao remover unidade de saúde', {
        description:
          error instanceof Error
            ? error.message
            : 'Tente novamente em alguns instantes',
      })
    },
  })
}
