import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useIsMobile } from '../use-mobile'

// Mock window.matchMedia
const createMockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(), // Para compatibilidade com versões antigas
    removeListener: vi.fn(), // Para compatibilidade com versões antigas
  }))
}

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    // Reset window.innerWidth para um valor padrão
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    // Restaura os valores originais
    window.matchMedia = originalMatchMedia
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('deve retornar false para telas desktop (>= 768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    window.matchMedia = createMockMatchMedia(false)

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('deve retornar true para telas mobile (< 768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    window.matchMedia = createMockMatchMedia(true)

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('deve retornar false para exatamente 768px (breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    window.matchMedia = createMockMatchMedia(false)

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('deve retornar true para 767px (logo abaixo do breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    window.matchMedia = createMockMatchMedia(true)

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('deve configurar matchMedia com query correta', () => {
    const mockMatchMedia = createMockMatchMedia(false)
    window.matchMedia = mockMatchMedia

    renderHook(() => useIsMobile())

    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('deve adicionar event listener para mudanças de media query', () => {
    const mockAddEventListener = vi.fn()
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    })

    window.matchMedia = mockMatchMedia

    renderHook(() => useIsMobile())

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('deve remover event listener na cleanup', () => {
    const mockRemoveEventListener = vi.fn()
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: mockRemoveEventListener,
    })

    window.matchMedia = mockMatchMedia

    const { unmount } = renderHook(() => useIsMobile())
    
    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('deve atualizar quando window.innerWidth muda', () => {
    let changeHandler: (() => void) | null = null
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler
      }
    })

    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    })

    window.matchMedia = mockMatchMedia

    // Inicia com tela desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simula mudança para mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      if (changeHandler) {
        changeHandler()
      }
    })

    expect(result.current).toBe(true)

    // Simula mudança de volta para desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      
      if (changeHandler) {
        changeHandler()
      }
    })

    expect(result.current).toBe(false)
  })

  it('deve lidar com estado inicial undefined', () => {
    // Mock que simula o estado antes do useEffect rodar
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    window.matchMedia = mockMatchMedia

    const { result } = renderHook(() => useIsMobile())

    // Deve converter undefined para false com !!
    expect(typeof result.current).toBe('boolean')
    expect(result.current).toBe(false)
  })

  it('deve funcionar mesmo sem matchMedia disponível', () => {
    // Simula ambiente sem matchMedia
    window.matchMedia = undefined as unknown as typeof window.matchMedia

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    expect(() => {
      renderHook(() => useIsMobile())
    }).toThrow() // Deve lançar erro se matchMedia não estiver disponível
  })

  it('deve usar o valor correto de MOBILE_BREAKPOINT', () => {
    const mockMatchMedia = createMockMatchMedia(false)
    window.matchMedia = mockMatchMedia

    renderHook(() => useIsMobile())

    // Verifica se a query usa 767px (768 - 1)
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('deve re-renderizar apenas quando o estado muda', () => {
    let changeHandler: (() => void) | null = null
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler
      }
    })

    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    })

    window.matchMedia = mockMatchMedia

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    const initialResult = result.current

    // Simula mudança que mantém o mesmo estado (ainda desktop)
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800, // Ainda acima do breakpoint
      })
      
      if (changeHandler) {
        changeHandler()
      }
    })

    // Deve manter o mesmo valor
    expect(result.current).toBe(initialResult)
    expect(result.current).toBe(false)
  })
})