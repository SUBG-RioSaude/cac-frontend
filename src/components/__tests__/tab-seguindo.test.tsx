/**
 * Testes para componente TabSeguindo
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as subscricoesApi from '@/services/notificacao-api'

import { TabSeguindo } from '../tab-seguindo'

// Mock do serviço de API
vi.mock('@/services/notificacao-api')

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock do react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('TabSeguindo', () => {
  let queryClient: QueryClient

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })

    const Wrapper = ({ children }: { children: ReactNode }) => {
      return (
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      )
    }
    return Wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Estados visuais', () => {
    it('deve renderizar loading state', () => {
      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockImplementation(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { items: [], page: 1, pageSize: 20, total: 0 }
        },
      )

      render(<TabSeguindo />, { wrapper: createWrapper() })

      // Verifica se tem skeletons
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('deve renderizar empty state quando não há subscrições', async () => {
      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
      })

      render(<TabSeguindo />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(
          screen.getByText(/você não está seguindo nenhuma entidade/i),
        ).toBeInTheDocument()
      })
    })

    it('deve renderizar lista de subscrições', async () => {
      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-123',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
          {
            id: 'sub-2',
            sistemaId: 'fornecedores',
            entidadeOrigemId: 'fornecedor-456',
            ativa: true,
            criadoEm: '2025-01-22T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 2,
      })

      render(<TabSeguindo />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Seguindo 2 entidades')).toBeInTheDocument()
      })

      expect(screen.getByText('Contratos')).toBeInTheDocument()
      expect(screen.getByText('Fornecedores')).toBeInTheDocument()
      expect(screen.getByText('contrato-123')).toBeInTheDocument()
      expect(screen.getByText('fornecedor-456')).toBeInTheDocument()
    })
  })

  describe('Agrupamento por sistema', () => {
    it('deve agrupar subscrições por sistema', async () => {
      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-1',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
          {
            id: 'sub-2',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-2',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
          {
            id: 'sub-3',
            sistemaId: 'fornecedores',
            entidadeOrigemId: 'fornecedor-1',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 3,
      })

      render(<TabSeguindo />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Contratos')).toBeInTheDocument()
      })

      // Verifica contadores
      expect(screen.getByText('(2)')).toBeInTheDocument() // 2 contratos
      expect(screen.getByText('(1)')).toBeInTheDocument() // 1 fornecedor
    })

    it('deve mostrar ícones corretos por sistema', async () => {
      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-1',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      })

      const { container } = render(<TabSeguindo />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByText('Contratos')).toBeInTheDocument()
      })

      // Verifica se tem ícones (SVG)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('Interações', () => {
    it('deve navegar ao clicar em subscrição', async () => {
      const user = userEvent.setup()

      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-123',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      })

      render(<TabSeguindo />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('contrato-123')).toBeInTheDocument()
      })

      const link = screen.getByText('contrato-123')
      await user.click(link)

      expect(mockNavigate).toHaveBeenCalledWith('/contratos/contrato-123')
    })

    it('deve chamar callback aoClicar ao navegar', async () => {
      const user = userEvent.setup()
      const aoClicar = vi.fn()

      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'unidades',
            entidadeOrigemId: 'unidade-789',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      })

      render(<TabSeguindo aoClicar={aoClicar} />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('unidade-789')).toBeInTheDocument()
      })

      const link = screen.getByText('unidade-789')
      await user.click(link)

      expect(aoClicar).toHaveBeenCalled()
    })

    it('deve deixar de seguir ao clicar no botão', async () => {
      const user = userEvent.setup()

      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-123',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      })

      vi.mocked(subscricoesApi.toggleSeguir).mockResolvedValue({
        seguindo: false,
        mensagem: 'Deixou de seguir',
      })

      render(<TabSeguindo />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('contrato-123')).toBeInTheDocument()
      })

      // Hover para mostrar botão
      const item = screen.getByText('contrato-123').closest('div')
      if (item) {
        await user.hover(item)
      }

      const botao = screen.getByText('Deixar de seguir')
      await user.click(botao)

      await waitFor(() => {
        expect(subscricoesApi.toggleSeguir).toHaveBeenCalledWith({
          sistemaId: 'contratos',
          entidadeOrigemId: 'contrato-123',
        })
      })
    })
  })

  describe('Formatação de data', () => {
    it('deve mostrar tempo relativo desde criação', async () => {
      const agora = new Date()
      const tresDiasAtras = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000)

      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-123',
            ativa: true,
            criadoEm: tresDiasAtras.toISOString(),
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      })

      render(<TabSeguindo />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText(/Seguindo há/)).toBeInTheDocument()
      })

      // Verifica se tem indicação de tempo (pode variar por timezone)
      expect(screen.getByText(/dias?/)).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('deve mostrar botão "Ver todas" desabilitado', async () => {
      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-123',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      })

      render(<TabSeguindo />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Ver todas as subscrições')).toBeInTheDocument()
      })

      const botao = screen.getByText('Ver todas as subscrições')
      expect(botao).toBeDisabled()
    })
  })
})
