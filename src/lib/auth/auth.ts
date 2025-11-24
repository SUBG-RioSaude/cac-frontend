import { useAuthStore } from './auth-store'
import { cookieUtils } from './cookie-utils'

// Função auxiliar para decodificar base64 com suporte correto a UTF-8
function decodeBase64UTF8(base64: string): string {
  // Decodifica base64 para bytes
  const binaryString = atob(base64)

  // Converte bytes para array de códigos
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Decodifica UTF-8 corretamente
  return new TextDecoder('utf-8').decode(bytes)
}

// Função para validar formato de token JWT
const validarTokenJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false
  const partes = token.split('.')
  return partes.length === 3 && partes.every((part) => part.length > 0)
}

// Normaliza valores vindos do payload do JWT para um array de strings
const normalizarValorParaArrayStrings = (valor: unknown): string[] => {
  if (valor === null || valor === undefined) {
    return []
  }

  if (Array.isArray(valor)) {
    return valor
      .map((item) => {
        if (typeof item === 'number') return item.toString()
        if (typeof item === 'string') return item.trim()
        return String(item)
      })
      .filter((item) => item.length > 0)
  }

  if (typeof valor === 'string') {
    return valor
      .split(',')
      .map((parte) => parte.trim())
      .filter((parte) => parte.length > 0)
  }

  if (typeof valor === 'number') {
    return [valor.toString()]
  }

  return []
}

// Função para obter o token JWT atual (MEMÓRIA primeiro, cookies como fallback)
export function getToken(): string | null {
  const token = useAuthStore.getState().getToken()

  if (token && validarTokenJWT(token)) {
    return token
  }
  return null
}

// Função para obter o refresh token (MEMÓRIA primeiro, cookies como fallback)
// Nota: Refresh token pode ser um token opaco (não JWT), então não validamos formato
export function getRefreshToken(): string | null {
  return useAuthStore.getState().getRefreshToken()
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

// Função para verificar se há tokens de autenticação válidos (memória OU cookies)
export function hasAuthCookies(): boolean {
  // Verifica memória primeiro
  const state = useAuthStore.getState()
  if (state.token && state.refreshToken && validarTokenJWT(state.token)) {
    return true
  }

  // Fallback: verifica cookies
  const token = state.getToken()
  const refreshToken = state.getRefreshToken()

  // Valida apenas o auth_token como JWT (formato obrigatório)
  // O refresh_token pode ser um token opaco (não JWT), então só verificamos a existência
  return !!(token && refreshToken && validarTokenJWT(token))
}

// Função para limpar todos os cookies de autenticação
export function clearAuthCookies(): void {
  cookieUtils.removeCookie('auth_token')
  cookieUtils.removeCookie('auth_refresh_token')
}

// Função para validar se um token está próximo de expirar
export function isTokenNearExpiry(
  token: string,
  minutesThreshold = 5,
): boolean {
  try {
    const [, base64Payload] = token.split('.')
    const payloadString = decodeBase64UTF8(base64Payload)
    const payload = JSON.parse(payloadString) as { exp: number }
    const exp = payload.exp * 1000 // Converte para milissegundos
    const now = Date.now()
    const timeUntilExpiry = exp - now

    // Retorna true se faltar menos de X minutos para expirar (padrão: 5min)
    return timeUntilExpiry < minutesThreshold * 60 * 1000
  } catch {
    return true // Se não conseguir decodificar, considera como próximo de expirar
  }
}

// Função para obter informações do token (sem validação de assinatura)
export function getTokenInfo(token: string) {
  try {
    // Decodifica o payload do JWT com suporte correto a UTF-8
    const [, base64Payload] = token.split('.')
    const payloadString = decodeBase64UTF8(base64Payload)
    const payload = JSON.parse(payloadString)

    const permissaoNome = normalizarValorParaArrayStrings(
      payload.permissaoNome ?? payload.nomePermissao,
    )
    const permissaoIds = normalizarValorParaArrayStrings(
      payload.permissao ?? payload.permissaoId ?? payload.permissaoIds,
    )

    return {
      sub: payload.sub,
      usuarioId: payload.usuarioId,
      tipoUsuario: payload.tipoUsuario,
      nomeCompleto: payload.nomeCompleto,
      permissaoNome,
      permissaoIds,
      exp: new Date(payload.exp * 1000),
      iss: payload.iss,
      aud: payload.aud,
    }
  } catch {
    return null
  }
}
