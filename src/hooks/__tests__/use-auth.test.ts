import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useAuth } from '../use-auth'

// Mock do auth store
const mockAuthStore = {
  estaAutenticado: false,
  carregando: false,
  usuario: null,
  verificarAutenticacao: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}

vi.mock('@/lib/auth/auth-store', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock da função hasAuthCookies
vi.mock('@/lib/auth/auth', () => ({
  hasAuthCookies: vi.fn(() => false),
}))

const renderHookWithRouter = (hook: any, initialEntries = ['/']) => {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    ),
  })
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.estaAutenticado = false
    mockAuthStore.carregando = false
    mockAuthStore.usuario = null
    sessionStorage.clear()
    Object.defineProperty(window, 'location', {
      value: { pathname: '/' },
      writable: true,
    })
  })

  it('deve retornar todas as propriedades do auth store', () => {
    const { result } = renderHookWithRouter(() => useAuth())

    expect(result.current).toMatchObject({
      estaAutenticado: false,
      carregando: false,
      usuario: null,
      verificarAutenticacao: expect.any(Function),
      login: expect.any(Function),
      logout: expect.any(Function),
    })
  })

  it('deve fornecer hooks auxiliares', () => {
    const { result } = renderHookWithRouter(() => useAuth())

    expect(result.current.useAuthGuard).toBeInstanceOf(Function)
    expect(result.current.useRedirectAfterLogin).toBeInstanceOf(Function)
    expect(result.current.useCheckPasswordChange).toBeInstanceOf(Function)
  })

  describe('useAuthGuard', () => {
    it('deve redirecionar para login quando requer autenticação e usuário não está autenticado', () => {
      const { result } = renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard(true, false)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('deve salvar path atual no sessionStorage antes de redirecionar', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      })

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard(true, false)
      })

      expect(sessionStorage.getItem('redirectAfterLogin')).toBe('/dashboard')
    })

    it('deve redirecionar usuário autenticado quando requireGuest é true', () => {
      mockAuthStore.estaAutenticado = true

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard(false, true)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    it('deve usar path do sessionStorage para redirect quando requireGuest', () => {
      mockAuthStore.estaAutenticado = true
      sessionStorage.setItem('redirectAfterLogin', '/dashboard')

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard(false, true)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull()
    })

    it('não deve redirecionar quando está carregando', () => {
      mockAuthStore.carregando = true

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard(true, false)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('deve retornar estado de autenticação', () => {
      mockAuthStore.estaAutenticado = true
      mockAuthStore.carregando = false

      const { result } = renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard(false, false)
      })

      expect(result.current).toEqual({
        estaAutenticado: true,
        carregando: false,
      })
    })
  })

  describe('useRedirectAfterLogin', () => {
    it('deve redirecionar após login bem-sucedido', () => {
      sessionStorage.setItem('redirectAfterLogin', '/dashboard')
      mockAuthStore.estaAutenticado = true

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useRedirectAfterLogin()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull()
    })

    it('deve redirecionar para home quando não há path salvo', () => {
      mockAuthStore.estaAutenticado = true

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useRedirectAfterLogin()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    it('não deve redirecionar quando não está autenticado', () => {
      sessionStorage.setItem('redirectAfterLogin', '/dashboard')
      mockAuthStore.estaAutenticado = false

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useRedirectAfterLogin()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(sessionStorage.getItem('redirectAfterLogin')).toBe('/dashboard')
    })
  })

  describe('useCheckPasswordChange', () => {
    it('deve redirecionar para trocar senha quando usuário precisa', () => {
      mockAuthStore.estaAutenticado = true
      mockAuthStore.usuario = { precisaTrocarSenha: true }

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/trocar-senha', { replace: true })
    })

    it('não deve redirecionar quando usuário não precisa trocar senha', () => {
      mockAuthStore.estaAutenticado = true
      mockAuthStore.usuario = { precisaTrocarSenha: false }

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('não deve redirecionar quando não está autenticado', () => {
      mockAuthStore.estaAutenticado = false
      mockAuthStore.usuario = { precisaTrocarSenha: true }

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('deve retornar usuario e estado de autenticação', () => {
      const usuario = { id: '1', nome: 'Teste', precisaTrocarSenha: false }
      mockAuthStore.estaAutenticado = true
      mockAuthStore.usuario = usuario

      const { result } = renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(result.current).toEqual({
        usuario,
        estaAutenticado: true,
      })
    })
  })

  describe('verificação de cookies', () => {
    it('deve verificar autenticação quando há cookies', async () => {
      const { hasAuthCookies } = await import('@/lib/auth/auth')
      vi.mocked(hasAuthCookies).mockReturnValue(true)

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard()
      })

      expect(mockAuthStore.verificarAutenticacao).toHaveBeenCalled()
    })

    it('não deve verificar autenticação quando não há cookies', async () => {
      const { hasAuthCookies } = await import('@/lib/auth/auth')
      vi.mocked(hasAuthCookies).mockReturnValue(false)

      renderHookWithRouter(() => {
        const auth = useAuth()
        return auth.useAuthGuard()
      })

      expect(mockAuthStore.verificarAutenticacao).not.toHaveBeenCalled()
    })
  })
})