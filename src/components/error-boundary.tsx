import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <DefaultErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

function DefaultErrorFallback({ error, onRetry }: DefaultErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Algo deu errado
      </h2>
      <p className="text-gray-600 mb-4 max-w-md">
        {error?.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}

// HOC para facilitar o uso
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Componente específico para formulários
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Erro no formulário</h3>
          </div>
          <p className="text-red-700 text-sm mb-4">
            Houve um problema ao processar o formulário. Verifique os dados e tente novamente.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            Recarregar página
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}