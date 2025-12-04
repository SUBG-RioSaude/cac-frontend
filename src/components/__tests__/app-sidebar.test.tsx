import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import '@testing-library/jest-dom'

import { AppSidebar } from '../app-sidebar'
import { SidebarProvider } from '../ui/sidebar'

vi.mock('@/components/sidebar-footer', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar-footer">Sidebar Footer</div>,
}))

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    usuario: null,
    estaAutenticado: false,
    carregando: false,
  }),
}))

vi.mock('@/lib/auth/auth', () => ({
  getToken: vi.fn(() => null),
  getTokenInfo: vi.fn(() => null),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const MockedAppSidebar = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

describe('AppSidebar', () => {
  it('deve renderizar corretamente', () => {
    render(<MockedAppSidebar />)

    expect(screen.getByAltText('Logo Prefeitura')).toBeInTheDocument()
  })

  it('deve renderizar a logo principal', () => {
    render(<MockedAppSidebar />)

    const logo = screen.getByAltText('Logo Prefeitura')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/logo certa.png')
    expect(logo).toHaveClass('h-24', 'w-52', 'object-contain')
  })

  it('deve renderizar a logo CAC', () => {
    render(<MockedAppSidebar />)

    const cacLogo = screen.getByAltText('Logo CAC')
    expect(cacLogo).toBeInTheDocument()
    expect(cacLogo).toHaveAttribute('src', '/logos-cac/3.png')
    // Texto real é "CAC 360", não apenas "CAC"
    expect(screen.getByText('CAC 360')).toBeInTheDocument()
    expect(screen.getByText('Análise de Contratos')).toBeInTheDocument()
  })

  it('deve renderizar o link para a página inicial na logo', () => {
    render(<MockedAppSidebar />)

    const homeLink = screen.getByRole('link')
    expect(homeLink).toHaveAttribute('href', '/dashboard')
  })

  it('deve ter as classes corretas para sidebar', () => {
    render(<MockedAppSidebar />)

    const sidebar = document.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toBeInTheDocument()
  })

  it('deve renderizar com props personalizadas', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SidebarProvider>
            <AppSidebar data-testid="custom-sidebar" />
          </SidebarProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByAltText('Logo Prefeitura')).toBeInTheDocument()
  })

  it('deve mostrar o separador entre header e conteúdo', () => {
    render(<MockedAppSidebar />)

    const separator = document.querySelector('.bg-sidebar-border\\/50')
    expect(separator).toBeInTheDocument()
  })
})
