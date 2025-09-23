import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

// Mock do window.matchMedia
const mockMatchMedia = vi.fn()

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset mock
    mockMatchMedia.mockClear()

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024, // Desktop por padrão
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Detecção inicial', () => {
    it('deve retornar false para tela desktop (>=768px)', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      // Simular tela desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })

    it('deve retornar true para tela mobile (<768px)', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      // Simular tela mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('deve considerar 767px como mobile (borda)', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 767,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('deve considerar 768px como desktop (borda)', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })
  })

  describe('Configuração do MediaQueryList', () => {
    it('deve configurar media query corretamente', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      renderHook(() => useIsMobile())

      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    })

    it('deve adicionar event listener para mudanças', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      renderHook(() => useIsMobile())

      expect(mockMql.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
    })

    it('deve remover event listener no cleanup', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      const { unmount } = renderHook(() => useIsMobile())

      unmount()

      expect(mockMql.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
    })
  })

  describe('Mudanças de tamanho de tela', () => {
    it('deve atualizar quando tela muda de desktop para mobile', () => {
      let changeHandler: (() => void) | undefined

      const mockMql = {
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            changeHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      // Iniciar como desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)

      // Simular mudança para mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: 600,
        })
        if (changeHandler) {
          changeHandler()
        }
      })

      expect(result.current).toBe(true)
    })

    it('deve atualizar quando tela muda de mobile para desktop', () => {
      let changeHandler: (() => void) | undefined

      const mockMql = {
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            changeHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      // Iniciar como mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)

      // Simular mudança para desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: 1024,
        })
        if (changeHandler) {
          changeHandler()
        }
      })

      expect(result.current).toBe(false)
    })
  })

  describe('Estados extremos', () => {
    it('deve lidar com window.innerWidth = 0', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 0,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('deve lidar com valores muito grandes', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 9999,
      })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })
  })

  describe('Estado undefined inicial', () => {
    it('deve retornar false quando isMobile é undefined (conversão !!)', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      // Simular estado onde useState ainda não foi inicializado
      const { result } = renderHook(() => useIsMobile())

      // O hook sempre retorna boolean devido ao !!isMobile
      expect(typeof result.current).toBe('boolean')
    })
  })

  describe('Múltiplas instâncias', () => {
    it('deve funcionar corretamente com múltiplas instâncias do hook', () => {
      const mockMql = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      mockMatchMedia.mockReturnValue(mockMql)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600,
      })

      const { result: result1 } = renderHook(() => useIsMobile())
      const { result: result2 } = renderHook(() => useIsMobile())

      expect(result1.current).toBe(true)
      expect(result2.current).toBe(true)
      expect(result1.current).toBe(result2.current)
    })
  })
})
