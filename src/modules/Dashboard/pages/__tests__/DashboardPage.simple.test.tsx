import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

    it('deve renderizar botão de atualizar', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      // Buscar botão por texto ao invés de role
      expect(screen.getByText('Atualizar')).toBeInTheDocument()
    })
  })

  describe('Tabs', () => {
    it('deve renderizar todas as tabs', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      expect(screen.getByText('Métricas')).toBeInTheDocument()
      expect(screen.getByText('Gráficos')).toBeInTheDocument()
      expect(screen.getByText('Recentes')).toBeInTheDocument()
      expect(screen.getByText('Riscos')).toBeInTheDocument()
      expect(screen.getByText('Atividades')).toBeInTheDocument()
    })

    it('deve exibir conteúdo da tab métricas por padrão', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      // Verificar se o título da tab métricas está visível
      expect(screen.getByText('Métricas Principais')).toBeInTheDocument()
    })
  })

  describe('Estrutura', () => {
    it('deve ter layout principal correto', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
      expect(container.querySelector('.max-w-7xl')).toBeInTheDocument()
    })

    it('deve ter cabeçalho com gradiente', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      expect(container.querySelector('.bg-gradient-to-r')).toBeInTheDocument()
    })

    it('deve ter tabs container', () => {
      const { container } = render(<DashboardPage />, { wrapper: Wrapper })

      expect(container.querySelector('[role="tablist"]')).toBeInTheDocument()
    })
  })

  describe('Conteúdo das Tabs', () => {
    it('deve exibir título da tab métricas', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      expect(screen.getByText('Métricas Principais')).toBeInTheDocument()
    })

    it('deve ter rodapé', () => {
      render(<DashboardPage />, { wrapper: Wrapper })

      expect(
        screen.getByText('Dashboard de Contratos • CAC Sistema de Gestão'),
      ).toBeInTheDocument()
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
