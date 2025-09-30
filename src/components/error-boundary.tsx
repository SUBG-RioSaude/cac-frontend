import { AlertCircle, RefreshCw } from 'lucide-react'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { createComponentLogger } from '@/lib/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface DefaultErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

const DefaultErrorFallback = ({ error, onRetry }: DefaultErrorFallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Algo deu errado
      </h2>
      <p className="mb-4 max-w-md text-gray-600">
        {error?.message ?? 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private logger = createComponentLogger('ErrorBoundary', 'components')

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logger.error(
      {
        error: error.message,
        stack: error.stack,
        name: error.name,
        componentStack: errorInfo.componentStack,
        errorBoundary: 'caught',
      },
      'ErrorBoundary caught an error',
    )

    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.logger.info(
      {
        action: 'retry',
        errorBoundary: 'reset',
      },
      'ErrorBoundary retry executed',
    )

    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// HOC para facilitar o uso
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorFallback?: ReactNode,
) {
  const ComponentWithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  return ComponentWithErrorBoundary
}

// Componente específico para formulários
export const FormErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={(
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Erro no formulário</h3>
          </div>
          <p className="mb-4 text-sm text-red-700">
            Houve um problema ao processar o formulário. Verifique os dados e
            tente novamente.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Recarregar página
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
