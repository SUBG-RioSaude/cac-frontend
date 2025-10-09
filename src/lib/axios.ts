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
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
  },
})

// Cliente para Microserviço Direto (fallback)
export const apiDirect = axios.create({
    baseURL: import.meta.env.VITE_API_URL_CONTRATOS,
    timeout: 30000, // Aumentado para 30s para operações complexas
    withCredentials: false,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    },
})

// Interceptador de requisição para adicionar token dos cookies
// Cliente principal com fallback automático
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 5000,
  withCredentials: false,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
  },
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

  // Garante que sempre envie charset UTF-8
  config.headers['Content-Type'] ??= 'application/json; charset=utf-8'
  config.headers.Accept ??= 'application/json'

  return config
}

apiGateway.interceptors.request.use(authInterceptor)
apiDirect.interceptors.request.use(authInterceptor)
api.interceptors.request.use(authInterceptor)

// Interceptor de resposta para garantir UTF-8
const utf8ResponseInterceptor = (response: AxiosResponse) => {
  // Se a resposta contém dados do tipo string, garante que está decodificado como UTF-8
  if (response.data && typeof response.data === 'object') {
    // Axios já decodifica JSON automaticamente, mas podemos garantir o charset
    response.headers['content-type'] = 'application/json; charset=utf-8'
  }
  return response
}

apiGateway.interceptors.response.use(utf8ResponseInterceptor)
apiDirect.interceptors.response.use(utf8ResponseInterceptor)
api.interceptors.response.use(utf8ResponseInterceptor)

// Função para executar requisição com fallback automático
export async function executeWithFallback<T>(
    requestConfig: {
        method: 'get' | 'post' | 'put' | 'delete' | 'patch'
        url: string
        data?: unknown
        params?: Record<string, unknown>
        headers?: Record<string, string>
        baseURL?: string
        timeout?: number // Novo parâmetro para timeout customizado
    }
): Promise<AxiosResponse<T>> {
    const { method, url, data, params, headers, baseURL, timeout } = requestConfig
    
    try {
        console.log(`[API] Tentando gateway: ${method.toUpperCase()} ${url}`)
        
        // Primeira tentativa: Gateway ou baseURL específica
        const gatewayTimeout = timeout ?? 5000
        const clientToUse = baseURL ? axios.create({ baseURL, timeout: gatewayTimeout }) : apiGateway
        if (baseURL) {
            clientToUse.interceptors.request.use(authInterceptor)
        }
        
        const response = await clientToUse.request<T>({
            method,
            url,
            data,
            params,
            headers
        })
        
        console.log(`[API] ✅ Gateway respondeu: ${response.status}`)
        apiMetrics.recordGatewaySuccess()
        return response
        
    } catch (gatewayError) {
        const error = gatewayError as AxiosError
        
        // Verificar se deve fazer fallback
        const shouldFallback = (
            // Erro de rede/timeout
            !error.response ||
            // Erro 5xx do gateway
            (error.response.status >= 500) ||
            // Timeout
            error.code === 'ECONNABORTED'
        )
        
        if (shouldFallback) {
            const failureReason = error.response ? `${error.response.status} ${error.response.statusText}` : error.message
            apiMetrics.recordGatewayFailure(failureReason)
            console.warn(`[API] ⚠️ Gateway falhou: ${error.message}. Tentando microserviço direto...`)
            
            try {
                // Usar timeout customizado se fornecido, senão usar o padrão do apiDirect
                const directTimeout = timeout ?? 30000
                const directClient = axios.create({
                    baseURL: import.meta.env.VITE_API_URL_CONTRATOS,
                    timeout: directTimeout,
                    withCredentials: false,
                })
                directClient.interceptors.request.use(authInterceptor)
                
                const fallbackResponse = await directClient.request<T>({
                    method,
                    url,
                    data,
                    params,
                    headers
                })
                
                console.log(`[API] ✅ Microserviço direto respondeu: ${fallbackResponse.status}`)
                apiMetrics.recordDirectSuccess()
                return fallbackResponse
                
            } catch (directError) {
                const directErr = directError as AxiosError
                const directFailureReason = directErr.response ? `${directErr.response.status} ${directErr.response.statusText}` : directErr.message
                apiMetrics.recordDirectFailure(directFailureReason)
                console.error(`[API] ❌ Microserviço direto também falhou:`, directError)
                throw directError
            }
        } else {
            // Erro que não deve fazer fallback (4xx, etc)
            const noFallbackReason = error.response ? `${error.response.status} ${error.response.statusText}` : error.message
            apiMetrics.recordGatewayFailure(noFallbackReason)
            console.error(`[API] ❌ Gateway erro sem fallback: ${error.response?.status}`)
            throw gatewayError
        }
    }
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

// Aplica interceptor de renovação em todos os clientes
api.interceptors.response.use((response) => response, createTokenRenewalInterceptor())
apiGateway.interceptors.response.use((response) => response, createTokenRenewalInterceptor())
apiDirect.interceptors.response.use((response) => response, createTokenRenewalInterceptor())

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
