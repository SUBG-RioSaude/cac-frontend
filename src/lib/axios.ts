
import axios from 'axios'
import { getToken, renovarToken, logout } from './auth/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: false,
})

// Interceptador de requisição para adicionar token dos cookies
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    // Valida se o token tem formato JWT válido
    if (token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('Token JWT inválido detectado')
    }
  }
  return config
})

// Interceptador de resposta para renovação automática de token
api.interceptors.response.use(
  (response) => response,
  async (erro) => {
    const { response } = erro

    // Se o erro for 401 (não autorizado), tenta renovar o token
    if (response?.status === 401) {
      try {
        const renovado = await renovarToken()
        if (renovado) {
          // Reexecuta a requisição original com o novo token
          const token = getToken()
          if (token && token.split('.').length === 3) {
            erro.config.headers.Authorization = `Bearer ${token}`
            return api.request(erro.config)
          }
        }
      } catch (renovacaoErro) {
        // Se não conseguir renovar, faz logout
        console.error('Erro ao renovar token:', renovacaoErro)
        logout()
        window.location.href = '/login'
        return Promise.reject(erro)
      }
    }

    return Promise.reject(erro)
  }
)

// API específica para autenticação (sem interceptadores de renovação)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_AUTH,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})