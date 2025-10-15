import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { createServiceLogger } from '@/lib/logger'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import {
  atualizarMensagem,
  criarMensagem,
  fetchEstatisticas,
  fetchMensagensPorContrato,
  removerMensagem,
  type AtualizarMensagemPayload,
  type ChatMensagensPaginadas,
  type CriarMensagemPayload,
} from '@/modules/Contratos/services/chat-service'
import { signalRChatManager } from '@/modules/Contratos/services/signalr-manager'
import {
  CHAT_PAGE_SIZE_DEFAULT,
  CHAT_SISTEMA_ID,
} from '@/modules/Contratos/types/chat-api'
import type { ChatMessage } from '@/modules/Contratos/types/timeline'

export const buildChatQueryKey = (
  contratoId: string,
  pageSize: number,
  sistemaId: string,
) => [...contratoKeys.chat(contratoId), { pageSize, sistemaId }] as const

const generateTempId = () =>
  globalThis.crypto?.randomUUID?.() ?? `temp-${  Date.now().toString()}`

const realtimeLogger = createServiceLogger('contract-chat-realtime')

const updateFirstPage = (
  data: InfiniteData<ChatMensagensPaginadas>,
  updater: (page: ChatMensagensPaginadas) => ChatMensagensPaginadas,
): InfiniteData<ChatMensagensPaginadas> => ({
  pageParams: data.pageParams,
  pages: data.pages.map((page, index) =>
    index === 0 ? updater(page) : page,
  ),
})

const replaceMessageInPages = (
  pages: ChatMensagensPaginadas[],
  predicate: (mensagem: ChatMessage) => boolean,
  replacer: (mensagem: ChatMessage) => ChatMessage | null,
) =>
  pages.map((page) => {
    const mensagemIndex = page.mensagens.findIndex(predicate)

    if (mensagemIndex === -1) {
      return page
    }

    const mensagens = [...page.mensagens]
    const payload = replacer(mensagens[mensagemIndex])

    if (payload === null) {
      mensagens.splice(mensagemIndex, 1)

      return {
        ...page,
        mensagens,
        totalItens: Math.max(0, page.totalItens - 1),
      }
    }

    mensagens[mensagemIndex] = payload

    return {
      ...page,
      mensagens,
    }
  })

export interface UseContractChatMessagesOptions {
  enabled?: boolean
  pageSize?: number
  sistemaId?: string
  sortDirection?: 'asc' | 'desc'
}

