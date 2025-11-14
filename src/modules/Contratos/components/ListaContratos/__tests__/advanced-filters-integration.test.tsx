import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useFiltrosContratosConfig } from '@/modules/Contratos/config/filtros-config'
import { useContratos } from '@/modules/Contratos/hooks'
import { useContratosPageState } from '@/modules/Contratos/hooks/use-contratos-page-state'
import { ContratosPage } from '@/modules/Contratos/pages/VisualizacaoContratos/contratos-list-page'
import { useUnidades } from '@/modules/Unidades/hooks/use-unidades'

// Mock all necessary hooks and modules
const mockSetTermoPesquisa = vi.fn()

vi.mock('@/modules/Contratos/hooks/use-contratos-page-state')
vi.mock('@/modules/Contratos/config/filtros-config')
vi.mock('@/modules/Contratos/hooks')
vi.mock('@/modules/Unidades/hooks/use-unidades')
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})
vi.mock('@/components/advanced-filters/hooks/use-filter-search', () => ({
  useFilterSearch: vi.fn(() => ({
    searchTerm: '',
    setSearchTerm: mockSetTermoPesquisa,
    clearSearch: vi.fn(),
    showMinCharactersWarning: false,
    minCharacters: 0,
  })),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('ContratosPage AdvancedFilters Integration', () => {
  it('should render without crashing', () => {
    // Arrange
    const useContratosPageStateMock = {
      termoPesquisa: '',
      setTermoPesquisa: vi.fn(),
      filtros: [],
      setFiltros: vi.fn(),
      limparFiltros: vi.fn(),
      pagina: 1,
      setPagina: vi.fn(),
      paginacao: { pagina: 1, itensPorPagina: 10, total: 0 },
      setPaginacao: vi.fn(),
      ordenacao: { campo: 'id', direcao: 'asc' },
      setOrdenacao: vi.fn(),
      contratosSelecionados: [],
      selecionarContrato: vi.fn(),
      selecionarTodosContratos: vi.fn(),
      toggleSelecionarContrato: vi.fn(),
      selecionarTodos: vi.fn(),
      limparSelecao: vi.fn(),
    }
    vi.mocked(useContratosPageState).mockReturnValue(useContratosPageStateMock)
    vi.mocked(useFiltrosContratosConfig).mockReturnValue({
      filtrosConfig: [],
      isLoading: false,
    })
    vi.mocked(useContratos).mockReturnValue({ data: { data: [], meta: {} } })
    vi.mocked(useUnidades).mockReturnValue({ data: { data: [] } })

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ContratosPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    // Assert
    expect(screen.getByText('Contratos')).toBeInTheDocument()
  })
})
