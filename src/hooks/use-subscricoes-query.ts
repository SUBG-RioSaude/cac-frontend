/**
 * Hooks TanStack Query para gerenciar subscrições (seguir entidades)
 * Integra com egestao-micro-notificacao-api
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as subscricoesApi from '@/services/notificacao-api'
import type {
  SeguirEntidadeRequest,
  SeguirEntidadeResponse,
  StatusSeguimentoResponse,
  SubscricoesPaginadas,
} from '@/types/notificacao'

type ToggleSeguirContext = {
  previousStatus?: StatusSeguimentoResponse
  request: SeguirEntidadeRequest
}

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Keys para queries de subscrições
 */
export const subscricoesQueryKeys = {
  all: ['subscricoes'] as const,
  minhas: (filtros?: { page?: number; pageSize?: number; sistemaId?: string }) =>
    [...subscricoesQueryKeys.all, 'minhas', filtros] as const,
  verificarSeguindo: (sistemaId: string, entidadeOrigemId: string) =>
    [...subscricoesQueryKeys.all, 'verificar', sistemaId, entidadeOrigemId] as const,
} as const

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para verificar se o usuário está seguindo uma entidade
 *
 * @param sistemaId - ID do sistema
 * @param entidadeOrigemId - ID da entidade (ex: ID do contrato)
 * @param enabled - Se a query está habilitada (padrão: true)
 * @returns Query com status de seguimento
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useVerificarSeguindoQuery('contratos', contratoId)
 * if (data?.seguindo) {
 *   // Usuário está seguindo
 * }
 * ```
 */
export const useVerificarSeguindoQuery = (
  sistemaId: string,
  entidadeOrigemId: string,
  enabled = true,
) => {
  return useQuery<StatusSeguimentoResponse>({
    queryKey: subscricoesQueryKeys.verificarSeguindo(sistemaId, entidadeOrigemId),
    queryFn: () => subscricoesApi.verificarSeguindo(sistemaId, entidadeOrigemId),
    enabled: enabled && !!sistemaId && !!entidadeOrigemId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}

/**
 * Hook para listar subscrições do usuário
 *
 * @param filtros - Filtros de paginação e sistema
 * @param enabled - Se a query está habilitada (padrão: true)
 * @returns Query com subscrições paginadas
 *
 * @example
 * ```tsx
 * const { data } = useMinhasSubscricoesQuery({ sistemaId: 'contratos' })
 * data?.items.forEach(sub => console.log(sub.entidadeOrigemId))
 * ```
 */
export const useMinhasSubscricoesQuery = (
  filtros?: {
    page?: number
    pageSize?: number
    sistemaId?: string
  },
  enabled = true,
) => {
  return useQuery<SubscricoesPaginadas>({
    queryKey: subscricoesQueryKeys.minhas(filtros),
    queryFn: () =>
      subscricoesApi.listarMinhasSubscricoes(
        filtros?.page,
        filtros?.pageSize,
        filtros?.sistemaId,
      ),
    enabled,
    staleTime: 1000 * 60 * 1, // 1 minuto
    gcTime: 1000 * 60 * 5, // 5 minutos
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para toggle seguir/deixar de seguir uma entidade
 *
 * @returns Mutation com função mutate e estados
 *
 * @example
 * ```tsx
 * const toggleSeguir = useToggleSeguirMutation()
 *
 * const handleSeguir = () => {
 *   toggleSeguir.mutate({
 *     sistemaId: 'contratos',
 *     entidadeOrigemId: contratoId
 *   })
 * }
 * ```
 */
export const useToggleSeguirMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    SeguirEntidadeResponse,
    Error,
    SeguirEntidadeRequest,
    ToggleSeguirContext
  >({
    mutationFn: (request: SeguirEntidadeRequest) =>
      subscricoesApi.toggleSeguir(request),

    onMutate: async (request) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({
        queryKey: subscricoesQueryKeys.verificarSeguindo(
          request.sistemaId,
          request.entidadeOrigemId,
        ),
      })

      // Snapshot do valor anterior
      const previousStatus = queryClient.getQueryData<StatusSeguimentoResponse>(
        subscricoesQueryKeys.verificarSeguindo(
          request.sistemaId,
          request.entidadeOrigemId,
        ),
      )

      // Optimistic update - inverte o status
      queryClient.setQueryData<StatusSeguimentoResponse>(
        subscricoesQueryKeys.verificarSeguindo(
          request.sistemaId,
          request.entidadeOrigemId,
        ),
        (old) => ({
          seguindo: !old?.seguindo,
          subscricaoId: old?.subscricaoId,
          criadoEm: old?.criadoEm,
        }),
      )

      return { previousStatus, request }
    },

    onSuccess: (data, variables) => {
      // Atualiza cache com resposta real da API
      queryClient.setQueryData<StatusSeguimentoResponse>(
        subscricoesQueryKeys.verificarSeguindo(
          variables.sistemaId,
          variables.entidadeOrigemId,
        ),
        {
          seguindo: data.seguindo,
          subscricaoId: data.subscricaoId,
        },
      )

      // Invalida lista de subscrições para refresh
      void queryClient.invalidateQueries({
        queryKey: subscricoesQueryKeys.minhas(),
      })

      // Toast de sucesso
      toast.success(data.mensagem || (data.seguindo ? 'Seguindo!' : 'Deixou de seguir'))
    },

    onError: (erro, _variables, context) => {
      // Rollback em caso de erro
      if (context && context.previousStatus) {
        queryClient.setQueryData(
          subscricoesQueryKeys.verificarSeguindo(
            context.request.sistemaId,
            context.request.entidadeOrigemId,
          ),
          context.previousStatus,
        )
      }

      toast.error('Erro ao atualizar subscrição', {
        description: erro.message || 'Tente novamente mais tarde',
      })
    },
  })
}

/**
 * Hook para deletar subscrição (deixar de seguir)
 *
 * @returns Mutation com função mutate e estados
 *
 * @example
 * ```tsx
 * const deletarSubscricao = useDeletarSubscricaoMutation()
 *
 * const handleDeixarDeSeguir = (subscricaoId: string) => {
 *   deletarSubscricao.mutate(subscricaoId)
 * }
 * ```
 */
export const useDeletarSubscricaoMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (subscricaoId: string) =>
      subscricoesApi.deletarSubscricao(subscricaoId),

    onSuccess: () => {
      // Invalida todas as queries de subscrições
      void queryClient.invalidateQueries({
        queryKey: subscricoesQueryKeys.all,
      })

      toast.success('Subscrição removida com sucesso')
    },

    onError: (erro) => {
      toast.error('Erro ao remover subscrição', {
        description: erro.message || 'Tente novamente mais tarde',
      })
    },
  })
}
