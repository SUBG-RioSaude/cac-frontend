import axios from 'axios'

import { createServiceLogger } from '@/lib/logger'
import type {
  ListarPermissoesResponse,
  SistemaResponse,
  UsuarioPermissaoSistemaRequest,
  UsuarioPermissaoSistemaResponse,
  AtualizarPermissoesRequest,
  AtualizarPermissoesResponse,
} from '@/types/permissoes'


const logger = createServiceLogger('permissoes-cadastro-service')

// Validação da variável de ambiente
const API_URL_PERMISSOES = import.meta.env.VITE_API_URL_PERMISSOES as string

if (!API_URL_PERMISSOES || API_URL_PERMISSOES === 'undefined') {
  throw new Error(
    'VITE_API_URL_PERMISSOES não configurada. Adicione VITE_API_URL_PERMISSOES=http://devcac:7010 no arquivo .env',
  )
}

// Cliente axios para API de Permissões
const permissoesApi = axios.create({
  baseURL: API_URL_PERMISSOES,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
  },
})

// Interface para erros da API
interface ApiError {
  response?: {
    data?: Record<string, unknown>
    status?: number
    statusText?: string
  }
  message?: string
}

/**
 * Service para gerenciar permissões durante o cadastro de funcionário/usuário
 * Utiliza endpoint específico de permissões (VITE_API_URL_PERMISSOES)
 */
export const permissoesCadastroService = {
  /**
   * Obtém lista de todas as permissões disponíveis no sistema
   * Endpoint: GET /api/permissoes
   */
  async listarPermissoes(): Promise<ListarPermissoesResponse> {
    try {
      logger.info({ action: 'listar-permissoes', status: 'requesting' })

      const response =
        await permissoesApi.get<ListarPermissoesResponse>('/api/permissoes')

      logger.info({
        action: 'listar-permissoes',
        status: 'success',
        totalPermissoes: response.data.dados.items?.length || 0,
      })

      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError

      logger.error({
        action: 'listar-permissoes',
        status: 'error',
        erro: apiError.message,
        statusCode: apiError.response?.status,
      })

      if (apiError.response?.data) {
        return apiError.response.data as unknown as ListarPermissoesResponse
      }

      throw new Error('Erro ao buscar lista de permissões')
    }
  },

  /**
   * Busca informações de um sistema por ID
   * Endpoint: GET /api/sistemas/{id}
   * NOTA: API retorna diretamente o objeto Sistema sem wrapper {sucesso, dados}
   */
  async buscarSistema(sistemaId: string): Promise<SistemaResponse> {
    try {
      logger.info({
        action: 'buscar-sistema',
        status: 'requesting',
        sistemaId,
      })

      // API retorna diretamente o objeto Sistema (sem wrapper)
      const response = await permissoesApi.get<{
        id: string
        nome: string
        descricao?: string
        ativo?: boolean
        atualizadoEm?: string
      }>(`/api/sistemas/${sistemaId}`)

      // Verificação defensiva
      if (!response.data) {
        logger.error({
          action: 'buscar-sistema',
          status: 'error',
          sistemaId,
          erro: 'response.data está undefined',
        })
        return {
          sucesso: false,
          mensagem: 'Resposta da API está vazia',
        }
      }

      logger.info({
        action: 'buscar-sistema',
        status: 'success',
        sistemaId,
        sistemaNome: response.data.nome,
      })

      // Normaliza para o formato esperado com wrapper
      return {
        sucesso: true,
        dados: {
          id: response.data.id,
          nome: response.data.nome,
          descricao: response.data.descricao ?? null,
          ativo: response.data.ativo ?? true,
          dataCadastro: response.data.atualizadoEm,
          dataAtualizacao: response.data.atualizadoEm ?? null,
        },
        mensagem: 'Sistema obtido com sucesso',
      }
    } catch (erro: unknown) {
      const apiError = erro as ApiError

      logger.error({
        action: 'buscar-sistema',
        status: 'error',
        sistemaId,
        erro: apiError.message,
        statusCode: apiError.response?.status,
      })

      // Retorna erro normalizado
      return {
        sucesso: false,
        mensagem: `Erro ao buscar sistema: ${apiError.message}`,
      }
    }
  },

  /**
   * Atribui uma permissão a um usuário em um sistema específico
   * Endpoint: POST /api/usuario-permissao-sistema
   */
  async atribuirPermissao(
    payload: UsuarioPermissaoSistemaRequest,
  ): Promise<UsuarioPermissaoSistemaResponse> {
    try {
      logger.info({
        action: 'atribuir-permissao',
        status: 'requesting',
        usuarioId: payload.usuarioId,
        sistemaId: payload.sistemaId,
        permissaoId: payload.permissaoId,
      })

      const response =
        await permissoesApi.post<UsuarioPermissaoSistemaResponse>(
          '/api/usuario-permissao-sistema',
          payload,
        )

      logger.info({
        action: 'atribuir-permissao',
        status: 'success',
        usuarioId: payload.usuarioId,
        permissaoId: payload.permissaoId,
      })

      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError

      logger.error({
        action: 'atribuir-permissao',
        status: 'error',
        usuarioId: payload.usuarioId,
        permissaoId: payload.permissaoId,
        erro: apiError.message,
        statusCode: apiError.response?.status,
      })

      if (apiError.response?.data) {
        return apiError.response
          .data as unknown as UsuarioPermissaoSistemaResponse
      }

      throw new Error('Erro ao atribuir permissão ao usuário')
    }
  },

  /**
   * Atualiza as permissões de um usuário (múltiplas permissões)
   * Novo endpoint da API v1.1: PUT /api/usuarios/{usuarioId}/permissoes
   * Remove todas as permissões antigas e adiciona as novas
   *
   * @param usuarioId - ID do usuário
   * @param payload - Array de permissões a serem atribuídas
   * @returns Response com todas as permissões atualizadas
   */
  async atualizarPermissoes(
    usuarioId: string,
    payload: AtualizarPermissoesRequest,
  ): Promise<AtualizarPermissoesResponse> {
    try {
      logger.info({
        action: 'atualizar-permissoes',
        status: 'requesting',
        usuarioId,
        totalPermissoes: payload.permissoes.length,
      })

      const response = await permissoesApi.put<AtualizarPermissoesResponse>(
        `/api/usuarios/${usuarioId}/permissoes`,
        payload,
      )

      logger.info({
        action: 'atualizar-permissoes',
        status: 'success',
        usuarioId,
        quantidadePermissoes: response.data.dados.quantidadePermissoes,
      })

      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError

      logger.error({
        action: 'atualizar-permissoes',
        status: 'error',
        usuarioId,
        totalPermissoes: payload.permissoes.length,
        erro: apiError.message,
        statusCode: apiError.response?.status,
      })

      if (apiError.response?.data) {
        return apiError.response.data as unknown as AtualizarPermissoesResponse
      }

      throw new Error('Erro ao atualizar permissões do usuário')
    }
  },
}
