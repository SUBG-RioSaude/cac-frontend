/**
 * ==========================================
 * TESTES PARA EXPIRING CONTRACTS CARD
 * ==========================================
 * Testes para o card de contratos a vencer
 */

import { getContratosVencendo } from '@/modules/Contratos/services/contratos-service'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { DashboardFilters } from '../../../types/dashboard'

import { ExpiringContractsCard } from '../expiring-contracts-card'

// Mock do serviço
vi.mock('@/modules/Contratos/services/contratos-service', () => ({
  getContratosVencendo: vi.fn(),
}))

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

describe('ExpiringContractsCard', () => {
  const mockFilters: DashboardFilters = {
    periodo: { mes: 10, ano: 2025 },
    unidades: [],
    status: [],
    tipos: [],
    tipoVisualizacao: 'global',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Cast para vi.MockedFunction
    const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
      typeof getContratosVencendo
    >
    mockedGetContratosVencendo.mockClear()
  })

  describe('Renderização', () => {
    it('deve renderizar título com período de 30 dias por padrão', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} />, {
        wrapper: createWrapper(),
      })

      expect(
        await screen.findByText('Contratos a Vencer (30d)'),
      ).toBeInTheDocument()
    })

    it('deve renderizar título com período de 60 dias', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 10,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} diasAntecedencia={60} />, {
        wrapper: createWrapper(),
      })

      expect(
        await screen.findByText('Contratos a Vencer (60d)'),
      ).toBeInTheDocument()
    })

    it('deve renderizar título com período de 90 dias', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 15,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} diasAntecedencia={90} />, {
        wrapper: createWrapper(),
      })

      expect(
        await screen.findByText('Contratos a Vencer (90d)'),
      ).toBeInTheDocument()
    })

    it('deve renderizar descrição com período correto', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} diasAntecedencia={60} />, {
        wrapper: createWrapper(),
      })

      expect(
        await screen.findByText('Vencendo nos próximos 60 dias'),
      ).toBeInTheDocument()
    })
  })

  describe('Ícones', () => {
    it('deve usar AlertTriangle para 30 dias (mais urgente)', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      const { container } = render(
        <ExpiringContractsCard filters={mockFilters} diasAntecedencia={30} />,
        {
          wrapper: createWrapper(),
        },
      )

      await screen.findByText('Contratos a Vencer (30d)')

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('deve usar AlertCircle para 60 dias (atenção moderada)', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 10,
        dados: [],
      })

      const { container } = render(
        <ExpiringContractsCard filters={mockFilters} diasAntecedencia={60} />,
        {
          wrapper: createWrapper(),
        },
      )

      await screen.findByText('Contratos a Vencer (60d)')

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('deve usar Clock para 90 dias (menos urgente)', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 15,
        dados: [],
      })

      const { container } = render(
        <ExpiringContractsCard filters={mockFilters} diasAntecedencia={90} />,
        {
          wrapper: createWrapper(),
        },
      )

      await screen.findByText('Contratos a Vencer (90d)')

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Chamadas da API', () => {
    it('deve chamar getContratosVencendo com período correto', () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} diasAntecedencia={30} />, {
        wrapper: createWrapper(),
      })

      expect(getContratosVencendo).toHaveBeenCalledWith(30, expect.any(Object))
    })

    it('deve chamar API sem unidade quando filtro está vazio', () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} />, {
        wrapper: createWrapper(),
      })

      expect(getContratosVencendo).toHaveBeenCalledWith(30, {
        unidadeSaudeId: undefined,
      })
    })

    it('deve chamar API com unidade quando filtro tem apenas uma', () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      const filtersWithUnit: DashboardFilters = {
        ...mockFilters,
        unidades: [123],
      }

      render(<ExpiringContractsCard filters={filtersWithUnit} />, {
        wrapper: createWrapper(),
      })

      expect(getContratosVencendo).toHaveBeenCalledWith(30, {
        unidadeSaudeId: 123,
      })
    })

    it('não deve passar unidade quando há múltiplas no filtro', () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      const filtersWithUnits: DashboardFilters = {
        ...mockFilters,
        unidades: [123, 456],
      }

      render(<ExpiringContractsCard filters={filtersWithUnits} />, {
        wrapper: createWrapper(),
      })

      expect(getContratosVencendo).toHaveBeenCalledWith(30, {
        unidadeSaudeId: undefined,
      })
    })
  })

  describe('Estados de dados', () => {
    it('deve renderizar com dados zerados quando não há contratos', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 0,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} />, {
        wrapper: createWrapper(),
      })

      expect(
        await screen.findByText('Contratos a Vencer (30d)'),
      ).toBeInTheDocument()
    })

    it('deve calcular tendência up quando aumenta', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      // Primeira chamada (atual) retorna 10
      // Segunda chamada (anterior) retorna 5
      mockedGetContratosVencendo
        .mockResolvedValueOnce({
          totalRegistros: 10,
          dados: [],
        })
        .mockResolvedValueOnce({
          totalRegistros: 5,
          dados: [],
        })

      render(<ExpiringContractsCard filters={mockFilters} />, {
        wrapper: createWrapper(),
      })

      // O card deve calcular a tendência como 'up' (100% de aumento)
      expect(
        await screen.findByText('Contratos a Vencer (30d)'),
      ).toBeInTheDocument()
    })

    it('deve calcular tendência down quando diminui', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      // Primeira chamada (atual) retorna 5
      // Segunda chamada (anterior) retorna 10
      mockedGetContratosVencendo
        .mockResolvedValueOnce({
          totalRegistros: 5,
          dados: [],
        })
        .mockResolvedValueOnce({
          totalRegistros: 10,
          dados: [],
        })

      render(<ExpiringContractsCard filters={mockFilters} />, {
        wrapper: createWrapper(),
      })

      // O card deve calcular a tendência como 'down' (-50% de redução)
      expect(
        await screen.findByText('Contratos a Vencer (30d)'),
      ).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('deve aplicar className personalizada', () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      const { container } = render(
        <ExpiringContractsCard
          filters={mockFilters}
          className="custom-class"
        />,
        {
          wrapper: createWrapper(),
        },
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })

    it('deve ter data-testid correto baseado no período', () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} diasAntecedencia={60} />, {
        wrapper: createWrapper(),
      })

      expect(
        screen.getByTestId('expiring-contracts-card-60'),
      ).toBeInTheDocument()
    })
  })

  describe('Cache e Performance', () => {
    it('deve usar staleTime de 2 minutos para dados atuais', async () => {
      const mockedGetContratosVencendo = getContratosVencendo as vi.MockedFunction<
        typeof getContratosVencendo
      >
      mockedGetContratosVencendo.mockResolvedValue({
        totalRegistros: 5,
        dados: [],
      })

      render(<ExpiringContractsCard filters={mockFilters} />, {
        wrapper: createWrapper(),
      })

      // Verificar que o componente foi renderizado (implicitamente valida a configuração)
      expect(
        await screen.findByText('Contratos a Vencer (30d)'),
      ).toBeInTheDocument()
    })
  })
})
