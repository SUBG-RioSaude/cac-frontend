// Utilitário para gerenciar cookies de forma segura

interface CookieOptions {
  expires?: Date
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  httpOnly?: boolean
}

// Detecção de ambiente para configurações de segurança
const isDevelopment = import.meta.env.DEV
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.includes('192.168.'))

export const cookieUtils = {
  // Define um cookie
  setCookie(
    name: string, 
    value: string, 
    options: CookieOptions = {}
  ): void {
    const {
      expires,
      maxAge,
      path = '/',
      domain,
      secure = !isDevelopment && !isLocalhost, // Seguro apenas em produção
      sameSite = 'strict'
    } = options

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`
    }

    if (maxAge) {
      cookieString += `; max-age=${maxAge}`
    }

    if (path) {
      cookieString += `; path=${path}`
    }

    if (domain) {
      cookieString += `; domain=${domain}`
    }

    if (secure) {
      cookieString += '; secure'
    }

    if (sameSite) {
      cookieString += `; samesite=${sameSite}`
    }

    document.cookie = cookieString
  },

  // Obtém o valor de um cookie
  getCookie(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`
    const cookies = document.cookie.split(';')
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i]
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
      }
    }
    return null
  },

  // Remove um cookie
  removeCookie(name: string, options: CookieOptions = {}): void {
    const { path = '/', domain } = options
    
    // Define o cookie com data de expiração no passado
    const expires = new Date(0)
    
    this.setCookie(name, '', {
      ...options,
      expires,
      path,
      domain
    })
  },

  // Verifica se um cookie existe
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null
  },

  // Obtém todos os cookies como objeto
  getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {}
    const cookieArray = document.cookie.split(';')
    
    cookieArray.forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value)
      }
    })
    
    return cookies
  },

  // Valida se um cookie é válido (não expirado)
  isCookieValid(name: string): boolean {
    const cookie = this.getCookie(name)
    if (!cookie) return false
    
    // Verifica se o cookie tem um formato válido (JWT tem 3 partes)
    if (name.includes('token') && cookie.split('.').length !== 3) {
      return false
    }
    
    return true
  }
}

// Configurações específicas para tokens de autenticação
export const authCookieConfig = {
  token: {
    path: '/',
    secure: !isDevelopment && !isLocalhost, // Seguro apenas em produção
    sameSite: 'strict' as const,
    maxAge: 2 * 60 * 60 // 2 horas (JWT token)
  },
  refreshToken: {
    path: '/',
    secure: !isDevelopment && !isLocalhost, // Seguro apenas em produção
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 // 7 dias (Refresh token)
  }
}
