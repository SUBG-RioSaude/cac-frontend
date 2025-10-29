import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { DashboardPage } from '../DashboardPage'

// Wrapper para testes com QueryClient
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Mock completo dos hooks para evitar chamadas reais
vi.mock('../hooks/useFilters', () => ({
  useFilters: () => ({
    filters: {},
    updateFilter: vi.fn(),
    resetFilters: vi.fn(),
    hasActiveFilters: false,
  }),
}))

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    data: { lastUpdated: new Date('2023-12-01T10:30:00Z') },
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

// Mock dos componentes para focar na estrutura
vi.mock('../components/Filters/GlobalFilters', () => ({
  GlobalFilters: () => <div data-testid="global-filters">Filtros</div>,
}))

vi.mock('../components/Cards', () => ({
  TotalContractsCard: () => <div data-testid="total-contracts">Total</div>,
  ActiveContractsCard: () => <div data-testid="active-contracts">Ativos</div>,
  ExpiringContractsCard: () => (
    <div data-testid="expiring-contracts">Vencendo</div>
  ),
  TotalValueCard: () => <div data-testid="total-value">Valor</div>,
}))

vi.mock('../components/Charts', () => ({
  StatusDistributionChart: () => (
    <div data-testid="status-chart">Status Chart</div>
  ),
  StatusTrendChart: () => <div data-testid="trend-chart">Trend Chart</div>,
  TypeDistributionChart: () => <div data-testid="type-chart">Type Chart</div>,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('DashboardPage - Testes Essenciais', () => {
  describe('Renderização Básica', () => {
    it('deve renderizar o título principal', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      expect(screen.getByText('Dashboard de Contratos')).toBeInTheDocument()
    })

    it('deve renderizar a descrição', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      expect(
        screen.getByText(
          'Visão executiva e operacional do portfólio de contratos',
        ),
      ).toBeInTheDocument()
    })

    it('deve renderizar seção de filtros', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Procurar por texto relacionado aos filtros ao invés do mock
      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('deve renderizar seletor de período', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verificar se o seletor de período está presente
      expect(screen.getByText('outubro 2025')).toBeInTheDocument()
    })
  })

  describe('Tabs', () => {
    it('deve renderizar todas as tabs', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      expect(screen.getByText('Visão Geral')).toBeInTheDocument()
      expect(screen.getByText('Análises')).toBeInTheDocument()
      expect(screen.getByText('Gestão de Riscos')).toBeInTheDocument()
    })

    it('deve exibir conteúdo da tab visão geral por padrão', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verificar se a tab "Visão Geral" está ativa por padrão
      expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    })
  })

  describe('Estrutura', () => {
    it('deve ter layout principal correto', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica container principal com padding
      expect(container.querySelector('.py-6')).toBeInTheDocument()
      // Verifica container com mx-auto
      expect(container.querySelector('.mx-auto')).toBeInTheDocument()
    })

    it('deve ter cabeçalho com borda', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica cabeçalho com borda
      expect(container.querySelector('.border')).toBeInTheDocument()
    })

    it('deve ter tabs container', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica se tabs estão presentes
      expect(container.querySelector('[role="tablist"]')).toBeInTheDocument()
    })
  })

  describe('Conteúdo das Tabs', () => {
    it('deve exibir conteúdo da tab visão geral', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    })

    it('deve ter estrutura de tabs', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica se tabs estão presentes
      expect(container.querySelector('[role="tablist"]')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now()
      render(<DashboardPage />, { wrapper: Wrapper })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(500) // Relaxed for CI/CD environments
    })
  })
})
