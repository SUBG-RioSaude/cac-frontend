import axios from 'axios'

import type {
  ListarPermissoesResponse,
  MinhasPermissoesResponse,
  ValidarPermissaoRequest,
  ValidarPermissaoResponse,
} from '@/types/permissoes'

const API_URL_AUTH = import.meta.env.VITE_API_URL_AUTH as string
const API_URL = import.meta.env.VITE_API_URL as string

// Interface para erros da API
interface ApiError {
  response?: {
    data?: Record<string, unknown>
    status?: number
    statusText?: string
  }
  message?: string
}

// Cliente axios para API de autenticação (usa token automaticamente)
// Nota: VITE_API_URL_AUTH já contém /api no final
const authApi = axios.create({
  baseURL: API_URL_AUTH,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Cliente axios para API principal de permissões
// Nota: VITE_API_URL já contém /api no final
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const permissoesService = {
  /**
   * Obtém lista de todas as permissões disponíveis no sistema
   * Endpoint: GET /permissoes
   */
  async listarPermissoes(): Promise<ListarPermissoesResponse> {
    try {
      const response = await api.get<ListarPermissoesResponse>('/permissoes')
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as ListarPermissoesResponse
      }
      throw new Error('Erro ao buscar lista de permissões')
    }
  },

  /**
   * Valida se o usuário autenticado tem uma permissão específica em um sistema
   * Endpoint: GET /api/Auth/validar-permissao?sistemaId=X&permissaoNome=Y
   * Requer autenticação (Bearer token)
   */
  async validarPermissao(
    request: ValidarPermissaoRequest,
  ): Promise<ValidarPermissaoResponse> {
    try {
      const { sistemaId, permissaoNome } = request

      const response = await authApi.get<ValidarPermissaoResponse>(
        '/Auth/validar-permissao',
        {
          params: {
            sistemaId,
            permissaoNome,
          },
        },
      )

      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as ValidarPermissaoResponse
      }
      throw new Error('Erro ao validar permissão')
    }
  },

  /**
   * Obtém todas as permissões do usuário autenticado em um sistema específico
   * Endpoint: GET /api/Auth/minhas-permissoes?sistemaId=X
   * Requer autenticação (Bearer token)
   */
  async minhasPermissoes(sistemaId: string): Promise<MinhasPermissoesResponse> {
    try {
      const response = await authApi.get<MinhasPermissoesResponse>(
        '/Auth/minhas-permissoes',
        {
          params: { sistemaId },
        },
      )

      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as MinhasPermissoesResponse
      }
      throw new Error('Erro ao buscar permissões do usuário')
    }
  },
}