export const useContractChatMessages = (
  contratoId: string,
  options?: UseContractChatMessagesOptions,
) => {
  const pageSize = options?.pageSize ?? CHAT_PAGE_SIZE_DEFAULT
  const sistemaId = options?.sistemaId ?? CHAT_SISTEMA_ID
  const sortDirection = options?.sortDirection ?? 'desc'

  const query = useInfiniteQuery({
    queryKey: buildChatQueryKey(contratoId, pageSize, sistemaId),
    enabled: options?.enabled ?? !!contratoId,
    initialPageParam: 1,
    getNextPageParam: (lastPage: ChatMensagensPaginadas, pages) =>
      lastPage.temProximaPagina ? pages.length + 1 : undefined,
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchMensagensPorContrato(contratoId, {
        sistemaId,
        page: pageParam,
        pageSize,
        sortDirection,
      }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })

  const mensagens =
    query.data?.pages.flatMap((page: ChatMensagensPaginadas) => page.mensagens) ?? ([] as ChatMessage[])

  return {
    ...query,
    mensagens,
  }
}

export interface SendChatMessageInput {
  conteudo: string
  autorId: string
  autorNome?: string
  sistemaId?: string
}

export const useSendChatMessage = (
  contratoId: string,
  options?: { pageSize?: number; sistemaId?: string },
) => {
  const pageSize = options?.pageSize ?? CHAT_PAGE_SIZE_DEFAULT
  const sistemaId = options?.sistemaId ?? CHAT_SISTEMA_ID
  const queryClient = useQueryClient()
  const queryKey = buildChatQueryKey(contratoId, pageSize, sistemaId)

  return useMutation({
    mutationFn: async (input: SendChatMessageInput) => {
      const payload: CriarMensagemPayload = {
        contratoId,
        conteudo: input.conteudo,
        autorId: input.autorId,
        autorNome: input.autorNome,
        sistemaId: input.sistemaId ?? sistemaId,
      }

      return criarMensagem(payload)
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<
        InfiniteData<ChatMensagensPaginadas>
      >(queryKey)

      const tempMessage: ChatMessage = {
        id: generateTempId(),
        contratoId,
        conteudo: input.conteudo,
        remetente: {
          id: input.autorId,
          nome: input.autorNome ?? 'Você',
          tipo: 'usuario',
        },
        tipo: 'texto',
        dataEnvio: new Date().toISOString(),
        lida: true,
      }

      if (previousData) {
        const nextState = updateFirstPage(previousData, (page) => ({
          ...page,
          mensagens: [...page.mensagens, tempMessage], // Adiciona no final para ordem ASC
          totalItens: page.totalItens + 1,
        }))

        queryClient.setQueryData(queryKey, nextState)
      } else {
        const nextState: InfiniteData<ChatMensagensPaginadas> = {
          pageParams: [1],
          pages: [
            {
              mensagens: [tempMessage],
              totalItens: 1,
              paginaAtual: 1,
              tamanhoPagina: pageSize,
              temProximaPagina: false,
              temPaginaAnterior: false,
            },
          ],
        }

        queryClient.setQueryData(queryKey, nextState)
      }

      return { previousData, tempId: tempMessage.id }
    },
    onSuccess: (mensagem, _variables, context) => {
      toast.success('Mensagem enviada com sucesso!')

      queryClient.setQueryData<InfiniteData<ChatMensagensPaginadas>>(
        queryKey,
        (current) => {
          if (!current) {
            return current
          }

          const pages = replaceMessageInPages(
            current.pages,
            (item) => item.id === context?.tempId,
            (_item) => mensagem,
          )

          const found = pages.some((page) =>
            page.mensagens.some((item) => item.id === mensagem.id),
          )

          if (!found && pages.length > 0) {
            pages[0] = {
              ...pages[0],
              mensagens: [...pages[0].mensagens, mensagem], // Adiciona no final para ordem ASC
              totalItens: pages[0].totalItens + 1,
            }
          }

          return {
            ...current,
            pages,
          }
        },
      )
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Erro ao enviar mensagem', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export interface UpdateChatMessageInput {
  mensagemId: string
  texto: string
}

export const useUpdateChatMessage = (
  contratoId: string,
  options?: { pageSize?: number; sistemaId?: string },
) => {
  const pageSize = options?.pageSize ?? CHAT_PAGE_SIZE_DEFAULT
  const sistemaId = options?.sistemaId ?? CHAT_SISTEMA_ID
  const queryClient = useQueryClient()
  const queryKey = buildChatQueryKey(contratoId, pageSize, sistemaId)

  return useMutation({
    mutationFn: async (input: UpdateChatMessageInput) => {
      const payload: AtualizarMensagemPayload = {
        mensagemId: input.mensagemId,
        texto: input.texto,
      }

      await atualizarMensagem(payload)
      return payload
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<
        InfiniteData<ChatMensagensPaginadas>
      >(queryKey)

      if (previousData) {
        const pages = replaceMessageInPages(
          previousData.pages,
          (mensagem) => mensagem.id === input.mensagemId,
          (mensagem) => ({
            ...mensagem,
            conteudo: input.texto,
            editada: true,
            editadaEm: new Date().toISOString(),
          }),
        )

        queryClient.setQueryData(queryKey, {
          ...previousData,
          pages,
        })
      }

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Mensagem atualizada')
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Erro ao atualizar mensagem', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export const useDeleteChatMessage = (
  contratoId: string,
  options?: { pageSize?: number; sistemaId?: string },
) => {
  const pageSize = options?.pageSize ?? CHAT_PAGE_SIZE_DEFAULT
  const sistemaId = options?.sistemaId ?? CHAT_SISTEMA_ID
  const queryClient = useQueryClient()
  const queryKey = buildChatQueryKey(contratoId, pageSize, sistemaId)

  return useMutation({
    mutationFn: async (mensagemId: string) => {
      await removerMensagem(mensagemId)
      return mensagemId
    },
    onMutate: async (mensagemId) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<
        InfiniteData<ChatMensagensPaginadas>
      >(queryKey)

      if (previousData) {
        const pages = replaceMessageInPages(
          previousData.pages,
          (mensagem) => mensagem.id === mensagemId,
          () => null,
        )

        queryClient.setQueryData(queryKey, {
          ...previousData,
          pages,
        })
      }

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Mensagem removida')
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Erro ao remover mensagem', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export const useChatEstatisticas = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: contratoKeys.chatEstatisticas(),
    queryFn: async () => {
      try {
        return await fetchEstatisticas()
      } catch (error) {
        toast.error('Erro ao carregar estatísticas', {
          description: error instanceof Error ? error.message : 'Erro desconhecido',
        })
        throw error
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  })
}

interface UseContractChatRealtimeParams {
  contratoId: string
  autorId: string
  sistemaId?: string
  pageSize?: number
}

export const useContractChatRealtime = ({
  contratoId,
  autorId,
  sistemaId = CHAT_SISTEMA_ID,
  pageSize = CHAT_PAGE_SIZE_DEFAULT,
}: UseContractChatRealtimeParams) => {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle')
  const [connectionError, setConnectionError] = useState<Error | null>(null)

  useEffect(() => {
    realtimeLogger.debug('useContractChatRealtime - Inicializando com params:', {
      contratoId,
      autorId,
      sistemaId,
      pageSize,
    })

    if (!contratoId || !autorId) {
      realtimeLogger.warn('SignalR NÃO VAI CONECTAR - Parâmetros inválidos:', {
        contratoId,
        autorId,
        motivo: !contratoId
          ? 'contratoId vazio'
          : 'autorId vazio (usuário não autenticado)',
      })
      return undefined
    }

    if (autorId === 'usuario-anonimo') {
      realtimeLogger.error(
        'SignalR NÃO VAI CONECTAR - autorId é fallback "usuario-anonimo"',
      )
      return undefined
    }

    let isActive = true
    let unsubscribeMessage: (() => void) | undefined

    const connect = async () => {
      setConnectionState('connecting')
      realtimeLogger.info('Iniciando conexão SignalR...')

      try {
        await signalRChatManager.initialize()
        if (!isActive) return

        realtimeLogger.info('SignalR inicializado, entrando na sala:', {
          sistemaId,
          contratoId,
        })

        await signalRChatManager.joinRoom(sistemaId, contratoId)
        if (!isActive) return

        realtimeLogger.info('Sala joined com sucesso!')

        unsubscribeMessage = signalRChatManager.onMessage(
          sistemaId,
          contratoId,
          (mensagem) => {
            realtimeLogger.debug('Mensagem recebida via SignalR:', {
              id: mensagem.id,
              remetenteId: mensagem.remetente.id,
              remetenteNome: mensagem.remetente.nome,
              conteudo: mensagem.conteudo.substring(0, 50),
            })

            queryClient.setQueryData<InfiniteData<ChatMensagensPaginadas>>(
              buildChatQueryKey(contratoId, pageSize, sistemaId),
              (current) => {
                if (!current) {
                  return {
                    pageParams: [1],
                    pages: [
                      {
                        mensagens: [mensagem],
                        totalItens: 1,
                        paginaAtual: 1,
                        tamanhoPagina: pageSize,
                        temProximaPagina: false,
                        temPaginaAnterior: false,
                      },
                    ],
                  }
                }

                const exists = current.pages.some((page) =>
                  page.mensagens.some((item) => item.id === mensagem.id),
                )

                if (exists) {
                  realtimeLogger.debug('Mensagem já existe, ignorando duplicação')
                  return current
                }

                realtimeLogger.debug('Adicionando nova mensagem ao cache')

                const pages = [...current.pages]

                if (pages.length === 0) {
                  pages.push({
                    mensagens: [mensagem],
                    totalItens: 1,
                    paginaAtual: 1,
                    tamanhoPagina: pageSize,
                    temProximaPagina: false,
                    temPaginaAnterior: false,
                  })
                } else {
                  pages[0] = {
                    ...pages[0],
                    mensagens: [...pages[0].mensagens, mensagem],
                    totalItens: pages[0].totalItens + 1,
                  }
                }

                return {
                  ...current,
                  pages,
                }
              },
            )
          },
        )

        setConnectionState('connected')
        setConnectionError(null)
      } catch (error) {
        const parsedError =
          error instanceof Error ? error : new Error(String(error))
        setConnectionError(parsedError)
        setConnectionState('error')
        realtimeLogger.error('Erro ao conectar SignalR', parsedError.message)
      }
    }

    void connect()

    return () => {
      isActive = false
      unsubscribeMessage?.()
      void signalRChatManager.leaveRoom(sistemaId, contratoId)
    }
  }, [contratoId, sistemaId, autorId, pageSize, queryClient])

  const startTyping = useCallback(() => {
    void signalRChatManager.startTyping(sistemaId, contratoId)
  }, [sistemaId, contratoId])

  const stopTyping = useCallback(() => {
    void signalRChatManager.stopTyping(sistemaId, contratoId)
  }, [sistemaId, contratoId])

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    error: connectionError,
    startTyping,
    stopTyping,
  }
}
