import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export interface ErrorInfo {
  message?: string
  code?: number
  details?: string
  url?: string
  timestamp?: Date
}

export function useErrorHandler() {
  const navigate = useNavigate()

  const handleError = useCallback(
    (error: ErrorInfo | Error | string, statusCode?: number) => {
      let errorInfo: ErrorInfo = {}
      let code = statusCode

      // Processar diferentes tipos de erro
      if (typeof error === 'string') {
        errorInfo.message = error
      } else if (error instanceof Error) {
        const { message, stack } = error
        errorInfo.message = message
        errorInfo.details = stack
      } else if (typeof error === 'object') {
        errorInfo = { ...error }
        code = code ?? error.code
      }

      // Adicionar informações contextuais
      errorInfo.url = window.location.href
      errorInfo.timestamp = new Date()

      // Determinar rota de redirecionamento baseada no código de status
      let redirectPath = '/500' // default para erros não especificados

      if (code) {
        switch (code) {
          case 400:
            redirectPath = '/400'
            break
          case 401:
            redirectPath = '/401'
            break
          case 403:
            redirectPath = '/403'
            break
          case 404:
            redirectPath = '/404'
            break
          case 500:
            redirectPath = '/500'
            break
          case 503:
            redirectPath = '/503'
            break
          default:
            redirectPath = '/500'
        }
      }

      // Redirecionar com state contendo informações do erro
      navigate(redirectPath, {
        state: {
          error:
            errorInfo.message ?? errorInfo.details ?? 'Erro não especificado',
          fullError: errorInfo,
        },
      })
    },
    [navigate],
  )

  const handleHttpError = useCallback(
    (response: Response, customMessage?: string) => {
      const errorInfo: ErrorInfo = {
        code: response.status,
        message:
          customMessage ??
          `Erro HTTP ${response.status}: ${response.statusText}`,
        url: response.url,
        timestamp: new Date(),
      }

      handleError(errorInfo, response.status)
    },
    [handleError],
  )

  const handleApiError = useCallback(
    (error: unknown, fallbackCode = 500) => {
      // Type guard para verificar se é um erro do Axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; data: unknown; statusText: string }
        }
        const { status, data, statusText } = axiosError.response
        const errorInfo: ErrorInfo = {
          code: status,
          message:
            data &&
            typeof data === 'object' &&
            ('message' in data || 'error' in data)
              ? (data as { message?: string; error?: string }).message ??
                (data as { message?: string; error?: string }).error
              : `Erro ${status}: ${statusText}`,
          details: JSON.stringify(data, null, 2),
          timestamp: new Date(),
        }
        handleError(errorInfo, status)
      } else if (error && typeof error === 'object' && 'request' in error) {
        // Erro de rede
        handleError('Erro de conexão. Verifique sua internet.', 503)
      } else {
        // Outros erros
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        handleError(errorMessage, fallbackCode)
      }
    },
    [handleError],
  )

  return {
    handleError,
    handleHttpError,
    handleApiError,
  }
}

// Interface para o state do history
interface HistoryStateError {
  error?: string | null
  fullError?: unknown
}

interface HistoryStateWrapper {
  usr?: HistoryStateError
}

// Hook para acessar informações de erro na página de erro
export function useErrorInfo() {
  const navigate = useNavigate()

  // Tentar recuperar erro do state da navegação
  const historyState = history.state as HistoryStateWrapper | null
  const state = historyState?.usr ?? ({} as HistoryStateError)
  const error = state.error ?? null
  const fullError = state.fullError ?? null

  return {
    error,
    fullError,
    hasError: !!error,
    clearError: () => navigate('/', { replace: true }),
  }
}
