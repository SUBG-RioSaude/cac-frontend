import type { AxiosError } from 'axios'
import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { apiMetrics } from './api-metrics'
import { getToken, logout, renovarToken } from './auth/auth'

// Cliente para Gateway (rota principal)
export const apiGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 5000, // Timeout mais curto para fallback rápido
  withCredentials: false,
})

// Cliente para Microserviço Direto (fallback)
export const apiDirect = axios.create({
  baseURL: import.meta.env.VITE_API_URL_CONTRATOS as string,
  timeout: 10000,
  withCredentials: false,
})

// Interceptador de requisição para adicionar token dos cookies
// Cliente principal com fallback automático
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 5000,
  withCredentials: false,
})

// Interceptor de autenticação para todos os clientes
const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    // Valida se o token tem formato JWT válido
    if (token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Token inválido - não adiciona ao header
  }
  return config
}

apiGateway.interceptors.request.use(authInterceptor)
apiDirect.interceptors.request.use(authInterceptor)
api.interceptors.request.use(authInterceptor)

// Função para executar requisição com fallback automático
export async function executeWithFallback<T>(requestConfig: {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  url: string
  data?: unknown
  params?: Record<string, unknown>
  headers?: Record<string, string>
  baseURL?: string
}): Promise<AxiosResponse<T>> {
  const { method, url, data, params, headers, baseURL } = requestConfig

  try {
    // Primeira tentativa: Gateway ou baseURL específica
    const clientToUse = baseURL
      ? axios.create({ baseURL, timeout: 5000 })
      : apiGateway
    if (baseURL) {
      clientToUse.interceptors.request.use(authInterceptor)
    }

    const response = await clientToUse.request<T>({
      method,
      url,
      data,
      params,
      headers,
    })

    apiMetrics.recordGatewaySuccess()
    return response
  } catch (gatewayError) {
    const error = gatewayError as AxiosError

    // Verificar se deve fazer fallback
    const shouldFallback =
      // Erro de rede/timeout
      !error.response ||
      // Erro 5xx do gateway
      error.response.status >= 500 ||
      // Timeout
      error.code === 'ECONNABORTED'

    if (shouldFallback) {
      const failureReason = error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message
      apiMetrics.recordGatewayFailure(failureReason)

      try {
        const fallbackResponse = await apiDirect.request<T>({
          method,
          url,
          data,
          params,
          headers,
        })

        apiMetrics.recordDirectSuccess()
        return fallbackResponse
      } catch (directError) {
        const directErr = directError as AxiosError
        const directFailureReason = directErr.response
          ? `${directErr.response.status} ${directErr.response.statusText}`
          : directErr.message
        apiMetrics.recordDirectFailure(directFailureReason)
        throw directError
      }
    } else {
      // Erro que não deve fazer fallback (4xx, etc)
      const noFallbackReason = error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message
      apiMetrics.recordGatewayFailure(noFallbackReason)
      throw gatewayError
    }
  }
}

// Interceptador de resposta para renovação automática de token
api.interceptors.response.use(
  (response) => response,
  async (erro: AxiosError) => {
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
            return api.request(config)
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
  },
)

// API específica para autenticação (sem interceptadores de renovação)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_AUTH as string,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
