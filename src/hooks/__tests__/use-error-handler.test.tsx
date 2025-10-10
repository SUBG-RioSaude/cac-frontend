import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useErrorHandler, useErrorInfo } from '../use-error-handler'

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Wrapper para router
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('handleError', () => {
    it('deve processar erro como string', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError('Erro de teste')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Erro de teste',
          fullError: expect.objectContaining({
            message: 'Erro de teste',
            url: expect.any(String),
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve processar Error object', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })
      const error = new Error('Erro personalizado')

      act(() => {
        result.current.handleError(error)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Erro personalizado',
          fullError: expect.objectContaining({
            message: 'Erro personalizado',
            details: expect.any(String),
            url: expect.any(String),
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve processar ErrorInfo object', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })
      const errorInfo = {
        message: 'Erro de validação',
        code: 400,
        details: 'Campo obrigatório ausente',
      }

      act(() => {
        result.current.handleError(errorInfo)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/400', {
        state: {
          error: 'Erro de validação',
          fullError: expect.objectContaining({
            message: 'Erro de validação',
            code: 400,
            details: 'Campo obrigatório ausente',
            url: expect.any(String),
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve usar statusCode parâmetro quando fornecido', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError('Não autorizado', 401)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/401', expect.any(Object))
    })
  })

  describe('handleHttpError', () => {
    it('deve processar Response object', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })
      const mockResponse = {
        status: 404,
        statusText: 'Not Found',
        url: 'http://localhost:3000/',
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
            url: 'http://localhost:3000/',
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve usar mensagem customizada quando fornecida', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })
      const mockResponse = {
        status: 403,
        statusText: 'Forbidden',
        url: 'https://api.exemplo.com/admin',
      } as Response

      act(() => {
        result.current.handleHttpError(mockResponse, 'Acesso negado ao recurso')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/403', {
        state: {
          error: 'Acesso negado ao recurso',
          fullError: expect.objectContaining({
            code: 403,
            message: 'Acesso negado ao recurso',
          }),
        },
      })
    })
  })

  describe('handleApiError', () => {
    it('deve processar erro do Axios com response', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })
      const axiosError = {
        response: {
          status: 422,
          statusText: 'Unprocessable Entity',
          data: { message: 'Dados inválidos fornecidos' },
        },
      }

      act(() => {
        result.current.handleApiError(axiosError)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Dados inválidos fornecidos',
          fullError: expect.objectContaining({
            code: 422,
            message: 'Dados inválidos fornecidos',
            details: expect.stringContaining('Dados inválidos fornecidos'),
            timestamp: expect.any(Date),
          }),
        },
      })
    })

    it('deve processar erro de rede (sem response)', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })
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

    it('deve processar erro genérico', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })
      const genericError = 'Erro inesperado'

      act(() => {
        result.current.handleApiError(genericError)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/500', {
        state: {
          error: 'Erro inesperado',
          fullError: expect.objectContaining({
            message: 'Erro inesperado',
          }),
        },
      })
    })

    it('deve usar fallbackCode quando fornecido', () => {
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleApiError('Erro customizado', 400)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/400', expect.any(Object))
    })
  })

  describe('Roteamento de códigos de erro', () => {
    const testCases = [
      { code: 400, expectedPath: '/400' },
      { code: 401, expectedPath: '/401' },
      { code: 403, expectedPath: '/403' },
      { code: 404, expectedPath: '/404' },
      { code: 500, expectedPath: '/500' },
      { code: 503, expectedPath: '/503' },
      { code: 999, expectedPath: '/500' }, // Código não mapeado
    ]

    testCases.forEach(({ code, expectedPath }) => {
      it(`deve redirecionar para ${expectedPath} quando código é ${code}`, () => {
        const { result } = renderHook(() => useErrorHandler(), { wrapper })

        act(() => {
          result.current.handleError('Erro teste', code)
        })

        expect(mockNavigate).toHaveBeenCalledWith(
          expectedPath,
          expect.any(Object),
        )
      })
    })
  })
})

describe('useErrorInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar estado inicial quando não há erro', () => {
    // Mock history.state vazio
    Object.defineProperty(window, 'history', {
      value: { state: null },
      writable: true,
    })

    const { result } = renderHook(() => useErrorInfo(), { wrapper })

    expect(result.current.error).toBeNull()
    expect(result.current.fullError).toBeNull()
    expect(result.current.hasError).toBe(false)
  })

  it('deve retornar erro quando existe no state', () => {
    // Mock history.state com erro
    Object.defineProperty(window, 'history', {
      value: {
        state: {
          usr: {
            error: 'Erro de teste',
            fullError: { message: 'Erro completo', code: 500 },
          },
        },
      },
      writable: true,
    })

    const { result } = renderHook(() => useErrorInfo(), { wrapper })

    expect(result.current.error).toBe('Erro de teste')
    expect(result.current.fullError).toEqual({
      message: 'Erro completo',
      code: 500,
    })
    expect(result.current.hasError).toBe(true)
  })

  it('deve limpar erro ao chamar clearError', () => {
    const { result } = renderHook(() => useErrorInfo(), { wrapper })

    act(() => {
      result.current.clearError()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })
})
