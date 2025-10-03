import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  useAsyncOperation,
  useFormAsyncOperation,
} from '../use-async-operation'

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('deve inicializar com estado correto', () => {
      const { result } = renderHook(() => useAsyncOperation())

      expect(result.current.isPending).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.execute).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })
  })

  describe('execute', () => {
    it('deve executar operação assíncrona com sucesso', async () => {
      const { result } = renderHook(() => useAsyncOperation<string>())
      const mockOperation = vi.fn().mockResolvedValue('success')

      let resultValue: string | undefined

      await act(async () => {
        resultValue = await result.current.execute(mockOperation)
      })

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(resultValue).toBe('success')
      expect(result.current.isPending).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('deve gerenciar estado de pending corretamente', async () => {
      const { result } = renderHook(() => useAsyncOperation())
      const mockOperation = vi.fn(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('success'), 100)),
      )

      let executePromise: Promise<any>

      await act(async () => {
        executePromise = result.current.execute(mockOperation)
      })

      // Deve estar pending imediatamente
      expect(result.current.isPending).toBe(true)
      expect(result.current.error).toBeNull()

      await act(async () => {
        await executePromise
      })

      // Deve ter finalizado
      expect(result.current.isPending).toBe(false)
    })

    it('deve capturar e gerenciar erros', async () => {
      const { result } = renderHook(() => useAsyncOperation())
      const mockError = new Error('Test error')
      const mockOperation = vi.fn().mockRejectedValue(mockError)

      let thrownError: Error | null = null

      await act(async () => {
        try {
          await result.current.execute(mockOperation)
        } catch (err) {
          thrownError = err as Error
        }
      })

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(result.current.isPending).toBe(false)
      expect(result.current.error).toBe(mockError)
      expect(thrownError).toBe(mockError)
    })

    it('deve converter valores não-Error em Error', async () => {
      const { result } = renderHook(() => useAsyncOperation())
      const mockOperation = vi.fn().mockRejectedValue('string error')

      let thrownError: Error | null = null

      await act(async () => {
        try {
          await result.current.execute(mockOperation)
        } catch (err) {
          thrownError = err as Error
        }
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('string error')
      expect(thrownError).toBeInstanceOf(Error)
    })

    it('deve limpar erro anterior ao executar nova operação', async () => {
      const { result } = renderHook(() => useAsyncOperation())
      const errorOperation = vi.fn().mockRejectedValue(new Error('First error'))
      const successOperation = vi.fn().mockResolvedValue('success')

      // Primeira operação com erro
      await act(async () => {
        try {
          await result.current.execute(errorOperation)
        } catch {
          // Ignora erro
        }
      })

      expect(result.current.error).not.toBeNull()

      // Segunda operação bem-sucedida
      await act(async () => {
        await result.current.execute(successOperation)
      })

      expect(result.current.error).toBeNull()
    })

    it('deve trabalhar com diferentes tipos de dados', async () => {
      const { result } = renderHook(() =>
        useAsyncOperation<{ id: number; name: string }>(),
      )
      const mockData = { id: 1, name: 'Test' }
      const mockOperation = vi.fn().mockResolvedValue(mockData)

      let resultValue: typeof mockData | undefined

      await act(async () => {
        resultValue = await result.current.execute(mockOperation)
      })

      expect(resultValue).toEqual(mockData)
      expect(result.current.error).toBeNull()
    })
  })

  describe('clearError', () => {
    it('deve limpar erro', async () => {
      const { result } = renderHook(() => useAsyncOperation())
      const mockOperation = vi.fn().mockRejectedValue(new Error('Test error'))

      // Gera um erro
      await act(async () => {
        try {
          await result.current.execute(mockOperation)
        } catch {
          // Ignora erro
        }
      })

      expect(result.current.error).not.toBeNull()

      // Limpa o erro
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('múltiplas execuções', () => {
    it('deve executar múltiplas operações sequencialmente', async () => {
      const { result } = renderHook(() => useAsyncOperation<number>())
      const operation1 = vi.fn().mockResolvedValue(1)
      const operation2 = vi.fn().mockResolvedValue(2)

      let result1: number | undefined
      let result2: number | undefined

      await act(async () => {
        result1 = await result.current.execute(operation1)
      })

      await act(async () => {
        result2 = await result.current.execute(operation2)
      })

      expect(result1).toBe(1)
      expect(result2).toBe(2)
      expect(operation1).toHaveBeenCalledTimes(1)
      expect(operation2).toHaveBeenCalledTimes(1)
      expect(result.current.isPending).toBe(false)
    })
  })
})

describe('useFormAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('deve inicializar com estado correto', () => {
      const { result } = renderHook(() => useFormAsyncOperation())

      expect(result.current.isPending).toBe(false)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.submitForm).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('deve ter isSubmitting como alias de isPending', () => {
      const { result } = renderHook(() => useFormAsyncOperation())

      expect(result.current.isSubmitting).toBe(result.current.isPending)
    })
  })

  describe('submitForm', () => {
    it('deve submeter formulário com sucesso', async () => {
      const { result } = renderHook(() => useFormAsyncOperation<string>())
      const formData = { name: 'Test', email: 'test@example.com' }
      const mockSubmitFunction = vi.fn().mockResolvedValue('Form submitted')

      let resultValue: string | undefined

      await act(async () => {
        resultValue = await result.current.submitForm(
          formData,
          mockSubmitFunction,
        )
      })

      expect(mockSubmitFunction).toHaveBeenCalledWith(formData)
      expect(resultValue).toBe('Form submitted')
      expect(result.current.isPending).toBe(false)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('deve gerenciar estado de submissão', async () => {
      const { result } = renderHook(() => useFormAsyncOperation())
      const formData = { test: 'data' }
      const mockSubmitFunction = vi.fn(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('success'), 100)),
      )

      let submitPromise: Promise<any>

      await act(async () => {
        submitPromise = result.current.submitForm(formData, mockSubmitFunction)
      })

      // Deve estar submetendo
      expect(result.current.isPending).toBe(true)
      expect(result.current.isSubmitting).toBe(true)

      await act(async () => {
        await submitPromise
      })

      // Deve ter finalizado
      expect(result.current.isPending).toBe(false)
      expect(result.current.isSubmitting).toBe(false)
    })

    it('deve capturar erros de submissão', async () => {
      const { result } = renderHook(() => useFormAsyncOperation())
      const formData = { test: 'data' }
      const mockError = new Error('Validation failed')
      const mockSubmitFunction = vi.fn().mockRejectedValue(mockError)

      let thrownError: Error | null = null

      await act(async () => {
        try {
          await result.current.submitForm(formData, mockSubmitFunction)
        } catch (err) {
          thrownError = err as Error
        }
      })

      expect(mockSubmitFunction).toHaveBeenCalledWith(formData)
      expect(result.current.error).toBe(mockError)
      expect(result.current.isPending).toBe(false)
      expect(result.current.isSubmitting).toBe(false)
      expect(thrownError).toBe(mockError)
    })

    it('deve funcionar com diferentes tipos de dados de formulário', async () => {
      const { result } = renderHook(() =>
        useFormAsyncOperation<{ id: number }>(),
      )

      // Teste com objeto complexo
      const formData = {
        user: { name: 'John', age: 30 },
        preferences: ['email', 'sms'],
        settings: { theme: 'dark' },
      }

      const mockResponse = { id: 123 }
      const mockSubmitFunction = vi.fn().mockResolvedValue(mockResponse)

      let result1: typeof mockResponse | undefined

      await act(async () => {
        result1 = await result.current.submitForm(formData, mockSubmitFunction)
      })

      expect(mockSubmitFunction).toHaveBeenCalledWith(formData)
      expect(result1).toEqual(mockResponse)
    })

    it('deve limpar erro anterior em nova submissão', async () => {
      const { result } = renderHook(() => useFormAsyncOperation())
      const formData = { test: 'data' }
      const errorSubmit = vi.fn().mockRejectedValue(new Error('First error'))
      const successSubmit = vi.fn().mockResolvedValue('success')

      // Primeira submissão com erro
      await act(async () => {
        try {
          await result.current.submitForm(formData, errorSubmit)
        } catch {
          // Ignora erro
        }
      })

      expect(result.current.error).not.toBeNull()

      // Segunda submissão bem-sucedida
      await act(async () => {
        await result.current.submitForm(formData, successSubmit)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('integração com useAsyncOperation', () => {
    it('deve herdar todas as funcionalidades do useAsyncOperation', () => {
      const { result } = renderHook(() => useFormAsyncOperation())

      // Verifica se tem todas as propriedades esperadas
      expect(result.current).toHaveProperty('submitForm')
      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('isSubmitting')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('clearError')

      // Verifica tipos das funções
      expect(typeof result.current.submitForm).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('deve funcionar clearError herdado', async () => {
      const { result } = renderHook(() => useFormAsyncOperation())
      const formData = { test: 'data' }
      const mockSubmitFunction = vi
        .fn()
        .mockRejectedValue(new Error('Test error'))

      // Gera erro
      await act(async () => {
        try {
          await result.current.submitForm(formData, mockSubmitFunction)
        } catch {
          // Ignora erro
        }
      })

      expect(result.current.error).not.toBeNull()

      // Limpa erro
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
