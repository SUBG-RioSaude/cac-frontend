import type { AxiosError } from 'axios'
import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { getToken, logout, renovarToken } from './auth/auth'

// Cliente para Gateway centralizado
export const apiGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 30000, // Timeout único de 30s para operações
  withCredentials: false,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
  },
})

// Cliente principal (alias para apiGateway)
export const api = apiGateway

// Interceptor de autenticação
const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    // Valida se o token tem formato JWT válido
    if (token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Token inválido - não adiciona ao header
  }

  // Garante que sempre envie charset UTF-8
  config.headers['Content-Type'] ??= 'application/json; charset=utf-8'
  config.headers.Accept ??= 'application/json'

  return config
}

// Aplica interceptor de autenticação
apiGateway.interceptors.request.use(authInterceptor)

// Interceptor de resposta para garantir UTF-8
const utf8ResponseInterceptor = (response: AxiosResponse) => {
  if (response.data && typeof response.data === 'object') {
    response.headers['content-type'] = 'application/json; charset=utf-8'
  }
  return response
}

apiGateway.interceptors.response.use(utf8ResponseInterceptor)

/**
 * Função simplificada para requisições via Gateway centralizado
 * Substitui o antigo sistema de fallback (executeWithFallback)
 */
export async function executeWithFallback<T>(requestConfig: {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  url: string
  data?: unknown
  params?: Record<string, unknown>
  headers?: Record<string, string>
  baseURL?: string // Mantido para compatibilidade, mas ignorado
  timeout?: number
}): Promise<AxiosResponse<T>> {
  const { method, url, data, params, headers, timeout } = requestConfig

  console.log(`[API Gateway] ${method.toUpperCase()} ${url}`)

  const response = await apiGateway.request<T>({
    method,
    url,
    data,
    params,
    headers,
    timeout: timeout ?? 30000,
  })

  console.log(`[API Gateway] ✅ ${response.status}`)
  return response
}

// Interceptador de resposta reutilizável para renovação automática de token
const createTokenRenewalInterceptor = () => {
  return async (erro: AxiosError) => {
    const { response, config } = erro

    // Se o erro for 401 (não autorizado), tenta renovar o token
    if (response?.status === 401) {
      console.log('🔴 [Axios Interceptor] Erro 401 detectado')
      console.log('🔍 [Axios Interceptor] URL:', config?.url)

      try {
        // ⭐ VERIFICA SE HÁ REFRESH TOKEN ANTES DE TENTAR RENOVAR
        const { getRefreshToken } = await import('./auth/auth')
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          console.warn('⚠️ [Axios Interceptor] Sem refresh token, não tenta renovar')
          // Não faz logout - pode ser primeira requisição ou já deslogado
          return Promise.reject(erro)
        }

        console.log('🔄 [Axios Interceptor] Tentando renovar token...')
        const renovado = await renovarToken()

        if (renovado && config) {
          console.log('✅ [Axios Interceptor] Token renovado com sucesso')

          // Reexecuta a requisição original com o novo token
          const token = getToken()
          if (token && token.split('.').length === 3) {
            config.headers.Authorization = `Bearer ${token}`
            console.log('🔄 [Axios Interceptor] Reexecutando requisição original')
            // Usa o cliente axios que originou a requisição
            return axios.request(config)
          }

          // Se renovou mas token inválido, faz logout
          console.error('❌ [Axios Interceptor] Token renovado é inválido')
          logout()
          window.location.href = '/login'
          return Promise.reject(new Error('Token renovado inválido'))
        } else {
          // Renovação falhou, faz logout
          console.error('❌ [Axios Interceptor] Falha na renovação do token')
          logout()
          window.location.href = '/login'
          return Promise.reject(new Error('Falha na renovação do token'))
        }
      } catch (erroRenovacao) {
        // Log mais detalhado do erro
        console.error('❌ [Axios Interceptor] Erro ao renovar token:', erroRenovacao)
        logout()
        window.location.href = '/login'
        return Promise.reject(new Error('Falha na renovação do token'))
      }
    }

    // Para outros erros, apenas rejeita sem fazer logout
    return Promise.reject(erro)
  }
}

// Aplica interceptor de renovação
apiGateway.interceptors.response.use(
  (response) => response,
  createTokenRenewalInterceptor(),
)

// API específica para autenticação (sem interceptadores de renovação)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_AUTH as string,
  timeout: 10000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
  },
})

// Aplica interceptor de autenticação ao authApi (MAS SEM renovação automática)
authApi.interceptors.request.use(authInterceptor)

// Aplica interceptor UTF-8 ao authApi
authApi.interceptors.response.use(utf8ResponseInterceptor)

// Validação da variável de ambiente para Chat API
const CHAT_API_BASE_URL = import.meta.env.VITE_API_CHAT_SOCKET_URL as string

if (!CHAT_API_BASE_URL || CHAT_API_BASE_URL === 'undefined') {
  throw new Error(
    'VITE_API_CHAT_SOCKET_URL não configurada. Verifique o arquivo .env',
  )
}

// Cliente para o ChatHub (bypass do gateway)
export const chatApi = axios.create({
  baseURL: CHAT_API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
  },
})

// Interceptor de debug para Chat API
chatApi.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`
  console.log(`[Chat API] ${config.method?.toUpperCase() ?? 'GET'} ${fullUrl}`)
  return authInterceptor(config)
})

// Aplica interceptor UTF-8 ao chatApi
chatApi.interceptors.response.use(utf8ResponseInterceptor)

// Aplica interceptor de renovação de token ao chatApi
chatApi.interceptors.response.use(
  (response) => response,
  createTokenRenewalInterceptor(),
)
