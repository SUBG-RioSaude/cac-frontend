/**
 * Tipos para integração com a API de Chat
 * Define estruturas de dados para requisições e respostas da API
 */

import type { ChatMessage } from './timeline'

// Constante do sistema ID padrão para chat
export const CHAT_SISTEMA_ID = import.meta.env.VITE_SYSTEM_ID as string

// Validação de configuração obrigatória
if (!CHAT_SISTEMA_ID || CHAT_SISTEMA_ID === 'undefined') {
  throw new Error(
    'VITE_SYSTEM_ID não está configurado. Adicione VITE_SYSTEM_ID=<seu-guid> no arquivo .env',
  )
}

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
  enviadoEm: string
  atualizadoEm?: string | null
  criadoEm: string
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
 * Infere o tipo de remetente baseado no autorNome ou autorId
 * Heurística simples para identificar tipos especiais
 */
export function inferirTipoRemetente(
  autorNome?: string | null,
  autorId?: string,
): 'usuario' | 'fiscal' | 'gestor' | 'fornecedor' | 'sistema' {
  const nome = (autorNome ?? autorId ?? '').toLowerCase()

  // Identificar mensagens do sistema
  if (
    nome.includes('sistema') ||
    nome.includes('system') ||
    nome.includes('bot') ||
    nome.includes('automatico')
  ) {
    return 'sistema'
  }

  // Identificar fiscal
  if (nome.includes('fiscal') || nome.includes('fiscaliza')) {
    return 'fiscal'
  }

  // Identificar gestor
  if (
    nome.includes('gestor') ||
    nome.includes('gerente') ||
    nome.includes('coordenador')
  ) {
    return 'gestor'
  }

  // Identificar fornecedor
  if (nome.includes('fornecedor') || nome.includes('empresa')) {
    return 'fornecedor'
  }

  // Padrão: usuário
  return 'usuario'
}

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
  // Inferir tipo de remetente baseado no nome
  const tipoRemetente = inferirTipoRemetente(dto.autorNome, dto.autorId)

  return {
    id: dto.id,
    contratoId: dto.entidadeOrigemId,
    remetente: {
      id: dto.autorId,
      nome: dto.autorNome ?? dto.autorId,
      tipo: tipoRemetente,
    },
    conteudo: dto.texto,
    tipo: tipoRemetente === 'sistema' ? 'sistema' : 'texto',
    dataEnvio: dto.enviadoEm,
    lida: false, // Será controlado pelo frontend
    editada: !!dto.atualizadoEm, // Se tem data de atualização, foi editada
    editadaEm: dto.atualizadoEm ?? undefined,
  }
}
