/**
 * Cliente API REST para notificações
 * Integra com egestao-micro-notificacao-api
 */

import axios, { type AxiosResponse } from 'axios'

import { getToken } from '@/lib/auth/auth'
import type {
  AtualizarPreferenciaRequest,
  ContagemNaoLidas,
  FiltrosNotificacao,
  NotificacoesArquivadas,
  NotificacoesPaginadas,
  NotificacaoUsuario,
  Preferencia,
  SeguirEntidadeRequest,
  SeguirEntidadeResponse,
  StatusSeguimentoResponse,
  Subscricao,
  SubscricoesPaginadas,
} from '@/types/notificacao'

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

/**
 * Base URL da API de notificações
 * IMPORTANTE: Deve vir do .env sem trailing slash
 * Exemplo: VITE_NOTIFICACOES_API_URL="http://localhost:5039"
 */
const BASE_URL = import.meta.env.VITE_NOTIFICACOES_API_URL as string

if (!BASE_URL) {
  console.error(
    '[Notificações] VITE_NOTIFICACOES_API_URL não configurado no .env',
  )
}

/**
 * Cliente Axios dedicado para API de notificações
 * Não usa o apiGateway porque notificações têm URL própria
 */
export const apiNotificacoes = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor para adicionar token JWT automaticamente
apiNotificacoes.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============================================================================
// NOTIFICAÇÕES - CRUD
// ============================================================================

/**
 * Lista notificações do usuário autenticado com paginação
 * GET /api/notificacoes/minhas
 *
 * @param filtros - Filtros opcionais de paginação e busca
 * @returns Promise com notificações paginadas
 */
export const listarMinhasNotificacoes = async (
  filtros: FiltrosNotificacao = {},
): Promise<NotificacoesPaginadas> => {
  const { page = 1, pageSize = 20 } = filtros

  const response: AxiosResponse<NotificacoesPaginadas> =
    await apiNotificacoes.get('/api/Notificacoes/minhas', {
      params: { page, pageSize },
    })

  return response.data
}

/**
 * Conta notificações não lidas do usuário
 * GET /api/notificacoes/nao-lidas
 *
 * @returns Promise com contagem total e por sistema
 */
export const contarNaoLidas = async (): Promise<ContagemNaoLidas> => {
  const response: AxiosResponse<ContagemNaoLidas> = await apiNotificacoes.get(
    '/api/notificacoes/nao-lidas',
  )

  return response.data
}

/**
 * Obtém uma notificação específica por ID
 * GET /api/notificacoes/{id}
 *
 * @param id - ID da notificação (NotificacaoUsuario.id)
 * @returns Promise com a notificação
 */
export const obterNotificacao = async (
  id: string,
): Promise<NotificacaoUsuario> => {
  const response: AxiosResponse<NotificacaoUsuario> = await apiNotificacoes.get(
    `/api/notificacoes/${id}`,
  )

  return response.data
}

/**
 * Marca uma notificação como lida
 * PUT /api/notificacoes/{id}/marcar-lida
 *
 * @param id - ID da notificação (NotificacaoUsuario.id)
 * @returns Promise void
 */
export const marcarComoLida = async (id: string): Promise<void> => {
  await apiNotificacoes.put(`/api/notificacoes/${id}/marcar-lida`)
}

/**
 * Marca uma notificação como não lida
 * PUT /api/notificacoes/{id}/marcar-nao-lida
 *
 * @param id - ID da notificação (NotificacaoUsuario.id)
 * @returns Promise void
 */
export const marcarComoNaoLida = async (id: string): Promise<void> => {
  await apiNotificacoes.put(`/api/notificacoes/${id}/marcar-nao-lida`)
}

/**
 * Arquiva uma notificação
 * PUT /api/notificacoes/{id}/arquivar
 *
 * @param id - ID da notificação (NotificacaoUsuario.id)
 * @returns Promise void
 */
