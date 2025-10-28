/**
 * Hooks TanStack Query para gerenciamento de notificações
 * Substitui o Zustand store com queries e mutations
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import * as notificacaoApi from '@/services/notificacao-api'
import type {
  ContagemNaoLidas,
  FiltrosNotificacao,
  NotificacoesArquivadas,
  NotificacoesPaginadas,
  Preferencia,
} from '@/types/notificacao'

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query keys para cache do TanStack Query
 */
export const notificacoesQueryKeys = {
  all: ['notificacoes'] as const,
  lists: () => [...notificacoesQueryKeys.all, 'list'] as const,
  list: (filtros: FiltrosNotificacao) =>
    [...notificacoesQueryKeys.lists(), filtros] as const,
  naoLidas: () => [...notificacoesQueryKeys.all, 'nao-lidas'] as const,
  arquivadas: (page: number, pageSize: number) =>
    [...notificacoesQueryKeys.all, 'arquivadas', { page, pageSize }] as const,
  preferencias: () => ['preferencias'] as const,
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para listar notificações com paginação
 *
 * @param filtros - Filtros de paginação e busca
 * @param enabled - Se a query deve ser executada (padrão: true)
 * @returns Query result com notificações paginadas
 */
export const useNotificacoesQuery = (
  filtros: FiltrosNotificacao = {},
  enabled = true,
): UseQueryResult<NotificacoesPaginadas, Error> => {
  return useQuery({
    queryKey: notificacoesQueryKeys.list(filtros),
    queryFn: () => notificacaoApi.listarMinhasNotificacoes(filtros),
    enabled,
    staleTime: 1000 * 60, // 1 minuto
    gcTime: 1000 * 60 * 5, // 5 minutos em cache
  })
}

/**
 * Hook para contagem de notificações não lidas
 *
 * @param enabled - Se a query deve ser executada (padrão: true)
 * @returns Query result com contagem de não lidas
 */
export const useContarNaoLidasQuery = (
  enabled = true,
): UseQueryResult<ContagemNaoLidas, Error> => {
  return useQuery({
    queryKey: notificacoesQueryKeys.naoLidas(),
    queryFn: notificacaoApi.contarNaoLidas,
    enabled,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refetch a cada 1 minuto
  })
}

/**
 * Hook para listar notificações arquivadas
 *
 * @param page - Número da página
 * @param pageSize - Itens por página
 * @param enabled - Se a query deve ser executada (padrão: true)
 * @returns Query result com notificações arquivadas
 */
export const useNotificacoesArquivadasQuery = (
  page = 1,
  pageSize = 20,
  enabled = true,
): UseQueryResult<NotificacoesArquivadas, Error> => {
  return useQuery({
    queryKey: notificacoesQueryKeys.arquivadas(page, pageSize),
    queryFn: () => notificacaoApi.listarArquivadas(page, pageSize),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

/**
 * Hook para obter preferências do usuário
 *
 * @param enabled - Se a query deve ser executada (padrão: true)
 * @returns Query result com preferências
 */
export const usePreferenciasQuery = (
  enabled = true,
): UseQueryResult<Preferencia[], Error> => {
  return useQuery({
    queryKey: notificacoesQueryKeys.preferencias(),
    queryFn: notificacaoApi.obterPreferencias,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para marcar notificação como lida (com otimistic update)
 *
 * @returns Mutation result
 */
export const useMarcarLidaMutation = (): UseMutationResult<
  void,
  Error,
  string,
  {
    anteriores: [readonly unknown[], NotificacoesPaginadas | undefined][]
  }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificacaoApi.marcarComoLida,

    // Otimistic update: atualiza UI antes da API confirmar
    onMutate: async (notificacaoId: string) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })

      // Snapshot do estado anterior (para rollback)
      const anteriores = queryClient.getQueriesData<NotificacoesPaginadas>({
        queryKey: notificacoesQueryKeys.lists(),
      })

      // Atualiza otimisticamente todas as queries de notificações
      queryClient.setQueriesData<NotificacoesPaginadas>(
        { queryKey: notificacoesQueryKeys.lists() },
        (old) => {
          if (!old) return old

          return {
            ...old,
            items: old.items.map((n) =>
              n.id === notificacaoId
                ? { ...n, lida: true, lidaEm: new Date().toISOString() }
                : n,
            ),
            naoLidas: Math.max(0, old.naoLidas - 1),
          }
        },
      )

      return { anteriores }
    },

    // Rollback em caso de erro
    onError: (err, notificacaoId, context) => {
      if (context?.anteriores) {
        context.anteriores.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast.error('Erro ao marcar como lida', {
        description: 'Tente novamente mais tarde',
      })

      console.error('Erro ao marcar como lida:', err, notificacaoId)
    },

    // Invalida queries após sucesso
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.naoLidas(),
      })
    },
  })
}

/**
 * Hook para arquivar notificação (com otimistic update)
 *
 * @returns Mutation result
 */
export const useArquivarMutation = (): UseMutationResult<
  void,
  Error,
  string,
  {
    anteriores: [readonly unknown[], NotificacoesPaginadas | undefined][]
  }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificacaoApi.arquivar,

    onMutate: async (notificacaoId: string) => {
      await queryClient.cancelQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })

      const anteriores = queryClient.getQueriesData<NotificacoesPaginadas>({
        queryKey: notificacoesQueryKeys.lists(),
      })

      // Remove da lista ativa (será movida para arquivadas)
      queryClient.setQueriesData<NotificacoesPaginadas>(
        { queryKey: notificacoesQueryKeys.lists() },
        (old) => {
          if (!old) return old

          return {
            ...old,
            items: old.items.filter((n) => n.id !== notificacaoId),
          }
        },
      )

      return { anteriores }
    },

    onError: (err, notificacaoId, context) => {
      if (context?.anteriores) {
        context.anteriores.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast.error('Erro ao arquivar notificação', {
        description: 'Tente novamente mais tarde',
      })

      console.error('Erro ao arquivar:', err, notificacaoId)
    },

    onSuccess: () => {
      // Invalida lista de arquivadas
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })

      toast.success('Notificação arquivada')
    },
  })
}

