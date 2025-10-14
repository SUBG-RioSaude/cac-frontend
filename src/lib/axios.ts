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
    'Accept': 'application/json',
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
export async function executeWithFallback<T>(
  requestConfig: {
    method: 'get' | 'post' | 'put' | 'delete' | 'patch'
    url: string
    data?: unknown
    params?: Record<string, unknown>
    headers?: Record<string, string>
    baseURL?: string // Mantido para compatibilidade, mas ignorado
    timeout?: number
  },
): Promise<AxiosResponse<T>> {
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
      try {
        const renovado = await renovarToken()
        if (renovado && config) {
          // Reexecuta a requisição original com o novo token
          const token = getToken()
          if (token && token.split('.').length === 3) {
            config.headers.Authorization = `Bearer ${token}`
            // Usa o cliente axios que originou a requisição
            return axios.request(config)
          }
        }
      } catch {
        // Se não conseguir renovar, faz logout
        logout()
        window.location.href = '/login'
        return Promise.reject(new Error('Falha na renovação do token'))
      }
    }

    return Promise.reject(new Error(erro.message || 'Erro na requisição'))
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
    'Accept': 'application/json',
  },
})

// Cliente para o ChatHub (bypass do gateway)
export const chatApi = axios.create({
  baseURL: import.meta.env.VITE_API_CHAT_SOCKET_URL as string,
  timeout: 30000,
  withCredentials: false,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
  },
})

// Aplica interceptores de autenticação e UTF-8 ao chatApi
chatApi.interceptors.request.use(authInterceptor)
chatApi.interceptors.response.use(utf8ResponseInterceptor)

// Aplica interceptor de renovação de token ao chatApi
chatApi.interceptors.response.use(
  (response) => response,
  createTokenRenewalInterceptor(),
)
