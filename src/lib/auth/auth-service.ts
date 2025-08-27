import axios from 'axios'
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
  VerificarAcessoResponse
} from '@/types/auth'

const API_URL = import.meta.env.VITE_API_URL_AUTH

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
  baseURL: `${API_URL}/api/Auth`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const authService = {
  // Login - Primeira etapa (envia código 2FA)
  async login(email: string, senha: string): Promise<LoginResponse> {
    const payload: LoginRequest = {
      email,
      senha,
      sistemaId: import.meta.env.SYSTEM_ID
    }

    try {
      const response = await authApi.post<LoginResponse>('/login', payload)
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
  async confirmarCodigo2FA(email: string, codigo: string): Promise<ConfirmarCodigo2FAResponse> {
    const payload: ConfirmarCodigo2FARequest = { email, codigo }

    try {
      const response = await authApi.post<ConfirmarCodigo2FAResponse>('/confirmar-codigo-2fa', payload)
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
  async trocarSenha(email: string, novaSenha: string, tokenTrocaSenha?: string): Promise<TrocarSenhaResponse> {
    const payload: TrocarSenhaRequest = { email, novaSenha, tokenTrocaSenha }

    try {
      const response = await authApi.post<TrocarSenhaResponse>('/trocar-senha', payload)
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
      const response = await authApi.post<EsqueciSenhaResponse>('/esqueci-senha', payload)
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
    const payload: RefreshTokenRequest = { refreshToken }

    try {
      const response = await authApi.post<RefreshTokenResponse>('/refresh-token', payload)
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
      const response = await authApi.post<LogoutResponse>('/logout', payload)
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
      const response = await authApi.post<LogoutResponse>('/logout-all-sessions', payload)
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
      const response = await authApi.get<VerificarAcessoResponse>('/usuariopermissaosistema/verificar-acesso/' + import.meta.env.SYSTEM_ID)
      return response.data
    } catch (erro: unknown) {
      const apiError = erro as ApiError
      if (apiError.response?.data) {
        return apiError.response.data as unknown as VerificarAcessoResponse
      }
      throw new Error('Erro de conexão com o servidor')
    }
  }
}
