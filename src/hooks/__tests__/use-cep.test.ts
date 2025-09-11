import { renderHook, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useCEP, EnderecoViaCEP } from '../use-cep'

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock do fetch global
global.fetch = vi.fn()

// Mock das variáveis de ambiente
vi.mock('@/vite-env.d.ts', () => ({
  VITE_VIACEP_URL: 'https://viacep.com.br/ws',
}))

// Define environment variable mock
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_VIACEP_URL: 'https://viacep.com.br/ws',
  },
  writable: true,
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

const mockEnderecoValido: EnderecoViaCEP = {
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  complemento: '',
  bairro: 'Bela Vista',
  localidade: 'São Paulo',
  uf: 'SP',
  ibge: '3550308',
  gia: '1004',
  ddd: '11',
  siafi: '7107',
}

describe('useCEP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('deve retornar estado inicial correto', () => {
    const { result } = renderHookWithRouter(() => useCEP())

    expect(result.current.endereco).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.buscarCEP).toBe('function')
    expect(typeof result.current.clearError).toBe('function')
  })

  it('deve buscar CEP válido com sucesso', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockEnderecoValido),
    } as Response)

    const onSuccess = vi.fn()
    const { result } = renderHookWithRouter(() => useCEP({ 
      onSuccess, 
      minLoadingTime: 0,
      debounceMs: 0 
    }))

    act(() => {
      result.current.buscarCEP('01310-100')
    })

    // Avança o timer do debounce
    act(() => {
      vi.runAllTimers()
    })

    await waitFor(() => {
      expect(result.current.endereco).toEqual(mockEnderecoValido)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(onSuccess).toHaveBeenCalledWith(mockEnderecoValido)
    })
  })

  it('deve tratar erro quando CEP não é encontrado', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ erro: true }),
    } as Response)

    const onError = vi.fn()
    const { result } = renderHookWithRouter(() => useCEP({ 
      onError,
      minLoadingTime: 0,
      debounceMs: 0
    }))

    act(() => {
      result.current.buscarCEP('99999-999')
    })

    act(() => {
      vi.runAllTimers()
    })

    await waitFor(() => {
      expect(result.current.endereco).toBeNull()
      expect(result.current.error).toBe('CEP não encontrado. Verifique se o CEP está correto.')
      expect(onError).toHaveBeenCalledWith('CEP não encontrado. Verifique se o CEP está correto.')
    })
  })

  it('deve tratar erro de rede', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHookWithRouter(() => useCEP({ 
      minLoadingTime: 0,
      debounceMs: 0
    }))

    act(() => {
      result.current.buscarCEP('01310-100')
    })

    act(() => {
      vi.runAllTimers()
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Erro ao buscar endereço. Tente novamente.')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('deve validar CEP inválido', () => {
    const { result } = renderHookWithRouter(() => useCEP())

    // CEPs inválidos não devem fazer requisição
    act(() => {
      result.current.buscarCEP('123')
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.endereco).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('deve limpar CEP corretamente', () => {
    const { result } = renderHookWithRouter(() => useCEP())

    act(() => {
      result.current.buscarCEP('01.310-100')
    })

    // Verifica se o CEP foi limpo antes da validação
    expect(result.current.endereco).toBeNull()
  })

  it('deve implementar debounce corretamente', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockEnderecoValido),
    } as Response)

    const { result } = renderHookWithRouter(() => useCEP({ 
      debounceMs: 500,
      minLoadingTime: 0
    }))

    // Faz múltiplas chamadas rápidas
    act(() => {
      result.current.buscarCEP('01310-100')
      result.current.buscarCEP('01310-100')
      result.current.buscarCEP('01310-100')
    })

    // Avança apenas parte do tempo
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Não deve ter feito requisição ainda
    expect(global.fetch).not.toHaveBeenCalled()

    // Avança o tempo restante
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Deve ter feito apenas uma requisição
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  it('deve usar cache para CEPs já consultados', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockEnderecoValido),
    } as Response)

    const { result } = renderHookWithRouter(() => useCEP({ 
      minLoadingTime: 0,
      debounceMs: 0
    }))

    // Primeira busca
    act(() => {
      result.current.buscarCEP('01310-100')
    })

    act(() => {
      vi.runAllTimers()
    })

    await waitFor(() => {
      expect(result.current.endereco).toEqual(mockEnderecoValido)
    })

    // Segunda busca do mesmo CEP
    act(() => {
      result.current.buscarCEP('01310-100')
    })

    act(() => {
      vi.runAllTimers()
    })

    // Deve ter feito apenas uma requisição HTTP
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(result.current.endereco).toEqual(mockEnderecoValido)
  })

  it('deve limpar erro ao chamar clearError', () => {
    const { result } = renderHookWithRouter(() => useCEP())

    // Simula um erro
    act(() => {
      result.current.buscarCEP('123') // CEP inválido
    })

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('deve cancelar requisição anterior quando nova busca é feita', async () => {
    const abortSpy = vi.fn()
    const mockAbortController = {
      abort: abortSpy,
      signal: {} as AbortSignal,
    }

    vi.spyOn(window, 'AbortController').mockImplementation(() => mockAbortController as any)

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => new Promise(resolve => setTimeout(() => resolve(mockEnderecoValido), 1000)),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockEnderecoValido),
      } as Response)

    const { result } = renderHookWithRouter(() => useCEP({ 
      debounceMs: 0,
      minLoadingTime: 0
    }))

    // Primeira busca
    act(() => {
      result.current.buscarCEP('01310-100')
    })

    act(() => {
      vi.runAllTimers()
    })

    // Segunda busca antes da primeira terminar
    act(() => {
      result.current.buscarCEP('01310-200')
    })

    act(() => {
      vi.runAllTimers()
    })

    // Deve ter cancelado a primeira requisição
    expect(abortSpy).toHaveBeenCalled()
  })

  it('deve navegar para páginas de erro baseado no status HTTP', async () => {
    const statusCodes = [
      { status: 500, path: '/500' },
      { status: 401, path: '/401' },
      { status: 400, path: '/400' },
      { status: 503, path: '/503' },
      { status: 403, path: '/403' },
    ]

    for (const { status, path } of statusCodes) {
      vi.clearAllMocks()

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status,
        json: () => Promise.resolve({}),
      } as Response)

      const { result } = renderHookWithRouter(() => useCEP({ 
        debounceMs: 0,
        minLoadingTime: 0
      }))

      act(() => {
        result.current.buscarCEP('01310-100')
      })

      act(() => {
        vi.runAllTimers()
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(path)
      })
    }
  })

  it('deve aplicar tempo mínimo de loading', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockEnderecoValido),
    } as Response)

    const { result } = renderHookWithRouter(() => useCEP({ 
      minLoadingTime: 1000,
      debounceMs: 0
    }))

    act(() => {
      result.current.buscarCEP('01310-100')
    })

    act(() => {
      vi.runAllTimers()
    })

    // Deve estar carregando
    expect(result.current.isLoading).toBe(true)

    // Avança o tempo mínimo
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.endereco).toEqual(mockEnderecoValido)
    })
  })
})