/**
 * Hook para desarquivar notificação
 *
 * @returns Mutation result
 */
export const useDesarquivarMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificacaoApi.desarquivar,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })

      toast.success('Notificação desarquivada')
    },

    onError: (err, notificacaoId) => {
      toast.error('Erro ao desarquivar notificação')
      console.error('Erro ao desarquivar:', err, notificacaoId)
    },
  })
}

/**
 * Hook para marcar todas as notificações como lidas
 *
 * @returns Mutation result
 */
export const useMarcarTodasLidasMutation = (): UseMutationResult<
  void,
  Error,
  string | undefined
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificacaoApi.marcarTodasComoLidas,

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })

      // Marca todas como lidas otimisticamente
      queryClient.setQueriesData<NotificacoesPaginadas>(
        { queryKey: notificacoesQueryKeys.lists() },
        (old) => {
          if (!old) return old

          return {
            ...old,
            items: old.items.map((n) => ({
              ...n,
              lida: true,
              lidaEm: new Date().toISOString(),
            })),
            naoLidas: 0,
          }
        },
      )
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })

      toast.success('Todas as notificações foram marcadas como lidas')
    },

    onError: (err) => {
      toast.error('Erro ao marcar todas como lidas')
      console.error('Erro ao marcar todas como lidas:', err)

      // Recarrega dados corretos da API
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })
    },
  })
}

/**
 * Hook para arquivar todas as notificações lidas
 *
 * @returns Mutation result
 */
export const useArquivarTodasLidasMutation = (): UseMutationResult<
  void,
  Error,
  string | undefined
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificacaoApi.arquivarTodasLidas,

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })

      // Remove todas lidas da lista ativa
      queryClient.setQueriesData<NotificacoesPaginadas>(
        { queryKey: notificacoesQueryKeys.lists() },
        (old) => {
          if (!old) return old

          return {
            ...old,
            items: old.items.filter((n) => !n.lida),
          }
        },
      )
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })

      toast.success('Notificações lidas foram arquivadas')
    },

    onError: (err) => {
      toast.error('Erro ao arquivar notificações lidas')
      console.error('Erro ao arquivar lidas:', err)

      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })
    },
  })
}

/**
 * Hook para deletar notificação
 *
 * @returns Mutation result
 */
export const useDeletarNotificacaoMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificacaoApi.deletarNotificacao,

    onMutate: async (notificacaoId: string) => {
      await queryClient.cancelQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })

      // Remove da lista
      queryClient.setQueriesData<NotificacoesPaginadas>(
        { queryKey: notificacoesQueryKeys.lists() },
        (old) => {
          if (!old) return old

          const notificacao = old.items.find((n) => n.id === notificacaoId)
          const eraLida = notificacao?.lida ?? true

          return {
            ...old,
            items: old.items.filter((n) => n.id !== notificacaoId),
            naoLidas: eraLida ? old.naoLidas : Math.max(0, old.naoLidas - 1),
          }
        },
      )
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })

      toast.success('Notificação removida')
    },

    onError: (err, notificacaoId) => {
      toast.error('Erro ao remover notificação')
      console.error('Erro ao deletar:', err, notificacaoId)

      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })
    },
  })
}

/**
 * Hook para atualizar preferência
 *
 * @returns Mutation result
 */
export const useAtualizarPreferenciaMutation = (): UseMutationResult<
  Preferencia,
  Error,
  { id: string; habilitada: boolean }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, habilitada }) =>
      notificacaoApi.atualizarPreferencia(id, habilitada),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.preferencias(),
      })

      toast.success('Preferência atualizada')
    },

    onError: (err) => {
      toast.error('Erro ao atualizar preferência')
      console.error('Erro ao atualizar preferência:', err)
    },
  })
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Hook combinado que retorna queries e mutations mais utilizados
 * Usado como base para o hook facade principal
 *
 * @param filtros - Filtros de notificações
 * @returns Objeto com queries e mutations
 */
export const useNotificacoesQueryCombinado = (
  filtros: FiltrosNotificacao = {},
) => {
  const notificacoesQuery = useNotificacoesQuery(filtros)
  const naoLidasQuery = useContarNaoLidasQuery()
  const preferenciasQuery = usePreferenciasQuery()

  const marcarLidaMutation = useMarcarLidaMutation()
  const arquivarMutation = useArquivarMutation()
  const marcarTodasLidasMutation = useMarcarTodasLidasMutation()
  const arquivarTodasLidasMutation = useArquivarTodasLidasMutation()
  const deletarMutation = useDeletarNotificacaoMutation()

  return {
    // Queries
    notificacoesQuery,
    naoLidasQuery,
    preferenciasQuery,

    // Mutations
    marcarLidaMutation,
    arquivarMutation,
    marcarTodasLidasMutation,
    arquivarTodasLidasMutation,
    deletarMutation,

    // Helpers
    isLoading:
      notificacoesQuery.isLoading ||
      naoLidasQuery.isLoading ||
      preferenciasQuery.isLoading,

    isError:
      notificacoesQuery.isError ||
      naoLidasQuery.isError ||
      preferenciasQuery.isError,
  }
}
