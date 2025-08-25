import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cookieUtils, authCookieConfig } from '../auth/cookie-utils'

// Mock do document.cookie
const mockDocumentCookie = vi.fn()
Object.defineProperty(document, 'cookie', {
  get: mockDocumentCookie,
  set: mockDocumentCookie,
  configurable: true
})

describe('cookieUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Simula cookies vazios
    mockDocumentCookie.mockReturnValue('')
  })

  describe('setCookie', () => {
    it('deve definir um cookie básico', () => {
      cookieUtils.setCookie('test', 'value')
      
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('test=value')
      )
    })

    it('deve definir um cookie com opções personalizadas', () => {
      const options = {
        path: '/api',
        secure: false,
        sameSite: 'lax' as const,
        maxAge: 3600
      }
      
      cookieUtils.setCookie('test', 'value', options)
      
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('test=value')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('path=/api')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('samesite=lax')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('max-age=3600')
      )
    })

    it('deve definir um cookie com data de expiração', () => {
      const expires = new Date('2024-12-31T23:59:59Z')
      cookieUtils.setCookie('test', 'value', { expires })
      
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('test=value')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('expires=')
      )
    })


  })

  describe('getCookie', () => {
    it('deve retornar null para cookie inexistente', () => {
      mockDocumentCookie.mockReturnValue('')
      
      const result = cookieUtils.getCookie('inexistente')
      expect(result).toBeNull()
    })

    it('deve retornar valor do cookie existente', () => {
      mockDocumentCookie.mockReturnValue('test=value; other=123')
      
      const result = cookieUtils.getCookie('test')
      expect(result).toBe('value')
    })

    it('deve decodificar URI corretamente', () => {
      mockDocumentCookie.mockReturnValue('test=valor%20com%20espa%C3%A7o')
      
      const result = cookieUtils.getCookie('test')
      expect(result).toBe('valor com espaço')
    })

    it('deve retornar string vazia para cookie vazio', () => {
      // Simula cookie vazio usando o mock
      mockDocumentCookie.mockReturnValue('test-cookie=; other-cookie=value')
      
      const value = cookieUtils.getCookie('test-cookie')
      
      // A função retorna string vazia para cookies vazios
      expect(value).toBe('')
    })
  })

  describe('removeCookie', () => {
    it('deve remover cookie definindo expiração no passado', () => {
      cookieUtils.removeCookie('test')
      
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('test=')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('expires=')
      )
    })

    it('deve remover cookie com opções personalizadas', () => {
      const options = { path: '/api', domain: 'example.com' }
      cookieUtils.removeCookie('test', options)
      
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('test=')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('path=/api')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('domain=example.com')
      )
    })

    it('deve lidar com múltiplas remoções', () => {
      // Simula cookies usando o mock
      mockDocumentCookie.mockReturnValue('cookie1=value1; cookie2=value2; cookie3=value3')
      
      cookieUtils.removeCookie('cookie1', {})
      cookieUtils.removeCookie('cookie2', {})
      
      // Verifica se as chamadas foram feitas corretamente
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('cookie1=')
      )
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('cookie2=')
      )
      // Verifica se as chamadas contêm expires
      expect(mockDocumentCookie).toHaveBeenCalledWith(
        expect.stringContaining('expires=')
      )
    })
  })

  describe('hasCookie', () => {
    it('deve retornar false para cookie inexistente', () => {
      mockDocumentCookie.mockReturnValue('')
      
      const result = cookieUtils.hasCookie('test')
      expect(result).toBe(false)
    })

    it('deve retornar true para cookie existente', () => {
      mockDocumentCookie.mockReturnValue('test=value')
      
      const result = cookieUtils.hasCookie('test')
      expect(result).toBe(true)
    })

    it('deve retornar true para cookie vazio', () => {
      // Simula cookie vazio usando o mock
      mockDocumentCookie.mockReturnValue('test-cookie=; other-cookie=value')
      
      const exists = cookieUtils.hasCookie('test-cookie')
      
      // A função retorna true se o nome do cookie existe, mesmo que vazio
      expect(exists).toBe(true)
    })
  })

  describe('getAllCookies', () => {
    it('deve retornar objeto vazio para nenhum cookie', () => {
      mockDocumentCookie.mockReturnValue('')
      
      const result = cookieUtils.getAllCookies()
      expect(result).toEqual({})
    })

    it('deve retornar todos os cookies como objeto', () => {
      mockDocumentCookie.mockReturnValue('test1=value1; test2=value2; test3=value3')
      
      const result = cookieUtils.getAllCookies()
      expect(result).toEqual({
        test1: 'value1',
        test2: 'value2',
        test3: 'value3'
      })
    })

    it('deve decodificar nomes e valores dos cookies', () => {
      mockDocumentCookie.mockReturnValue('test%20name=test%20value')
      
      const result = cookieUtils.getAllCookies()
      expect(result).toEqual({
        'test name': 'test value'
      })
    })
  })

  describe('isCookieValid', () => {
    it('deve retornar false para cookie inexistente', () => {
      const result = cookieUtils.isCookieValid('inexistente')
      expect(result).toBe(false)
    })

    it('deve retornar true para cookie válido', () => {
      mockDocumentCookie.mockReturnValue('test=value')
      
      const result = cookieUtils.isCookieValid('test')
      expect(result).toBe(true)
    })

    it('deve validar formato JWT para cookies de token', () => {
      // Simula token JWT válido
      mockDocumentCookie.mockReturnValue('auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
      
      const result = cookieUtils.isCookieValid('auth_token')
      expect(result).toBe(true)
    })

    it('deve rejeitar token JWT inválido', () => {
      // Simula token JWT inválido
      mockDocumentCookie.mockReturnValue('auth_token=invalid.token')
      
      const result = cookieUtils.isCookieValid('auth_token')
      expect(result).toBe(false)
    })
  })
})

describe('authCookieConfig', () => {
  it('deve ter configurações corretas para token JWT', () => {
    expect(authCookieConfig.token).toEqual({
      path: '/',
      secure: expect.any(Boolean), // Pode variar baseado no ambiente
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 // 2 horas
    })
  })

  it('deve ter configurações corretas para refresh token', () => {
    expect(authCookieConfig.refreshToken).toEqual({
      path: '/',
      secure: expect.any(Boolean), // Pode variar baseado no ambiente
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })
  })

  

  it('deve adaptar configuração secure baseado no ambiente', () => {
    // Em desenvolvimento, secure deve ser false
    expect(authCookieConfig.token.secure).toBe(false)
    expect(authCookieConfig.refreshToken.secure).toBe(false)
  })
})
