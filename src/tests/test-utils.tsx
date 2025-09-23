import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { render } from '@testing-library/react'

// Criar um QueryClient para cada teste para evitar interferências
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Desabilitar retry nos testes
        staleTime: 0, // Sempre considerar dados stale
        gcTime: 0, // Não manter cache entre testes
      },
      mutations: {
        retry: false, // Desabilitar retry nas mutations
      },
    },
  })

interface AllTheProvidersProps {
  children: React.ReactNode
}

// Wrapper com todos os providers necessários para testes
export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Custom render que inclui todos os providers
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-exportar tudo do testing library
export * from '@testing-library/react'
export { renderWithProviders as render }
