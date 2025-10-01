import { toast } from 'sonner'

import { useErrorHandler } from '@/hooks/use-error-handler'

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const { handleApiError } = useErrorHandler()

  const success = (message: string | ToastOptions) => {
    if (typeof message === 'string') {
      toast.success(message, { duration: 3000 })
    } else {
      toast.success(message.title ?? 'Sucesso', {
        description: message.description,
        duration: message.duration ?? 3000,
        action: message.action,
      })
    }
  }

  const error = (message: string | ToastOptions) => {
    if (typeof message === 'string') {
      toast.error(message, { duration: 4000 })
    } else {
      toast.error(message.title ?? 'Erro', {
        description: message.description,
        duration: message.duration ?? 4000,
        action: message.action,
      })
    }
  }

  const info = (message: string | ToastOptions) => {
    if (typeof message === 'string') {
      toast.info(message, { duration: 3000 })
    } else {
      toast.info(message.title ?? 'Info', {
        description: message.description,
        duration: message.duration ?? 3000,
        action: message.action,
      })
    }
  }

  const warning = (message: string | ToastOptions) => {
    if (typeof message === 'string') {
      toast.warning(message, { duration: 3500 })
    } else {
      toast.warning(message.title ?? 'Atenção', {
        description: message.description,
        duration: message.duration ?? 3500,
        action: message.action,
      })
    }
  }

  // Toasts específicos para React Query operations
  const mutation = {
    // Toast de loading para mutations
    loading: (operation: string) => {
      return toast.loading(`${operation}...`, {
        duration: Infinity, // Será dismissado manualmente
      })
    },

    // Toast de sucesso para mutations
    success: (operation: string, id?: string) => {
      toast.success(`${operation} realizada com sucesso`, {
        description: id ? `ID: ${id}` : undefined,
        duration: 3000,
      })
    },

    // Toast de erro para mutations com handling automático
    error: (operation: string, errorResponse: unknown) => {
      const errorMessage =
        errorResponse instanceof Error
          ? errorResponse.message
          : String(errorResponse)

      toast.error(`Erro ao ${operation.toLowerCase()}`, {
        description: errorMessage,
        duration: 5000,
      })

      // Se for erro HTTP crítico, redireciona para página de erro
      if (
        errorResponse &&
        typeof errorResponse === 'object' &&
        'response' in errorResponse
      ) {
        const { response } = error as { response: { status: number } }
        const { status } = response
        if (status && (status >= 500 || status === 401 || status === 403)) {
          handleApiError(error)
        }
      }
    },
  }

  // Toasts para queries
  const query = {
    // Toast para erro de query quando não deve redirecionar
    error: (
      queryError: unknown,
      fallbackMessage = 'Erro ao carregar dados',
    ) => {
      const errorMessage =
        queryError instanceof Error ? queryError.message : fallbackMessage

      toast.error('Erro de carregamento', {
        description: errorMessage,
        duration: 5000,
        action: {
          label: 'Tentar novamente',
          onClick: () => window.location.reload(),
        },
      })
    },
  }

  return {
    success,
    error,
    info,
    warning,
    mutation,
    query,
  }
}
