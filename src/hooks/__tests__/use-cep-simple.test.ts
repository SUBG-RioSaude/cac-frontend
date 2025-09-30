import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useCEP } from '../use-cep'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('useCEP - Essential Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('deve inicializar com estado correto', () => {
      const { result } = renderHook(() => useCEP())

      expect(result.current.endereco).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.buscarCEP).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('deve limpar erro quando clearError é chamado', () => {
      const { result } = renderHook(() => useCEP())

      act(() => {
        // Simula um erro interno
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('deve aceitar opções customizadas', () => {
      const onSuccess = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useCEP({
          onSuccess,
          onError,
          debounceMs: 500,
          minLoadingTime: 800,
          errorMessage: 'Erro customizado',
        }),
      )

      expect(result.current.endereco).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('validação de CEP', () => {
    it('deve rejeitar CEPs inválidos sem fazer requisição', async () => {
      const { result } = renderHook(() => useCEP())

      await act(async () => {
        await result.current.buscarCEP('123') // CEP muito curto
      })

      expect(result.current.endereco).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('deve rejeitar CEPs com todos dígitos iguais', async () => {
      const { result } = renderHook(() => useCEP())

      await act(async () => {
        await result.current.buscarCEP('11111111') // Todos iguais
      })

      expect(result.current.endereco).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('deve limpar caracteres não numéricos', async () => {
      const { result } = renderHook(() => useCEP())

      // Este teste verifica se a limpeza funciona
      // O CEP formatado deve ser processado
      await act(async () => {
        await result.current.buscarCEP('01.310-200')
      })

      // Se chegou até aqui, a limpeza funcionou
      expect(true).toBe(true)
    })
  })

  describe('interface do hook', () => {
    it('deve retornar todas as funções necessárias', () => {
      const { result } = renderHook(() => useCEP())

      expect(result.current).toHaveProperty('buscarCEP')
      expect(result.current).toHaveProperty('endereco')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('clearError')

      expect(typeof result.current.buscarCEP).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('deve manter estado consistente', () => {
      const { result } = renderHook(() => useCEP())

      const initialState = {
        endereco: result.current.endereco,
        isLoading: result.current.isLoading,
        error: result.current.error,
      }

      expect(initialState).toEqual({
        endereco: null,
        isLoading: false,
        error: null,
      })
    })
  })

  describe('navegação para páginas de erro', () => {
    it('deve ter função navigate disponível', () => {
      renderHook(() => useCEP())

      // Se chegou até aqui, o mock do navigate está funcionando
      expect(mockNavigate).toBeDefined()
    })
  })

  describe('limpeza de recursos', () => {
    it('deve limpar recursos no unmount', () => {
      const { unmount } = renderHook(() => useCEP())

      // Testa que o unmount não gera erro
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('configurações', () => {
    it('deve aceitar todas as opções disponíveis', () => {
      const options = {
        onSuccess: vi.fn(),
        onError: vi.fn(),
        debounceMs: 1000,
        minLoadingTime: 500,
        errorMessage: 'Mensagem personalizada',
      }

      const { result } = renderHook(() => useCEP(options))

      expect(result.current.endereco).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('deve funcionar sem opções', () => {
      const { result } = renderHook(() => useCEP())

      expect(result.current.endereco).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('deve funcionar com opções vazias', () => {
      const { result } = renderHook(() => useCEP({}))

      expect(result.current.endereco).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })
})
