import axios from 'axios'

import { useAuthStore } from '@/lib/auth/auth-store'
import { cookieUtils } from '@/lib/auth/cookie-utils'
import type {
  CriarPatchNoteRequest,
  ListarPatchNotesResponse,
  ListarPatchNotesParams,
} from '@/types/patch-notes'

const API_URL = import.meta.env.VITE_NOTIFICACOES_API_URL as string
const BROADCAST_TOKEN = import.meta.env.VITE_API_BROADCAST_TOKEN as string
const SYSTEM_ID = import.meta.env.VITE_SYSTEM_ID as string

// Interface para erros da API
interface ApiError {
  response?: {
    data?: {
      mensagem?: string
      errors?: Record<string, string[]>
    }
    status?: number
    statusText?: string
  }
  message?: string
}

// Configuração do axios para Patch Notes API
const patchNotesApi = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Função para obter token JWT do usuário dos cookies
const getAuthToken = (): string | null => {
  // Buscar token dos cookies (fonte primária)
  let token = cookieUtils.getCookie('token')

  // Fallback: tentar 'auth_token'
  token ??= cookieUtils.getCookie('auth_token')

  // Fallback: buscar do store Zustand
  if (!token) {
    const { getToken } = useAuthStore.getState()
    token = getToken()
  }

  return token
}

// Interceptor para adicionar token de autenticação (GET usa JWT do usuário)
patchNotesApi.interceptors.request.use((config) => {
  // Se já existe um Authorization header customizado (ex: broadcast token), não sobrescrever
  if (!config.headers.Authorization) {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export const patchNotesService = {
  /**
   * Lista todos os Patch Notes do sistema
   * GET /api/PatchNotes
   *
   * @param params - Parâmetros de paginação e filtros
   * @returns Lista paginada de patch notes
   */
  async listar(
    params?: ListarPatchNotesParams,
  ): Promise<ListarPatchNotesResponse> {
    try {
      const response = await patchNotesApi.get<ListarPatchNotesResponse>(
        '/PatchNotes',
        {
          params: {
            sistemaId: params?.sistemaId ?? SYSTEM_ID,
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? 50,
          },
        },
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        throw new Error(
          apiError.response.data.mensagem ?? 'Erro ao listar patch notes',
        )
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  /**
   * Cria um novo Patch Note
   * POST /api/PatchNotes (usa BROADCAST_TOKEN ao invés do JWT do usuário)
   *
   * @param data - Dados do patch note a ser criado
   * @returns Patch note criado
   */
  async criar(data: CriarPatchNoteRequest): Promise<void> {
    try {
      // POST usa o token de broadcast ao invés do JWT do usuário
      await patchNotesApi.post('/PatchNotes', data, {
        headers: {
          Authorization: `${BROADCAST_TOKEN}`,
        },
      })
    } catch (erro: unknown) {
      const apiError = erro as ApiError

      // Tratamento de erros de validação (400)
      if (apiError.response?.status === 400) {
        const errors = apiError.response.data?.errors
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(', ')
          throw new Error(errorMessages)
        }
      }

      if (apiError.response?.data?.mensagem) {
        throw new Error(apiError.response.data.mensagem)
      }

      throw new Error('Erro ao criar patch note')
    }
  },
}
