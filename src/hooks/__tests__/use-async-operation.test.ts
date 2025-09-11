import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useAsyncOperation, useFormAsyncOperation } from '../use-async-operation'

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useAsyncOperation())

    expect(result.current.isPending).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.execute).toBe('function')
    expect(typeof result.current.clearError).toBe('function')
  })

  it('deve executar operação com sucesso', async () => {
    const { result } = renderHook(() => useAsyncOperation<string>())

    const mockOperation = vi.fn().mockResolvedValue('success')

    let executeResult: string | undefined

    await act(async () => {
      executeResult = await result.current.execute(mockOperation)
    })

    expect(executeResult).toBe('success')
    expect(mockOperation).toHaveBeenCalledTimes(1)
    expect(result.current.isPending).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('deve definir isPending como true durante execução', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    const mockOperation = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('done'), 100))
    )

    let executePromise: Promise<any>

    act(() => {
      executePromise = result.current.execute(mockOperation)
    })

    // Deve estar pendente durante a execução
    expect(result.current.isPending).toBe(true)

    await act(async () => {
      await executePromise
    })

    // Deve não estar mais pendente após conclusão
    expect(result.current.isPending).toBe(false)
  })

  it('deve capturar e armazenar erros', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    const testError = new Error('Test error')
    const mockOperation = vi.fn().mockRejectedValue(testError)

    let thrownError: Error | undefined

    await act(async () => {
      try {
        await result.current.execute(mockOperation)
      } catch (error) {
        thrownError = error as Error
      }
    })

    expect(thrownError).toBe(testError)
    expect(result.current.error).toBe(testError)
    expect(result.current.isPending).toBe(false)
  })

  it('deve converter valores não-Error em Error', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    const mockOperation = vi.fn().mockRejectedValue('string error')

    await act(async () => {
      try {
        await result.current.execute(mockOperation)
      } catch {
        // Ignorar erro
      }
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('string error')
  })

  it('deve limpar erro com clearError', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    const mockOperation = vi.fn().mockRejectedValue(new Error('Test error'))

    await act(async () => {
      try {
        await result.current.execute(mockOperation)
      } catch {
        // Ignorar erro
      }
    })

    expect(result.current.error).not.toBeNull()

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('deve limpar erro anterior quando nova operação é executada', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    // Primeira operação que falha
    const failingOperation = vi.fn().mockRejectedValue(new Error('First error'))

    await act(async () => {
      try {
        await result.current.execute(failingOperation)
      } catch {
        // Ignorar erro
      }
    })

    expect(result.current.error?.message).toBe('First error')

    // Segunda operação que tem sucesso
    const successOperation = vi.fn().mockResolvedValue('success')

    await act(async () => {
      await result.current.execute(successOperation)
    })

    expect(result.current.error).toBeNull()
  })

  it('deve lidar com operações síncronas que retornam valor', async () => {
    const { result } = renderHook(() => useAsyncOperation<number>())

    const syncOperation = vi.fn().mockResolvedValue(42)

    let executeResult: number | undefined

    await act(async () => {
      executeResult = await result.current.execute(syncOperation)
    })

    expect(executeResult).toBe(42)
    expect(result.current.isPending).toBe(false)
    expect(result.current.error).toBeNull()
  })
})

describe('useFormAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useFormAsyncOperation())

    expect(result.current.isPending).toBe(false)
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.submitForm).toBe('function')
    expect(typeof result.current.clearError).toBe('function')
  })

  it('deve executar submitForm com sucesso', async () => {
    const { result } = renderHook(() => useFormAsyncOperation<string>())

    const formData = { name: 'John', email: 'john@example.com' }
    const mockSubmitFunction = vi.fn().mockResolvedValue('form submitted')

    let submitResult: string | undefined

    await act(async () => {
      submitResult = await result.current.submitForm(formData, mockSubmitFunction)
    })

    expect(submitResult).toBe('form submitted')
    expect(mockSubmitFunction).toHaveBeenCalledWith(formData)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('deve definir isSubmitting como true durante submissão', async () => {
    const { result } = renderHook(() => useFormAsyncOperation())

    const formData = { test: 'data' }
    const mockSubmitFunction = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('done'), 100))
    )

    let submitPromise: Promise<any>

    act(() => {
      submitPromise = result.current.submitForm(formData, mockSubmitFunction)
    })

    // Deve estar submetendo durante a execução
    expect(result.current.isSubmitting).toBe(true)
    expect(result.current.isPending).toBe(true)

    await act(async () => {
      await submitPromise
    })

    // Deve não estar mais submetendo após conclusão
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isPending).toBe(false)
  })

  it('deve capturar erros durante submissão de formulário', async () => {
    const { result } = renderHook(() => useFormAsyncOperation())

    const formData = { test: 'data' }
    const testError = new Error('Submission failed')
    const mockSubmitFunction = vi.fn().mockRejectedValue(testError)

    let thrownError: Error | undefined

    await act(async () => {
      try {
        await result.current.submitForm(formData, mockSubmitFunction)
      } catch (error) {
        thrownError = error as Error
      }
    })

    expect(thrownError).toBe(testError)
    expect(result.current.error).toBe(testError)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('deve manter consistência entre isPending e isSubmitting', async () => {
    const { result } = renderHook(() => useFormAsyncOperation())

    const formData = { test: 'data' }
    const mockSubmitFunction = vi.fn().mockResolvedValue('success')

    // Estado inicial
    expect(result.current.isPending).toBe(result.current.isSubmitting)

    await act(async () => {
      const submitPromise = result.current.submitForm(formData, mockSubmitFunction)
      
      // Durante submissão
      expect(result.current.isPending).toBe(result.current.isSubmitting)
      
      await submitPromise
    })

    // Após submissão
    expect(result.current.isPending).toBe(result.current.isSubmitting)
  })

  it('deve passar dados corretos para função de submissão', async () => {
    const { result } = renderHook(() => useFormAsyncOperation())

    const complexFormData = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      },
      settings: {
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }
    }

    const mockSubmitFunction = vi.fn().mockResolvedValue('success')

    await act(async () => {
      await result.current.submitForm(complexFormData, mockSubmitFunction)
    })

    expect(mockSubmitFunction).toHaveBeenCalledTimes(1)
    expect(mockSubmitFunction).toHaveBeenCalledWith(complexFormData)
  })

  it('deve retornar resultado da função de submissão', async () => {
    const { result } = renderHook(() => useFormAsyncOperation<{ id: number; message: string }>())

    const formData = { name: 'Test' }
    const expectedResult = { id: 123, message: 'Created successfully' }
    const mockSubmitFunction = vi.fn().mockResolvedValue(expectedResult)

    let actualResult: { id: number; message: string } | undefined

    await act(async () => {
      actualResult = await result.current.submitForm(formData, mockSubmitFunction)
    })

    expect(actualResult).toEqual(expectedResult)
  })
})