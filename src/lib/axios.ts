
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { getToken } from './auth';
import { apiMetrics } from './api-metrics';

// Cliente para Gateway (rota principal)
export const apiGateway = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000, // Timeout mais curto para fallback rápido
    withCredentials: true,
})

// Cliente para Microserviço Direto (fallback)
export const apiDirect = axios.create({
    baseURL: import.meta.env.VITE_API_URL_CONTRATOS,
    timeout: 10000,
    withCredentials: true,
})

// Cliente principal com fallback automático
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    withCredentials: true,
})

// Interceptor de autenticação para todos os clientes
const authInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}

apiGateway.interceptors.request.use(authInterceptor)
apiDirect.interceptors.request.use(authInterceptor)
api.interceptors.request.use(authInterceptor)

// Função para executar requisição com fallback automático
export async function executeWithFallback<T>(
    requestConfig: {
        method: 'get' | 'post' | 'put' | 'delete' | 'patch'
        url: string
        data?: unknown
        params?: Record<string, unknown>
        headers?: Record<string, string>
    }
): Promise<AxiosResponse<T>> {
    const { method, url, data, params, headers } = requestConfig
    
    try {
        console.log(`[API] Tentando gateway: ${method.toUpperCase()} ${url}`)
        
        // Primeira tentativa: Gateway
        const response = await apiGateway.request<T>({
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
                const fallbackResponse = await apiDirect.request<T>({
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