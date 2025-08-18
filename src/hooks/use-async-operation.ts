/* eslint-disable */
import { useCallback, useState, useTransition } from 'react'

interface UseAsyncOperationResult<T> {
  execute: (operation: () => Promise<T>) => Promise<T>
  isPending: boolean
  error: Error | null
  clearError: () => void
}

/**
 * Hook para executar operações assíncronas com Suspense
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { execute, isPending } = useAsyncOperation()
 *
 *   const handleSubmit = () => {
 *     execute(async () => {
 *       await saveData()
 *       // Componente será suspenso durante esta operação
 *     })
 *   }
 * }
 * ```
 */
export function useAsyncOperation<T = any>(): UseAsyncOperationResult<T> {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T> => {
      setError(null)

      return new Promise((resolve, reject) => {
        startTransition(async () => {
          try {
            const result = await operation()
            resolve(result)
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            setError(error)
            reject(error)
          }
        })
      })
    },
    [startTransition],
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
