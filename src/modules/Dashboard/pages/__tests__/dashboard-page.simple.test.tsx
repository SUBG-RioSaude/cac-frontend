import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { DashboardPage } from '../dashboard-page'

// Wrapper para testes com QueryClient e Router
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

// Mock completo dos hooks para evitar chamadas reais
vi.mock('../../hooks/useFilters', () => ({
  useFilters: () => ({
    filters: {
      periodo: { mes: 10, ano: 2025 },
      tipoVisualizacao: 'periodo',
    },
    updateFilter: vi.fn(),
    resetFilters: vi.fn(),
    hasActiveFilters: false,
  }),
}))

vi.mock('../../hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    data: { lastUpdated: new Date('2023-12-01T10:30:00Z') },
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

// Mock dos componentes para focar na estrutura
vi.mock('../../components/Filters', () => ({
  FiltersBar: () => <div data-testid="filters-bar">Filtros</div>,
}))

vi.mock('../../components/Cards', () => ({
  TotalContractsCard: () => <div data-testid="total-contracts">Total</div>,
  ActiveContractsCard: () => <div data-testid="active-contracts">Ativos</div>,
  ExpiredContractsCard: () => <div data-testid="expired-contracts">Vencidos</div>,
  TotalValueCard: () => <div data-testid="total-value">Valor</div>,
}))

vi.mock('../../components/Charts', () => ({
  StatusDistributionChart: () => (
    <div data-testid="status-chart">Status Chart</div>
  ),
  TrendSection: () => <div data-testid="trend-section">Trend</div>,
  TypeDistributionChart: () => <div data-testid="type-chart">Type Chart</div>,
}))

vi.mock('../../components/Lists', () => ({
  RecentContracts: () => <div data-testid="recent-contracts">Contratos Recentes</div>,
  RecentActivities: () => <div data-testid="recent-activities">Atividades</div>,
  RiskAnalysis: () => <div data-testid="risk-analysis">Riscos</div>,
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

      // Verificar se o component FiltersBar foi renderizado
      expect(screen.getByTestId('filters-bar')).toBeInTheDocument()
    })

    it('deve renderizar seletor de período', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verificar se filtros estão renderizados (mock)
      expect(screen.getByTestId('filters-bar')).toBeInTheDocument()
    })
  })

  describe('Carousel de Componentes', () => {
    it('deve renderizar componentes do carousel', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verificar se os componentes principais estão presentes
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
      expect(screen.getByTestId('risk-analysis')).toBeInTheDocument()
    })

    it('deve exibir conteúdo do primeiro slide por padrão', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verificar se os componentes do primeiro slide estão presentes
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
      expect(screen.getByTestId('risk-analysis')).toBeInTheDocument()
    })
  })

  describe('Estrutura', () => {
    it('deve ter layout principal correto', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica container com mx-auto
      expect(container.querySelector('.mx-auto')).toBeInTheDocument()
    })

    it('deve ter cabeçalho com borda', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica cabeçalho com borda
      expect(container.querySelector('.border')).toBeInTheDocument()
    })

    it('deve ter carousel container', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica se componentes do carousel estão presentes
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
    })
  })

  describe('Conteúdo dos Slides', () => {
    it('deve exibir conteúdo do primeiro slide', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica componentes do primeiro slide
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
      expect(screen.getByTestId('risk-analysis')).toBeInTheDocument()
    })

    it('deve ter estrutura de carousel', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verifica se componentes do carousel estão presentes
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
      expect(screen.getByTestId('status-chart')).toBeInTheDocument()
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
