import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom'
import { ErrorBoundary, withErrorBoundary, FormErrorBoundary } from '../error-boundary'
import React from 'react'

// Componente que gera erro para testar
const ThrowErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div data-testid="success-component">Success</div>
}

// Mock console.error para evitar logs durante os testes
const originalConsoleError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  it('deve renderizar children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('success-component')).toBeInTheDocument()
  })

  it('deve renderizar fallback padrão quando ocorre erro', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('deve renderizar fallback personalizado quando fornecido', () => {
    const customFallback = <div data-testid="custom-fallback">Custom Error</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
  })

  it('deve chamar onError quando fornecido', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('deve ter botão de tentar novamente', () => {
    const TestComponent = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Deve mostrar o erro
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    
    // Deve ter o botão de tentar novamente
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('deve mostrar mensagem de erro padrão quando erro não tem message', () => {
    const ThrowErrorWithoutMessage = () => {
      const error = new Error()
      error.message = ''
      throw error
    }

    render(
      <ErrorBoundary>
        <ThrowErrorWithoutMessage />
      </ErrorBoundary>
    )

    expect(screen.getByText('Ocorreu um erro inesperado. Tente novamente.')).toBeInTheDocument()
  })
})

describe('withErrorBoundary HOC', () => {
  it('deve envolver componente com ErrorBoundary', () => {
    const TestComponent = () => <div data-testid="wrapped-component">Wrapped</div>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent />)

    expect(screen.getByTestId('wrapped-component')).toBeInTheDocument()
  })

  it('deve usar fallback personalizado quando fornecido', () => {
    const TestComponent = () => {
      throw new Error('Wrapped error')
    }
    const customFallback = <div data-testid="hoc-fallback">HOC Error</div>
    const WrappedComponent = withErrorBoundary(TestComponent, customFallback)

    render(<WrappedComponent />)

    expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument()
  })

  it('deve passar props corretamente para o componente envolvido', () => {
    const TestComponent = ({ testProp }: { testProp: string }) => (
      <div data-testid="props-test">{testProp}</div>
    )
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent testProp="test value" />)

    expect(screen.getByText('test value')).toBeInTheDocument()
  })
})

describe('FormErrorBoundary', () => {
  it('deve renderizar children quando não há erro', () => {
    render(
      <FormErrorBoundary>
        <ThrowErrorComponent />
      </FormErrorBoundary>
    )

    expect(screen.getByTestId('success-component')).toBeInTheDocument()
  })

  it('deve renderizar fallback específico para formulários quando ocorre erro', () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    })

    render(
      <FormErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </FormErrorBoundary>
    )

    expect(screen.getByText('Erro no formulário')).toBeInTheDocument()
    expect(screen.getByText(/Houve um problema ao processar o formulário/)).toBeInTheDocument()
    expect(screen.getByText('Recarregar página')).toBeInTheDocument()

    // Testa o botão de recarregar
    fireEvent.click(screen.getByText('Recarregar página'))
    expect(reloadSpy).toHaveBeenCalled()
  })
})