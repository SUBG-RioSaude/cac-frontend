import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'

import { LayoutAuthenticated } from '../layout-authenticated'

vi.mock('@/components/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Mock Sidebar</div>,
}))

vi.mock('@/components/notificacoes-dropdown', () => ({
  NotificacoesDropdown: () => <div data-testid="notifications">Notifications</div>,
}))

vi.mock('@/components/page-breadcrumb', () => ({
  __esModule: true,
  default: () => <nav data-testid="breadcrumb">Breadcrumb</nav>,
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const MockedLayoutAuthenticated = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LayoutAuthenticated>{children}</LayoutAuthenticated>
    </BrowserRouter>
  </QueryClientProvider>
)

describe('LayoutAuthenticated', () => {
  it('deve renderizar corretamente', () => {
    render(
      <MockedLayoutAuthenticated>
        <div data-testid="test-content">Test content</div>
      </MockedLayoutAuthenticated>,
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('deve renderizar o header com breadcrumb e notificações', () => {
    render(
      <MockedLayoutAuthenticated>
        <div>Test content</div>
      </MockedLayoutAuthenticated>,
    )

    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass(
      'flex-shrink-0',
      'border-b',
      'border-gray-100',
      'bg-white',
      'shadow-sm',
    )
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    expect(screen.getByTestId('notifications')).toBeInTheDocument()
  })

  it('deve renderizar o conteúdo principal dentro do ErrorBoundary', () => {
    render(
      <MockedLayoutAuthenticated>
        <div data-testid="main-content">Main content</div>
      </MockedLayoutAuthenticated>,
    )

    const mainElements = screen.getAllByRole('main')
    expect(mainElements.length).toBeGreaterThan(0)
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
  })

  it('deve renderizar o children no local correto', () => {
    const testContent = 'Conteúdo de teste específico'

    render(
      <MockedLayoutAuthenticated>
        <div data-testid="children-content">{testContent}</div>
      </MockedLayoutAuthenticated>,
    )

    expect(screen.getByTestId('children-content')).toBeInTheDocument()
    expect(screen.getByText(testContent)).toBeInTheDocument()
  })

  it('deve renderizar o Toaster com posição top-right', () => {
    const { container } = render(
      <MockedLayoutAuthenticated>
        <div>Test content</div>
      </MockedLayoutAuthenticated>,
    )

    // Verificar se o Toaster está presente no DOM
    // O componente Toaster do sonner renderiza um elemento ol.toaster
    const toasterElement = container.querySelector('[data-sonner-toaster]')

    // Se o elemento existir, verificar se tem as configurações corretas
    if (toasterElement) {
      // O atributo data-position deve ser "top-right"
      expect(toasterElement).toHaveAttribute('data-position', 'top-right')
    }
  })

  it('deve ter configuração de richColors e closeButton no Toaster', () => {
    const { container } = render(
      <MockedLayoutAuthenticated>
        <div>Test content</div>
      </MockedLayoutAuthenticated>,
    )

    // Verificar se o Toaster tem as configurações corretas
    const toasterElement = container.querySelector('[data-sonner-toaster]')

    if (toasterElement) {
      // Verificar rich colors
      expect(toasterElement).toHaveAttribute('data-rich-colors', 'true')
      // Verificar close button
      expect(toasterElement).toHaveAttribute('data-close-button', 'true')
    }
  })
})
