import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TabDocumentos } from '../tab-documentos'
import type { DocumentoContratoDto } from '@/modules/Contratos/types/contrato'

// Mock do sonner toast
vi.mock('sonner', () => ({
  toast: {
    dismiss: vi.fn(),
  },
}))

// Mock dos hooks
const mockUseDocumentos = vi.fn()
const mockUpdateMutation = vi.fn()

vi.mock('@/modules/Contratos/hooks', () => ({
  useDocumentos: () => mockUseDocumentos(),
  useUpdateDocumentosMultiplos: () => mockUpdateMutation(),
}))

// Mock do useToast
vi.mock('@/modules/Contratos/hooks/useToast', () => ({
  useToast: () => ({
    mutation: {
      loading: vi.fn(() => 'loading-toast-id'),
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}))

// Helper para renderizar com QueryClient
function renderWithQueryClient(component: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('TabDocumentos - Testes Essenciais', () => {
  const contratoId = 'contrato-123'
  
  const mockDocumentosApi: DocumentoContratoDto[] = [
    {
      id: 'doc-1',
      contratoId,
      nome: 'Termo de Referência/Edital',
      tipo: '1',
      categoria: 'obrigatorio',
      status: 'conferido',
      linkExterno: 'https://exemplo.com/termo',
      observacoes: 'Documento entregue',
      dataCadastro: '2025-01-01T10:00:00Z',
      dataAtualizacao: '2025-01-02T14:00:00Z',
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseDocumentos.mockReturnValue({
      data: mockDocumentosApi,
      isLoading: false,
      error: null,
    })
    
    mockUpdateMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
  })

  describe('Renderização Básica', () => {
    it('deve renderizar título do componente', () => {
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)
      expect(screen.getByText('Checklist de Documentos')).toBeInTheDocument()
    })

    it('deve renderizar todos os 8 documentos', () => {
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)

      expect(screen.getByText('Termo de Referência/Edital')).toBeInTheDocument()
      expect(screen.getByText('Homologação')).toBeInTheDocument()
      expect(screen.getByText('Ata de Registro de Preços')).toBeInTheDocument()
      expect(screen.getByText('Garantia Contratual')).toBeInTheDocument()
      expect(screen.getByText('Contrato')).toBeInTheDocument()
      expect(screen.getByText('Publicação PNCP')).toBeInTheDocument()
      expect(screen.getByText('Publicação de Extrato Contratual')).toBeInTheDocument()
      expect(screen.getByText('Proposta')).toBeInTheDocument()
    })

    it('deve mostrar progresso corretamente', () => {
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)
      
      expect(screen.getByText('1 de 8 entregues')).toBeInTheDocument()
      expect(screen.getByText('13%')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('deve usar layout de grid responsivo', () => {
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)
      
      const grid = document.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4')
    })
  })

  describe('Estados de Loading e Erro', () => {
    it('deve mostrar skeleton durante loading', () => {
      mockUseDocumentos.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      })

      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)
      
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('deve mostrar erro quando API falha', () => {
      mockUseDocumentos.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Erro da API'),
      })

      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)
      
      expect(screen.getByText('Erro')).toBeInTheDocument()
      expect(screen.getByText('Não foi possível carregar o checklist de documentos.')).toBeInTheDocument()
    })
  })

  describe('Interação com Checkboxes', () => {
    it('deve ter 8 checkboxes renderizados', () => {
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(8)
    })

    it('deve marcar checkbox baseado na API', () => {
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const termoReferenciaCheckbox = checkboxes[0] // Primeiro documento da API
      
      expect(termoReferenciaCheckbox).toBeChecked()
    })

    it('deve permitir clicar em checkbox', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const checkboxDesmarcado = checkboxes.find(cb => !cb.getAttribute('aria-checked'))
      
      if (checkboxDesmarcado) {
        await user.click(checkboxDesmarcado)
        // Após clicar, deve aparecer indicador de mudanças não salvas
        expect(screen.getByText('Há alterações não salvas')).toBeInTheDocument()
      }
    })
  })

  describe('Botão Salvar', () => {
    it('deve renderizar botão de salvar', () => {
      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)
      
      expect(screen.getByText('Salvar Alterações')).toBeInTheDocument()
    })

    it('deve mostrar loading quando mutation está pendente', () => {
      mockUpdateMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      })

      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)

      // Verifica se o ícone de loading está presente
      const loadingIcon = document.querySelector('.animate-spin')
      expect(loadingIcon).toBeInTheDocument()
    })
  })

  describe('Sincronização com API', () => {
    it('deve sincronizar status baseado na API', () => {
      const mockComDocumentoConferido: DocumentoContratoDto[] = [
        {
          id: 'doc-1',
          contratoId,
          nome: 'Homologação',
          tipo: '2',
          categoria: 'obrigatorio',
          status: 'conferido',
          linkExterno: null,
          observacoes: '',
          dataCadastro: '2025-01-01T10:00:00Z',
          dataAtualizacao: '2025-01-01T10:00:00Z',
        }
      ]

      mockUseDocumentos.mockReturnValue({
        data: mockComDocumentoConferido,
        isLoading: false,
        error: null,
      })

      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const homologacaoCheckbox = checkboxes[1] // Segunda posição no array
      
      expect(homologacaoCheckbox).toBeChecked()
    })

    it('deve tratar "sem url" da API corretamente', () => {
      const mockComSemUrl: DocumentoContratoDto[] = [
        {
          id: 'doc-1',
          contratoId,
          nome: 'Contrato',
          tipo: '5',
          categoria: 'obrigatorio',
          status: 'conferido',
          linkExterno: null, // Mapeado de "sem url"
          observacoes: '',
          dataCadastro: '2025-01-01T10:00:00Z',
          dataAtualizacao: '2025-01-01T10:00:00Z',
        }
      ]

      mockUseDocumentos.mockReturnValue({
        data: mockComSemUrl,
        isLoading: false,
        error: null,
      })

      renderWithQueryClient(<TabDocumentos contratoId={contratoId} />)

      // Deve renderizar normalmente sem erros
      expect(screen.getByText('Contrato')).toBeInTheDocument()
      expect(screen.getByText('1 de 8 entregues')).toBeInTheDocument()
    })
  })
})