export const arquivar = async (id: string): Promise<void> => {
  await apiNotificacoes.put(`/api/notificacoes/${id}/arquivar`)
}

/**
 * Desarquiva uma notificação
 * PUT /api/notificacoes/{id}/desarquivar
 *
 * @param id - ID da notificação (NotificacaoUsuario.id)
 * @returns Promise void
 */
export const desarquivar = async (id: string): Promise<void> => {
  await apiNotificacoes.put(`/api/notificacoes/${id}/desarquivar`)
}

/**
 * Marca todas as notificações como lidas
 * PUT /api/notificacoes/marcar-todas-lidas
 *
 * @param sistemaId - Filtro opcional por sistema
 * @returns Promise void
 */
export const marcarTodasComoLidas = async (
  sistemaId?: string,
): Promise<void> => {
  await apiNotificacoes.put('/api/notificacoes/marcar-todas-lidas', null, {
    params: sistemaId ? { sistemaId } : undefined,
  })
}

/**
 * Arquiva todas as notificações lidas
 * PUT /api/notificacoes/arquivar-todas-lidas
 *
 * @param sistemaId - Filtro opcional por sistema
 * @returns Promise void
 */
export const arquivarTodasLidas = async (sistemaId?: string): Promise<void> => {
  await apiNotificacoes.put('/api/notificacoes/arquivar-todas-lidas', null, {
    params: sistemaId ? { sistemaId } : undefined,
  })
}

/**
 * Lista notificações arquivadas
 * GET /api/notificacoes/arquivadas
 *
 * @param page - Número da página (padrão: 1)
 * @param pageSize - Itens por página (padrão: 20)
 * @returns Promise com notificações arquivadas paginadas
 */
export const listarArquivadas = async (
  page = 1,
  pageSize = 20,
): Promise<NotificacoesArquivadas> => {
  const response: AxiosResponse<NotificacoesArquivadas> =
    await apiNotificacoes.get('/api/notificacoes/arquivadas', {
      params: { page, pageSize },
    })

  return response.data
}

/**
 * Deleta uma notificação permanentemente
 * DELETE /api/notificacoes/{id}
 *
 * @param id - ID da notificação (NotificacaoUsuario.id)
 * @returns Promise void
 */
export const deletarNotificacao = async (id: string): Promise<void> => {
  await apiNotificacoes.delete(`/api/notificacoes/${id}`)
}

// ============================================================================
// PREFERÊNCIAS
// ============================================================================

/**
 * Obtém preferências do usuário autenticado
 * GET /api/preferencias/minhas
 *
 * @returns Promise com array de preferências
 */
export const obterPreferencias = async (): Promise<Preferencia[]> => {
  const response: AxiosResponse<Preferencia[]> = await apiNotificacoes.get(
    '/api/Preferencias/minhas',
  )

  return response.data
}

/**
 * Cria uma nova preferência
 * POST /api/preferencias
 *
 * @param preferencia - Dados da preferência (usuarioId será sobrescrito)
 * @returns Promise com a preferência criada
 */
export const criarPreferencia = async (preferencia: {
  sistemaId: string
  tipoNotificacao: string
  habilitada: boolean
}): Promise<Preferencia> => {
  const response: AxiosResponse<Preferencia> = await apiNotificacoes.post(
    '/api/preferencias',
    preferencia,
  )

  return response.data
}

/**
 * Atualiza uma preferência (habilita/desabilita)
 * PUT /api/preferencias/{id}
 *
 * @param id - ID da preferência
 * @param habilitada - true ou false
 * @returns Promise com a preferência atualizada
 */
export const atualizarPreferencia = async (
  id: string,
  habilitada: AtualizarPreferenciaRequest,
): Promise<Preferencia> => {
  const response: AxiosResponse<Preferencia> = await apiNotificacoes.put(
    `/api/preferencias/${id}`,
    habilitada,
  )

  return response.data
}

/**
 * Remove uma preferência
 * DELETE /api/preferencias/{id}
 *
 * @param id - ID da preferência
 * @returns Promise void
 */
