import { useAuthStore } from './auth-store'
import { cookieUtils } from './cookie-utils'

// Função para validar formato de token JWT
const validarTokenJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false
  const partes = token.split('.')
  return partes.length === 3 && partes.every((part) => part.length > 0)
}

// Função para obter o token JWT atual dos cookies
export function getToken(): string | null {
  const token = cookieUtils.getCookie('auth_token')
  if (token && validarTokenJWT(token)) {
    return token
  }
  return null
}

// Função para obter o refresh token dos cookies
export function getRefreshToken(): string | null {
  const refreshToken = cookieUtils.getCookie('auth_refresh_token')
  if (refreshToken && validarTokenJWT(refreshToken)) {
    return refreshToken
  }
  return null
}

// Função para verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  return useAuthStore.getState().estaAutenticado
}

// Função para obter informações do usuário
export function getUsuario() {
  return useAuthStore.getState().usuario
}

// Função para fazer logout
export function logout(): void {
  useAuthStore.getState().logout()
}

// Função para renovar token automaticamente
export async function renovarToken(): Promise<boolean> {
  return await useAuthStore.getState().renovarToken()
}

// Função para verificar se os cookies de autenticação existem e são válidos
export function hasAuthCookies(): boolean {
  const token = cookieUtils.getCookie('auth_token')
  const refreshToken = cookieUtils.getCookie('auth_refresh_token')

  return !!(
    token &&
    refreshToken &&
    validarTokenJWT(token) &&
    validarTokenJWT(refreshToken)
  )
}

// Função para limpar todos os cookies de autenticação
export function clearAuthCookies(): void {
  cookieUtils.removeCookie('auth_token')
  cookieUtils.removeCookie('auth_refresh_token')
}

// Função para validar se um token está próximo de expirar
export function isTokenNearExpiry(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Converte para milissegundos
    const now = Date.now()
    const timeUntilExpiry = exp - now

    // Retorna true se faltar menos de 5 minutos para expirar
    return timeUntilExpiry < 5 * 60 * 1000
  } catch {
    return true // Se não conseguir decodificar, considera como próximo de expirar
  }
}

// Função para obter informações do token (sem validação de assinatura)
export function getTokenInfo(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      exp: new Date(payload.exp * 1000),
      iat: new Date(payload.iat * 1000),
      sub: payload.sub,
      email: payload.email,
    }
  } catch {
    return null
  }
}
