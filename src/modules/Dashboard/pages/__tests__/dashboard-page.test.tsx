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

// Mock dos hooks
const mockFilters = {
  periodo: { mes: 10, ano: 2025 },
  statusSelecionado: null,
  tipoSelecionado: null,
  unidadeSelecionada: null,
}

const mockResetFilters = vi.fn()

vi.mock('../hooks/useFilters', () => ({
  useFilters: () => ({
    filters: mockFilters,
    resetFilters: mockResetFilters,
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
}

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    data: mockDashboardData,
    isLoading: false,
  }),
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Importar componente
import { DashboardPage } from '../DashboardPage'

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
        screen.getByText('Visão executiva e operacional do portfólio de contratos'),
      ).toBeInTheDocument()
    })

    it('deve renderizar o ícone do dashboard', () => {
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Tabs', () => {
    it('deve renderizar todas as tabs', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Visão Geral')).toBeInTheDocument()
      expect(screen.getByText('Análises')).toBeInTheDocument()
      expect(screen.getByText('Gestão de Riscos')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('deve ter estrutura de container responsivo', () => {
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

      const mainContainer = container.querySelector('.container')
      expect(mainContainer).toBeInTheDocument()
    })

    it('deve ter cabeçalho com borda', () => {
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

      const header = container.querySelector('.border')
      expect(header).toBeInTheDocument()
    })

    it('deve ter grid responsivo para contratos e riscos', () => {
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

      const grid = container.querySelector('.lg\\:grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('deve ter estrutura principal com min-h-screen', () => {
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

      const mainDiv = container.querySelector('.min-h-screen')
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
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

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
      const initialStructure = container.querySelector('.min-h-screen')

      rerender(<DashboardPage />)

      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
      expect(initialStructure).toBeTruthy()
    })
  })

  describe('Componentes de Filtro', () => {
    it('deve renderizar seletor de data', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      expect(screen.getByText('outubro 2025')).toBeInTheDocument()
    })

    it('deve renderizar botão de filtros', () => {
      render(<DashboardPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })
  })

  describe('Estrutura de Tabs', () => {
    it('deve renderizar sistema de abas', () => {
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

      // Verifica se existe a estrutura de tabs do Radix UI
      const tabsList = container.querySelector('[role="tablist"]')
      expect(tabsList).toBeInTheDocument()
    })

    it('deve ter três triggers de tab', () => {
      const { container } = render(<DashboardPage />, { wrapper: createWrapper() })

      const tabTriggers = container.querySelectorAll('[role="tab"]')
      expect(tabTriggers).toHaveLength(3)
    })
  })
})
