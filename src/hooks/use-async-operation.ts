import { useCallback, useState } from 'react'

interface UseAsyncOperationResult<T> {
  execute: (operation: () => Promise<T>) => Promise<T>
  isPending: boolean
  error: Error | null
  clearError: () => void
}

/**
 * Hook para executar operações assíncronas
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { execute, isPending } = useAsyncOperation()
 *
 *   const handleSubmit = () => {
 *     execute(async () => {
 *       await saveData()
 *     })
 *   }
 * }
 * ```
 */
export function useAsyncOperation<T = any>(): UseAsyncOperationResult<T> {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T> => {
      setError(null)
      setIsPending(true)

      try {
        const result = await operation()
        return result
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error(String(err))
        setError(errorInstance)
        throw errorInstance
      } finally {
        setIsPending(false)
      }
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    execute,
    isPending,
    error,
    clearError,
  }
}

/**
 * Hook específico para operações de formulário
 */
export function useFormAsyncOperation<T = any>() {
  const { execute, isPending, error, clearError } = useAsyncOperation<T>()

  const submitForm = useCallback(
    async (formData: any, submitFunction: (data: any) => Promise<T>) => {
      return execute(() => submitFunction(formData))
    },
    [execute],
  )

  return {
    submitForm,
    isPending,
    error,
    clearError,
    isSubmitting: isPending, // Alias mais claro para forms
  }
}
