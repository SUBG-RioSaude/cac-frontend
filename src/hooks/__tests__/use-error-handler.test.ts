import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useErrorHandler, useErrorInfo, ErrorInfo } from '../use-error-handler'

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderHookWithRouter = (hook: any) => {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        {children}
      </MemoryRouter>
    ),
  })
}

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/test-page' },
      writable: true,
    })
  })

  it('deve retornar funções de tratamento de erro', () => {
    const { result } = renderHookWithRouter(() => useErrorHandler())

    expect(typeof result.current.handleError).toBe('function')
    expect(typeof result.current.handleHttpError).toBe('function')
    expect(typeof result.current.handleApiError).toBe('function')
  })

  describe('handleError', () => {
    it('deve tratar erro como string', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())

      act(() => {
        result.current.handleError('Erro simples')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Erro simples',
          fullError: expect.objectContaining({
            message: 'Erro simples',
            url: 'http://localhost:3000/test-page',
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve tratar Error object', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      const testError = new Error('Test error message')

      act(() => {
        result.current.handleError(testError)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Test error message',
          fullError: expect.objectContaining({
            message: 'Test error message',
            details: expect.stringContaining('Error: Test error message'),
            url: 'http://localhost:3000/test-page',
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve tratar ErrorInfo object', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      const errorInfo: ErrorInfo = {
        message: 'Custom error',
        code: 404,
        details: 'Resource not found',
      }

      act(() => {
        result.current.handleError(errorInfo)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/404', {
        state: {
          error: 'Custom error',
          fullError: expect.objectContaining({
            message: 'Custom error',
            code: 404,
            details: 'Resource not found',
            url: 'http://localhost:3000/test-page',
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve redirecionar baseado no código de status', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())

      const statusCodes = [
        { code: 400, path: '/400' },
        { code: 401, path: '/401' },
        { code: 403, path: '/403' },
        { code: 404, path: '/404' },
        { code: 500, path: '/500' },
        { code: 503, path: '/503' },
        { code: 999, path: '/500' }, // código não mapeado
      ]

      statusCodes.forEach(({ code, path }) => {
        mockNavigate.mockClear()

        act(() => {
          result.current.handleError('Test error', code)
        })

        expect(mockNavigate).toHaveBeenCalledWith(path, expect.any(Object))
      })
    })

    it('deve usar código do objeto ErrorInfo quando statusCode não é fornecido', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      const errorInfo: ErrorInfo = {
        message: 'Unauthorized',
        code: 401,
      }

      act(() => {
        result.current.handleError(errorInfo)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/401', expect.any(Object))
    })

    it('deve priorizar statusCode parameter sobre ErrorInfo.code', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      const errorInfo: ErrorInfo = {
        message: 'Error',
        code: 401,
      }

      act(() => {
        result.current.handleError(errorInfo, 404) // statusCode override
      })

      expect(mockNavigate).toHaveBeenCalledWith('/404', expect.any(Object))
    })
  })

  describe('handleHttpError', () => {
    it('deve tratar Response object', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      
      const mockResponse = {
        status: 404,
        statusText: 'Not Found',
        url: 'http://api.example.com/users/123',
      } as Response

      act(() => {
        result.current.handleHttpError(mockResponse)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/404', {
        state: {
          error: 'Erro HTTP 404: Not Found',
          fullError: expect.objectContaining({
            code: 404,
            message: 'Erro HTTP 404: Not Found',
            url: 'http://api.example.com/users/123',
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve usar mensagem customizada quando fornecida', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      
      const mockResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://api.example.com/data',
      } as Response

      act(() => {
        result.current.handleHttpError(mockResponse, 'Falha ao carregar dados')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Falha ao carregar dados',
          fullError: expect.objectContaining({
            message: 'Falha ao carregar dados',
          }),
        },
      })
    })
  })

  describe('handleApiError', () => {
    it('deve tratar erro do Axios com response', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      
      const axiosError = {
        response: {
          status: 422,
          statusText: 'Unprocessable Entity',
          data: {
            message: 'Validation failed',
            errors: ['Field required'],
          },
        },
      }

      act(() => {
        result.current.handleApiError(axiosError)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', { // 422 não mapeado, vai para /500
        state: {
          error: 'Validation failed',
          fullError: expect.objectContaining({
            code: 422,
            message: 'Validation failed',
            details: expect.stringContaining('Validation failed'),
          }),
        },
      })
    })

    it('deve tratar erro do Axios com error field no data', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      
      const axiosError = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: {
            error: 'Invalid input data',
          },
        },
      }

      act(() => {
        result.current.handleApiError(axiosError)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/400', {
        state: {
          error: 'Invalid input data',
          fullError: expect.objectContaining({
            message: 'Invalid input data',
          }),
        },
      })
    })

    it('deve tratar erro de rede (sem response)', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      
      const networkError = {
        request: {}, // Indica erro de rede
      }

      act(() => {
        result.current.handleApiError(networkError)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/503', {
        state: {
          error: 'Erro de conexão. Verifique sua internet.',
          fullError: expect.objectContaining({
            message: 'Erro de conexão. Verifique sua internet.',
          }),
        },
      })
    })

    it('deve tratar Error object genérico', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())
      
      const genericError = new Error('Generic error message')

      act(() => {
        result.current.handleApiError(genericError)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Generic error message',
          fullError: expect.objectContaining({
            message: 'Generic error message',
          }),
        },
      })
    })

    it('deve usar fallbackCode quando fornecido', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())

      act(() => {
        result.current.handleApiError('Unknown error', 503)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/503', expect.any(Object))
    })

    it('deve converter valor não-Error em string', () => {
      const { result } = renderHookWithRouter(() => useErrorHandler())

      act(() => {
        result.current.handleApiError({ someProperty: 'value' })
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: '[object Object]',
          fullError: expect.objectContaining({
            message: '[object Object]',
          }),
        },
      })
    })
  })
})

describe('useErrorInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock history.state
    Object.defineProperty(history, 'state', {
      value: null,
      writable: true,
    })
  })

  it('deve retornar estado inicial quando não há erro', () => {
    const { result } = renderHookWithRouter(() => useErrorInfo())

    expect(result.current.error).toBeNull()
    expect(result.current.fullError).toBeNull()
    expect(result.current.hasError).toBe(false)
    expect(typeof result.current.clearError).toBe('function')
  })

  it('deve retornar informações de erro quando presente', () => {
    // Mock com estado de erro
    Object.defineProperty(history, 'state', {
      value: {
        usr: {
          error: 'Test error message',
          fullError: {
            message: 'Test error message',
            code: 404,
            timestamp: new Date(),
          },
        },
      },
      writable: true,
    })

    const { result } = renderHookWithRouter(() => useErrorInfo())

    expect(result.current.error).toBe('Test error message')
    expect(result.current.fullError).toEqual({
      message: 'Test error message',
      code: 404,
      timestamp: expect.any(Date),
    })
    expect(result.current.hasError).toBe(true)
  })

  it('deve navegar para home quando clearError é chamado', () => {
    const { result } = renderHookWithRouter(() => useErrorInfo())

    act(() => {
      result.current.clearError()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('deve lidar com estado ausente graciosamente', () => {
    Object.defineProperty(history, 'state', {
      value: undefined,
      writable: true,
    })

    const { result } = renderHookWithRouter(() => useErrorInfo())

    expect(result.current.error).toBeNull()
    expect(result.current.fullError).toBeNull()
    expect(result.current.hasError).toBe(false)
  })
})