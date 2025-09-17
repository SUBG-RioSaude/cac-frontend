import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PageBreadcrumb from '@/components/page-breadcrumb'
import { SidebarProvider } from '@/components/ui/sidebar'

// Mock do hook useIsMobile usado pelo SidebarProvider
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

// Mock do axios para evitar calls reais na API
vi.mock('@/lib/axios', () => ({
  executeWithFallback: vi.fn().mockResolvedValue({
    data: { numeroContrato: '123', id: '123' }
  }),
}))

const renderWithProviders = (initialEntries = ['/']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <SidebarProvider>
          <PageBreadcrumb />
        </SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PageBreadcrumb', () => {
  it('deve renderizar o breadcrumb na página inicial', () => {
    renderWithProviders(['/'])

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument() // SidebarTrigger
  })

  it('deve renderizar o breadcrumb na página de contratos', () => {
    renderWithProviders(['/contratos'])

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Contratos')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument() // SidebarTrigger
  })

  it('deve renderizar o breadcrumb na página de detalhes do contrato', async () => {
    renderWithProviders(['/contratos/123'])

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Contratos')).toBeInTheDocument()
    
    // Aguardar dados assíncronos do contrato
    await waitFor(() => {
      expect(screen.getByText('Contrato 123')).toBeInTheDocument()
    })
    
    expect(screen.getByRole('button')).toBeInTheDocument() // SidebarTrigger
  })

  it('deve renderizar o breadcrumb na página de fornecedores', () => {
    renderWithProviders(['/fornecedores'])

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument() // SidebarTrigger
  })

  it('deve renderizar o breadcrumb na página de detalhes do fornecedor', () => {
    renderWithProviders(['/fornecedores/456'])

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
    expect(screen.getByText('456')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument() // SidebarTrigger
  })

  it('deve renderizar o SidebarTrigger junto com o breadcrumb', () => {
    renderWithProviders(['/contratos'])

    const trigger = screen.getByRole('button')
    const breadcrumb = screen.getByText('Contratos')

    expect(trigger).toBeInTheDocument()
    expect(breadcrumb).toBeInTheDocument()

    // Verifica se estão no mesmo container
    const container = trigger.closest('div')
    expect(container).toContainElement(breadcrumb)
  })

  it('deve ter atributos de acessibilidade corretos no SidebarTrigger', () => {
    renderWithProviders(['/'])

    const trigger = screen.getByRole('button')

    expect(trigger).toHaveAttribute('aria-label', 'Alternar sidebar')
    expect(trigger).toHaveAttribute(
      'title',
      'Clique para expandir/colapsar a sidebar (Ctrl+B)',
    )
  })

  it('deve ter classes de estilo para hover e interação', () => {
    renderWithProviders(['/'])

    const trigger = screen.getByRole('button')

    expect(trigger).toHaveClass('hover:bg-gray-100')
    expect(trigger).toHaveClass('transition-colors')
    expect(trigger).toHaveClass('cursor-pointer')
  })
})
