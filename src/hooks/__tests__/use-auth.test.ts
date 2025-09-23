import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../use-auth'
import { useAuthStore } from '@/lib/auth/auth-store'
import * as authModule from '@/lib/auth/auth'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock auth store
vi.mock('@/lib/auth/auth-store')
const mockUseAuthStore = vi.mocked(useAuthStore)

// Mock auth module
vi.mock('@/lib/auth/auth')
const mockHasAuthCookies = vi.mocked(authModule.hasAuthCookies)

describe('useAuth', () => {
  const mockAuthStore = {
    usuario: null,
    estaAutenticado: false,
    carregando: false,
    verificarAutenticacao: vi.fn(),
    logout: vi.fn(),
    logoutTodasSessoes: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue(mockAuthStore as any)
    mockHasAuthCookies.mockReturnValue(false)

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })

    // Mock location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test-path',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('useAuthGuard', () => {
    it('deve verificar autenticação quando há cookies', () => {
      mockHasAuthCookies.mockReturnValue(true)

      const { result } = renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard()
      })

      expect(mockAuthStore.verificarAutenticacao).toHaveBeenCalled()
      expect(result.current.estaAutenticado).toBe(false)
      expect(result.current.carregando).toBe(false)
    })

    it('não deve verificar autenticação quando não há cookies', () => {
      mockHasAuthCookies.mockReturnValue(false)

      renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard()
      })

      expect(mockAuthStore.verificarAutenticacao).not.toHaveBeenCalled()
    })

    it('deve redirecionar para login quando requireAuth=true e usuário não autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: false,
        carregando: false,
      } as any)

      renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard(true, false)
      })

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'redirectAfterLogin',
        '/test-path',
      )
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('não deve redirecionar quando requireAuth=true mas ainda carregando', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: false,
        carregando: true,
      } as any)

      renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard(true, false)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('deve redirecionar para página principal quando requireGuest=true e usuário autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
        carregando: false,
      } as any)

      vi.mocked(window.sessionStorage.getItem).mockReturnValue('/dashboard')

      renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard(false, true)
      })

      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
        'redirectAfterLogin',
      )
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })

    it('deve usar "/" como fallback quando não há redirectPath salvo', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
        carregando: false,
      } as any)

      vi.mocked(window.sessionStorage.getItem).mockReturnValue(null)

      renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard(false, true)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    it('não deve redirecionar quando requireAuth=false e requireGuest=false', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: false,
        carregando: false,
      } as any)

      renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard(false, false)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('useRedirectAfterLogin', () => {
    it('deve redirecionar após login bem-sucedido', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
      } as any)

      vi.mocked(window.sessionStorage.getItem).mockReturnValue(
        '/protected-page',
      )

      const { result } = renderHook(() => {
        const auth = useAuth()
        return auth.useRedirectAfterLogin()
      })

      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
        'redirectAfterLogin',
      )
      expect(mockNavigate).toHaveBeenCalledWith('/protected-page', {
        replace: true,
      })
      expect(result.current.estaAutenticado).toBe(true)
    })

    it('deve usar "/" como fallback quando não há redirectPath', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
      } as any)

      vi.mocked(window.sessionStorage.getItem).mockReturnValue(null)

      renderHook(() => {
        const auth = useAuth()
        return auth.useRedirectAfterLogin()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    it('não deve redirecionar quando usuário não está autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: false,
      } as any)

      renderHook(() => {
        const auth = useAuth()
        return auth.useRedirectAfterLogin()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('useCheckPasswordChange', () => {
    it('deve redirecionar para trocar senha quando usuário precisa trocar senha', () => {
      const usuarioComSenhaExpirada = {
        id: '1',
        email: 'test@example.com',
        nomeCompleto: 'Test User',
        precisaTrocarSenha: true,
      }

      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
        usuario: usuarioComSenhaExpirada,
      } as any)

      const { result } = renderHook(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/trocar-senha', {
        replace: true,
      })
      expect(result.current.usuario).toEqual(usuarioComSenhaExpirada)
      expect(result.current.estaAutenticado).toBe(true)
    })

    it('não deve redirecionar quando usuário não precisa trocar senha', () => {
      const usuarioNormal = {
        id: '1',
        email: 'test@example.com',
        nomeCompleto: 'Test User',
        precisaTrocarSenha: false,
      }

      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
        usuario: usuarioNormal,
      } as any)

      renderHook(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('não deve redirecionar quando usuário não está autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: false,
        usuario: null,
      } as any)

      renderHook(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('não deve redirecionar quando usuario é null', () => {
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
        usuario: null,
      } as any)

      renderHook(() => {
        const auth = useAuth()
        return auth.useCheckPasswordChange()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('store integration', () => {
    it('deve retornar todas as propriedades do authStore', () => {
      const mockStoreWithMethods = {
        ...mockAuthStore,
        login: vi.fn(),
        limparErros: vi.fn(),
      }

      mockUseAuthStore.mockReturnValue(mockStoreWithMethods as any)

      const { result } = renderHook(() => useAuth())

      expect(result.current.usuario).toBe(mockStoreWithMethods.usuario)
      expect(result.current.estaAutenticado).toBe(
        mockStoreWithMethods.estaAutenticado,
      )
      expect(result.current.carregando).toBe(mockStoreWithMethods.carregando)
      expect(result.current.login).toBe(mockStoreWithMethods.login)
      expect(result.current.logout).toBe(mockStoreWithMethods.logout)
    })

    it('deve retornar os hooks de autenticação', () => {
      const { result } = renderHook(() => useAuth())

      expect(typeof result.current.useAuthGuard).toBe('function')
      expect(typeof result.current.useRedirectAfterLogin).toBe('function')
      expect(typeof result.current.useCheckPasswordChange).toBe('function')
    })
  })

  describe('edge cases', () => {
    it('deve lidar com mudanças de estado do authStore', () => {
      // Configura estado inicial com usuário autenticado
      mockUseAuthStore.mockReturnValue({
        ...mockAuthStore,
        estaAutenticado: true,
        carregando: false,
      } as any)

      const { result } = renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard()
      })

      // Verifica que não houve redirecionamento para login quando usuário está autenticado
      expect(mockNavigate).not.toHaveBeenCalledWith('/login', { replace: true })
      expect(result.current.estaAutenticado).toBe(true)
    })

    it('deve chamar verificarAutenticacao apenas uma vez', () => {
      mockHasAuthCookies.mockReturnValue(true)

      const { rerender } = renderHook(() => {
        const auth = useAuth()
        return auth.useAuthGuard()
      })

      expect(mockAuthStore.verificarAutenticacao).toHaveBeenCalledTimes(1)

      rerender()

      expect(mockAuthStore.verificarAutenticacao).toHaveBeenCalledTimes(1)
    })
  })
})
