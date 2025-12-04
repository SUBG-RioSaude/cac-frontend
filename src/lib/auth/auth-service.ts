import axios from 'axios'

import { SISTEMA_FRONTEND_ID } from '@/config/sistemas'
import type {
  LoginRequest,
  LoginResponse,
  ConfirmarCodigo2FARequest,
  ConfirmarCodigo2FAResponse,
  TrocarSenhaRequest,
  TrocarSenhaResponse,
  EsqueciSenhaRequest,
  EsqueciSenhaResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  VerificarAcessoResponse,
  RegisterRequest,
  RegisterResponse,
  VerificarUsuarioCpfResponse,
  AlterarSenhaRequest,
  AlterarSenhaResponse,
} from '@/types/auth'

const API_URL = import.meta.env.VITE_API_URL_AUTH as string

// Interface para erros da API
interface ApiError {
  response?: {
    data?: Record<string, unknown>
    status?: number
    statusText?: string
  }
  message?: string
}

// Configuração do axios para autenticação
const authApi = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authService = {
  // Login - Primeira etapa (envia código 2FA)
  async login(email: string, senha: string): Promise<LoginResponse> {
    const payload: LoginRequest = {
      email,
      senha,
      sistemaId: import.meta.env.VITE_SYSTEM_ID as string,
    }

    try {
      const response = await authApi.post<LoginResponse>('/Auth/login', payload)
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as LoginResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  // Confirmação do código 2FA - Segunda etapa
  async confirmarCodigo2FA(
    email: string,
    codigo: string,
  ): Promise<ConfirmarCodigo2FAResponse> {
    const payload: ConfirmarCodigo2FARequest = {
      email,
      codigo,
      sistemaId: import.meta.env.VITE_SYSTEM_ID as string,
    }

    try {
      const response = await authApi.post<ConfirmarCodigo2FAResponse>(
        '/Auth/confirmar-codigo-2fa',
        payload,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as ConfirmarCodigo2FAResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  // Troca de senha
  async trocarSenha(
    email: string,
    novaSenha: string,
    tokenTrocaSenha?: string,
  ): Promise<TrocarSenhaResponse> {
    const payload: TrocarSenhaRequest = {
      email,
      novaSenha,
      tokenTrocaSenha,
      sistemaId: SISTEMA_FRONTEND_ID,
    }

    try {
      const response = await authApi.post<TrocarSenhaResponse>(
        '/Auth/trocar-senha',
        payload,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as TrocarSenhaResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  // Esqueci a senha
  async esqueciSenha(email: string): Promise<EsqueciSenhaResponse> {
    const payload: EsqueciSenhaRequest = { email }

    try {
      const response = await authApi.post<EsqueciSenhaResponse>(
        '/Auth/esqueci-senha',
        payload,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as EsqueciSenhaResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  // Renovação de token
  async renovarToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const payload: RefreshTokenRequest = {
      refreshToken,
      sistemaId: SISTEMA_FRONTEND_ID,
    }

    try {
      const response = await authApi.post<RefreshTokenResponse>(
        '/Auth/refresh-token',
        payload,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as RefreshTokenResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  // Logout
  async logout(refreshToken: string): Promise<LogoutResponse> {
    const payload: LogoutRequest = { refreshToken }

    try {
      const response = await authApi.post<LogoutResponse>(
        '/Auth/logout',
        payload,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as LogoutResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  // Logout de todas as sessões
  async logoutTodasSessoes(refreshToken: string): Promise<LogoutResponse> {
    const payload: LogoutRequest = { refreshToken }

    try {
      const response = await authApi.post<LogoutResponse>(
        '/Auth/logout-all-sessions',
        payload,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as LogoutResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  // Verificar acesso ao sistema
  async verificarAcesso(): Promise<VerificarAcessoResponse> {
    try {
      const response = await authApi.get<VerificarAcessoResponse>(
        `/usuario-permissao-sistema/verificar-acesso/${
          import.meta.env.VITE_SYSTEM_ID
        }`,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as VerificarAcessoResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  /**
   * Verifica se um usuário já existe através do CPF
   * Novo endpoint da API v1.1: GET /Auth/verificar-usuario-por-cpf/{cpf}
   * Retorna dados completos do usuário e permissões se existir
   *
   * @param cpf - CPF do usuário (apenas números, 11 dígitos)
   * @returns Resposta com flag 'existe' e dados do usuário (se existir)
   */
  async verificarUsuarioPorCpf(cpf: string): Promise<VerificarUsuarioCpfResponse> {
    try {
      const response = await authApi.get<VerificarUsuarioCpfResponse>(
        `/Auth/verificar-usuario-por-cpf/${cpf}`,
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as VerificarUsuarioCpfResponse
      }
      throw new Error('Erro ao verificar usuário por CPF')
    }
  },

  /**
   * Registra um novo usuário no sistema
   * API v1.1: Retorna 409 Conflict quando CPF já existe (com dados completos)
   *
   * @param data - Dados do usuário a ser registrado
   * @returns Resposta com usuarioId (novo) ou dados completos (409 Conflict)
   */
  async registerUsuario(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await authApi.post<RegisterResponse>('/Auth/register', data)
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError

      // 409 Conflict não é erro - usuário já existe, retornar dados
      if (apiError.response?.status === 409 && apiError.response?.data) {
        return apiError.response.data as unknown as RegisterResponse
      }

      // 400 Bad Request com "E-mail já cadastrado" - tratamento especial
      if (apiError.response?.status === 400 && apiError.response?.data) {
        const errorData = apiError.response.data as unknown as RegisterResponse
        // Verificar se a mensagem indica email duplicado
        if (errorData.mensagem?.toLowerCase().includes('e-mail já cadastrado')) {
          // Retornar resposta indicando que email existe (dados será null)
          return {
            sucesso: false,
            mensagem: errorData.mensagem,
            dados: {
              // Indica que precisa buscar usuário por CPF
              emailJaCadastrado: true,
            } as any,
          }
        }
      }

      // Outros erros
      if (apiError.response?.data) {
        return apiError.response.data as unknown as RegisterResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  },

  /**
   * Altera a senha do usuário autenticado
   * Endpoint: POST /api/auth/alterar-senha
   * IMPORTANTE: Requer Bearer Token no header Authorization
   *
   * @param data - Dados com senha atual, nova senha e confirmação
   * @param token - JWT token do usuário autenticado
   * @returns Resposta indicando sucesso ou falha
   */
  async alterarSenha(
    data: AlterarSenhaRequest,
    token: string,
  ): Promise<AlterarSenhaResponse> {
    try {
      const response = await authApi.post<AlterarSenhaResponse>(
        '/Auth/alterar-senha',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError

      // Tratamento de erros específicos
      if (apiError.response?.data) {
        return apiError.response.data as unknown as AlterarSenhaResponse
      }

      // Erro de conexão
      throw new Error('Erro de conexão com o servidor')
    }
  },
}
