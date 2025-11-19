/**
 * ==========================================
 * TESTES DO DASHBOARD PAGE
 * ==========================================
 * Testes para a página principal do dashboard
 */

/* eslint-disable import/order */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock dos hooks
const mockFilters = {
  periodo: { mes: 10, ano: 2025 },
  tipoVisualizacao: 'periodo',
  statusSelecionado: null,
  tipoSelecionado: null,
  unidadeSelecionada: null,
}

const mockResetFilters = vi.fn()
const mockUpdateFilter = vi.fn()

vi.mock('../../hooks/useFilters', () => ({
  useFilters: () => ({
    filters: mockFilters,
    updateFilter: mockUpdateFilter,
    resetFilters: mockResetFilters,
    hasActiveFilters: false,
  }),
}))

const mockDashboardData = {
  metricas: {
    totalContratos: 150,
    contratosAtivos: 120,
    contratosVencendo: 15,
    valorTotal: 5000000,
  },
  contratosPorStatus: [
    { status: 'ativo', quantidade: 120 },
    { status: 'vencendo', quantidade: 15 },
    { status: 'vencido', quantidade: 10 },
    { status: 'encerrado', quantidade: 5 },
  ],
  contratosRecentes: [],
  atividadesRecentes: [],
  lastUpdated: new Date('2023-12-01T10:30:00Z'),
}

vi.mock('../../hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    data: mockDashboardData,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

// Mock dos componentes
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

// Criar wrapper para testes
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

// Importar componente
import { DashboardPage } from '../dashboard-page'

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização Básica', () => {
    it('deve renderizar o título principal', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Dashboard de Contratos')).toBeInTheDocument()
    })

    it('deve renderizar o subtítulo', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      expect(
        screen.getByText(
          'Visão executiva e operacional do portfólio de contratos',
        ),
      ).toBeInTheDocument()
    })

    it('deve renderizar o ícone do dashboard', () => {
      const { container } = render(<DashboardPage />, {
        wrapper: createWrapper(),
      })

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Carousel de Componentes', () => {
    it('deve renderizar componentes do carousel', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      // Verificar se os componentes principais estão presentes
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
      expect(screen.getByTestId('risk-analysis')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('deve ter estrutura principal', () => {
      const { container } = render(<DashboardPage />, {
        wrapper: createWrapper(),
      })

      // Verifica se o container principal existe
      const mainContainer = container.querySelector('.mx-auto')
      expect(mainContainer).toBeInTheDocument()
    })

    it('deve ter cabeçalho com borda', () => {
      const { container } = render(<DashboardPage />, {
        wrapper: createWrapper(),
      })

      const header = container.querySelector('.border')
      expect(header).toBeInTheDocument()
    })

    it('deve ter grid responsivo para contratos e riscos', () => {
      const { container } = render(<DashboardPage />, {
        wrapper: createWrapper(),
      })

      const grid = container.querySelector('.lg\\:grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('deve ter estrutura com altura completa', () => {
      const { container } = render(<DashboardPage />, {
        wrapper: createWrapper(),
      })

      // Verifica estrutura com altura completa
      const mainDiv = container.querySelector('.h-full')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter heading principal com nível correto', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      const heading = screen.getByRole('heading', {
        name: /Dashboard de Contratos/i,
        level: 1,
      })
      expect(heading).toBeInTheDocument()
    })

    it('deve ter estrutura semântica com main', () => {
      const { container } = render(<DashboardPage />, {
        wrapper: createWrapper(),
      })

      const mainElement = container.querySelector('main')
      expect(mainElement).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('deve renderizar em tempo aceitável', () => {
      const startTime = performance.now()
      render(<DashboardPage />, { wrapper: createWrapper() })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(500)
    })

    it('deve manter estrutura entre re-renders', () => {
      const { container, rerender } = render(<DashboardPage />, {
        wrapper: createWrapper(),
      })
      const initialStructure = container.querySelector('.mx-auto')

      rerender(<DashboardPage />)

      expect(container.querySelector('.mx-auto')).toBeInTheDocument()
      expect(initialStructure).toBeTruthy()
    })
  })

  describe('Componentes de Filtro', () => {
    it('deve renderizar seção de filtros', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      // Verificar se o componente FiltersBar foi renderizado (mockado)
      expect(screen.getByTestId('filters-bar')).toBeInTheDocument()
    })

    it('deve renderizar botão de filtros', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })
  })

  describe('Conteúdo do Carousel', () => {
    it('deve exibir conteúdo do carousel', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      // Verifica componentes do carousel
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
      expect(screen.getByTestId('status-chart')).toBeInTheDocument()
    })

    it('deve ter componentes principais visíveis', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      // Verifica se componentes chave estão presentes
      expect(screen.getByTestId('trend-section')).toBeInTheDocument()
      expect(screen.getByTestId('risk-analysis')).toBeInTheDocument()
    })
  })
})