export const deletarPreferencia = async (id: string): Promise<void> => {
  await apiNotificacoes.delete(`/api/preferencias/${id}`)
}

// ============================================================================
// SUBSCRIÇÕES (Seguir Entidades)
// ============================================================================

/**
 * Cria subscrição para seguir uma entidade
 * POST /api/subscricoes
 *
 * @param subscricao - Dados da subscrição (usuarioId será sobrescrito)
 * @returns Promise com a subscrição criada
 */
export const criarSubscricao = async (subscricao: {
  sistemaId: string
  entidadeOrigemId: string
}): Promise<Subscricao> => {
  const response: AxiosResponse<Subscricao> = await apiNotificacoes.post(
    '/api/subscricoes',
    subscricao,
  )

  return response.data
}

/**
 * Lista subscrições do usuário
 * GET /api/subscricoes/minhas
 *
 * @param page - Número da página (padrão: 1)
 * @param pageSize - Itens por página (padrão: 20)
 * @param sistemaId - Filtro opcional por sistema
 * @returns Promise com subscrições paginadas
 */
export const listarMinhasSubscricoes = async (
  page = 1,
  pageSize = 20,
  sistemaId?: string,
): Promise<SubscricoesPaginadas> => {
  const params: Record<string, unknown> = { page, pageSize }
  if (sistemaId) params.sistemaId = sistemaId

  const response: AxiosResponse<SubscricoesPaginadas> =
    await apiNotificacoes.get('/api/subscricoes/minhas', { params })

  return response.data
}

/**
 * Lista seguidores de uma entidade
 * GET /api/subscricoes/entidade/{sistemaId}/{entidadeOrigemId}
 *
 * @param sistemaId - ID do sistema
 * @param entidadeOrigemId - ID da entidade
 * @returns Promise com array de subscrições
 */
export const listarSeguidoresEntidade = async (
  sistemaId: string,
  entidadeOrigemId: string,
): Promise<Subscricao[]> => {
  const response: AxiosResponse<Subscricao[]> = await apiNotificacoes.get(
    `/api/subscricoes/entidade/${sistemaId}/${entidadeOrigemId}`,
  )

  return response.data
}

/**
 * Remove subscrição (deixa de seguir)
 * DELETE /api/subscricoes/{id}
 *
 * @param id - ID da subscrição
 * @returns Promise void
 */
export const deletarSubscricao = async (id: string): Promise<void> => {
  await apiNotificacoes.delete(`/api/subscricoes/${id}`)
}

/**
 * Toggle: seguir ou deixar de seguir uma entidade
 * POST /api/subscricoes/seguir
 *
 * @param request - sistemaId e entidadeOrigemId
 * @returns Promise com status de seguimento
 */
export const toggleSeguir = async (
  request: SeguirEntidadeRequest,
): Promise<SeguirEntidadeResponse> => {
  const response: AxiosResponse<SeguirEntidadeResponse> =
    await apiNotificacoes.post('/api/subscricoes/seguir', request)

  return response.data
}

/**
 * Verifica se está seguindo uma entidade
 * GET /api/subscricoes/estou-seguindo
 *
 * @param sistemaId - ID do sistema
 * @param entidadeOrigemId - ID da entidade
 * @returns Promise com status de seguimento
 */
export const verificarSeguindo = async (
  sistemaId: string,
  entidadeOrigemId: string,
): Promise<StatusSeguimentoResponse> => {
  const response: AxiosResponse<StatusSeguimentoResponse> =
    await apiNotificacoes.get('/api/subscricoes/estou-seguindo', {
      params: { sistemaId, entidadeOrigemId },
    })

  return response.data
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Verifica a saúde da API de notificações
 * GET /api/health
 *
 * @returns Promise com status da API
 */
export const verificarSaude = async (): Promise<{
  status: string
  service: string
  version: string
  timestamp: string
}> => {
  const response = await apiNotificacoes.get('/api/health')
  return response.data
}
