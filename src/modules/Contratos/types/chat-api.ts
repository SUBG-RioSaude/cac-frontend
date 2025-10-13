/**
 * Tipos para integração com a API de Chat
 * Define estruturas de dados para requisições e respostas da API
 */

import type { ChatMessage } from './timeline'

// Constante do sistema ID padrão para chat
export const CHAT_SISTEMA_ID = import.meta.env.SYSTEM_ID as string

// Constante de paginação padrão
export const CHAT_PAGE_SIZE_DEFAULT = 50

// ========== TIPOS DE REQUISIÇÃO ==========

export interface BuscarMensagensParams {
  sistemaId?: string
  entidadeOrigemId?: string
  autorId?: string
  autorNome?: string
  pesquisa?: string
  dataInicio?: string
  dataFim?: string
  page?: number
  pageSize?: number
  sortDirection?: 'asc' | 'desc'
  sortBy?: string
  offset?: number
}

export interface CriarMensagemDto {
  sistemaId: string
  entidadeOrigemId: string
  texto: string
  autorId: string
  autorNome?: string | null
}

export interface AtualizarMensagemDto {
  texto: string
}

// ========== TIPOS DE RESPOSTA ==========

export interface MensagemResponseDto {
  id: string
  sistemaId: string
  entidadeOrigemId: string
  texto: string
  autorId: string
  autorNome?: string | null
  dataCriacao: string
  dataAtualizacao?: string | null
  editada: boolean
}

export interface ResultadoPaginadoDto<T> {
  items: T[]
  totalItens: number
  paginaAtual: number
  tamanhoPagina: number
  totalPaginas?: number
  temProximaPagina?: boolean
  temPaginaAnterior?: boolean
}

export interface EstatisticasDto {
  totalMensagens: number
  mensagensHoje: number
  mensagensUltimaSemana: number
  mensagensUltimoMes: number
  participantesAtivos: number
  mediaMessagensPorDia: number
}

// ========== FUNÇÕES DE MAPEAMENTO ==========

/**
 * Converte ChatMessage do frontend para CriarMensagemDto da API
 */
export function mapChatMessageToCriarMensagemDto(message: {
  contratoId: string
  conteudo: string
  remetente: {
    id: string
    nome: string
    tipo: 'usuario' | 'fiscal' | 'gestor' | 'fornecedor' | 'sistema'
  }
}): CriarMensagemDto {
  return {
    sistemaId: CHAT_SISTEMA_ID,
    entidadeOrigemId: message.contratoId,
    texto: message.conteudo,
    autorId: message.remetente.id,
    autorNome: message.remetente.nome,
  }
}

/**
 * Converte MensagemResponseDto da API para ChatMessage do frontend
 */
export function mapMensagemResponseToChatMessage(
  dto: MensagemResponseDto,
): ChatMessage {
  return {
    id: dto.id,
    contratoId: dto.entidadeOrigemId,
    remetente: {
      id: dto.autorId,
      nome: dto.autorNome ?? dto.autorId,
      tipo: 'usuario', // Tipo padrão, pode ser enriquecido posteriormente
    },
    conteudo: dto.texto,
    tipo: 'texto',
    dataEnvio: dto.dataCriacao,
    lida: false, // Será controlado pelo frontend
    editada: dto.editada,
    editadaEm: dto.dataAtualizacao ?? undefined,
  }
}
