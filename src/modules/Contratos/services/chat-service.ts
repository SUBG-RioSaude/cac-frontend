import { chatApi } from '@/lib/axios'
import { createServiceLogger } from '@/lib/logger'
import type { ChatMessage } from '@/modules/Contratos/types/timeline'

import {
  CHAT_SISTEMA_ID,
  type AtualizarMensagemDto,
  type BuscarMensagensParams,
  type CriarMensagemDto,
  type EstatisticasDto,
  type MensagemResponseDto,
  type ResultadoPaginadoDto,
  mapChatMessageToCriarMensagemDto,
  mapMensagemResponseToChatMessage,
} from '../types/chat-api'

const logger = createServiceLogger('chat-service')

const serializeBuscarMensagensParams = (
  params: BuscarMensagensParams,
): Record<string, string | number> => {
  const query: Record<string, string | number> = {}

  if (params.sistemaId) query.SistemaId = params.sistemaId
  if (params.entidadeOrigemId) query.EntidadeOrigemId = params.entidadeOrigemId
  if (params.autorId) query.AutorId = params.autorId
  if (params.autorNome) query.AutorNome = params.autorNome
  if (params.pesquisa) query.Pesquisa = params.pesquisa
  if (params.dataInicio) query.DataInicio = params.dataInicio
  if (params.dataFim) query.DataFim = params.dataFim
  if (typeof params.page === 'number') query.Page = params.page
  if (typeof params.pageSize === 'number') query.PageSize = params.pageSize
  if (params.sortDirection) query.SortDirection = params.sortDirection
  if (params.sortBy) query.SortBy = params.sortBy
  if (typeof params.offset === 'number') query.Offset = params.offset

  return query
}

export interface ChatMensagensPaginadas {
  mensagens: ChatMessage[]
  totalItens: number
  paginaAtual: number
  tamanhoPagina: number
  totalPaginas?: number
  temProximaPagina?: boolean
  temPaginaAnterior?: boolean
}

export interface CriarMensagemPayload {
  contratoId: string
  conteudo: string
  autorId: string
  autorNome?: string
  sistemaId?: string
}

export interface AtualizarMensagemPayload {
  mensagemId: string
  texto: string
}

export const fetchMensagens = async (
  params: BuscarMensagensParams,
): Promise<ChatMensagensPaginadas> => {
  const response = await chatApi.get<ResultadoPaginadoDto<MensagemResponseDto>>(
    '/Mensagens',
    {
      params: serializeBuscarMensagensParams(params),
    },
  )

  if (!response.data) {
    throw new Error('Resposta vazia ao consultar mensagens do chat')
  }

  const { items, totalItens, paginaAtual, tamanhoPagina } = response.data

  return {
    mensagens: (items ?? []).map(mapMensagemResponseToChatMessage),
    totalItens,
    paginaAtual,
    tamanhoPagina,
    totalPaginas: response.data.totalPaginas,
    temProximaPagina: response.data.temProximaPagina,
    temPaginaAnterior: response.data.temPaginaAnterior,
  }
}

export const fetchMensagensPorContrato = async (
  contratoId: string,
  {
    sistemaId = CHAT_SISTEMA_ID,
    ...params
  }: Omit<BuscarMensagensParams, 'entidadeOrigemId'> & {
    sistemaId?: string
  } = {},
): Promise<ChatMensagensPaginadas> =>
  fetchMensagens({
    ...params,
    sistemaId,
    entidadeOrigemId: contratoId,
  })

export const getMensagemById = async (
  mensagemId: string,
): Promise<ChatMessage> => {
  const response = await chatApi.get<MensagemResponseDto>(
    `/Mensagens/${mensagemId}`,
  )

  if (!response.data) {
    throw new Error('Mensagem não encontrada na API de chat')
  }

  return mapMensagemResponseToChatMessage(response.data)
}

export const criarMensagem = async (
  payload: CriarMensagemPayload,
): Promise<ChatMessage> => {
  const dto: CriarMensagemDto = mapChatMessageToCriarMensagemDto({
    contratoId: payload.contratoId,
    conteudo: payload.conteudo,
    remetente: {
      id: payload.autorId,
      nome: payload.autorNome ?? payload.autorId,
      tipo: 'usuario',
    },
  })

  if (payload.sistemaId) {
    dto.sistemaId = payload.sistemaId
  }

  try {
    const response = await chatApi.post<MensagemResponseDto>('/Mensagens', dto)

    if (!response.data) {
      throw new Error('Resposta vazia ao criar mensagem de chat')
    }

    return mapMensagemResponseToChatMessage(response.data)
  } catch (error) {
    logger.error('Erro ao criar mensagem de chat', error as string)
    throw error
  }
}

export const atualizarMensagem = async (
  payload: AtualizarMensagemPayload,
): Promise<void> => {
  const dto: AtualizarMensagemDto = { texto: payload.texto }

  await chatApi.put(`/Mensagens/${payload.mensagemId}`, dto)
}

export const removerMensagem = async (mensagemId: string): Promise<void> => {
  await chatApi.delete(`/Mensagens/${mensagemId}`)
}

export const fetchMensagensPorAutor = async (
  autorId: string,
): Promise<ChatMessage[]> => {
  const response = await chatApi.get<MensagemResponseDto[]>(
    `/Mensagens/autor/${autorId}`,
  )

  return (response.data ?? []).map(mapMensagemResponseToChatMessage)
}

export const fetchMensagensPeriodo = async (
  dataInicio?: string,
  dataFim?: string,
): Promise<ChatMessage[]> => {
  const response = await chatApi.get<MensagemResponseDto[]>(
    '/Mensagens/periodo',
    {
      params: {
        dataInicio,
        dataFim,
      },
    },
  )

  return (response.data ?? []).map(mapMensagemResponseToChatMessage)
}

export const fetchEstatisticas = async (): Promise<EstatisticasDto> => {
  const response = await chatApi.get<EstatisticasDto>('/Mensagens/estatisticas')

  if (!response.data) {
    throw new Error('Não foi possível obter estatísticas do chat')
  }

  return response.data
}
