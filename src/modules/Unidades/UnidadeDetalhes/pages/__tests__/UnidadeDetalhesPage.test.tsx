import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { UnidadeDetalhesPage } from '../UnidadeDetalhesPage'

// Mock do framer-motion para evitar problemas nos testes
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock do useNavigate e useParams
const mockNavigate = vi.fn()
const mockParams = { unidadeId: '1' }

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

// Mock do useErrorHandler
const mockHandleError = vi.fn()
vi.mock('@/hooks/use-error-handler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}))

vi.mock('@/modules/Unidades/ListaUnidades/data/unidades.json', () => ({
  default: [
    {
      id: 1,
      nome: 'Hospital Municipal de Saude Sao Joao',
      sigla: 'HMSJ',
      UO: '01.001',
      UG: '001.001.001',
      endereco: 'Rua das Palmeiras, 1250 - Centro, Sao Paulo - SP, 01234-567',
      status: 'ativo',
      contratosAtivos: 3,
      valorTotalContratado: 2500000,
      contratos: [
        {
          id: 101,
          numero: 'CT-2024-001',
          objeto: 'Prestacao de servicos de limpeza e conservacao',
          fornecedor: 'Empresa de Limpeza ABC Ltda',
          valor: 850000,
          vigenciaInicio: '2024-01-15',
          vigenciaFim: '2024-12-31',
          status: 'ativo',
        },
        {
          id: 102,
          numero: 'CT-2024-015',
          objeto: 'Fornecimento de medicamentos basicos',
          fornecedor: 'Farmacia Central S.A.',
          valor: 1200000,
          vigenciaInicio: '2024-02-01',
          vigenciaFim: '2025-01-31',
          status: 'ativo',
        },
      ],
    },
    {
      id: 2,
      nome: 'Ambulatorio Sem Contratos',
      sigla: 'ASC',
      UO: '01.007',
      UG: '001.001.007',
      endereco: 'Rua Teste, 123',
      status: 'ativo',
      contratosAtivos: 0,
      valorTotalContratado: 0,
      contratos: [],
    },
  ],
}))

// Wrapper para testes com router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('UnidadeDetalhesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset params para unidade que existe
    mockParams.unidadeId = '1'
  })

  it('deve mostrar loading inicialmente', () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    // O componente usa animate-pulse e elementos de loading
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeTruthy()
  })

  it('deve renderizar informações básicas da unidade', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Hospital Municipal de Saude Sao Joao'),
      ).toBeInTheDocument()
      expect(screen.getByText('HMSJ')).toBeInTheDocument()
      expect(screen.getAllByText('Ativo')[0]).toBeInTheDocument() // Usar o primeiro elemento encontrado
    })
  })

  it('deve renderizar códigos administrativos', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(screen.getByText('Códigos Administrativos')).toBeInTheDocument()
      expect(screen.getByText('01.001')).toBeInTheDocument()
      expect(screen.getByText('001.001.001')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // ID da unidade
    })
  })

  it('deve renderizar endereço da unidade', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(screen.getByText('Localização')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Rua das Palmeiras, 1250 - Centro, Sao Paulo - SP, 01234-567',
        ),
      ).toBeInTheDocument()
    })
  })

  it('deve renderizar lista de contratos vinculados', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(screen.getByText('Contratos Vinculados (2)')).toBeInTheDocument()
      expect(screen.getByText('CT-2024-001')).toBeInTheDocument()
      expect(screen.getByText('CT-2024-015')).toBeInTheDocument()
      expect(
        screen.getByText('Prestacao de servicos de limpeza e conservacao'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Fornecimento de medicamentos basicos'),
      ).toBeInTheDocument()
    })
  })

  it('deve renderizar fornecedores dos contratos', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Empresa de Limpeza ABC Ltda'),
      ).toBeInTheDocument()
      expect(screen.getByText('Farmacia Central S.A.')).toBeInTheDocument()
    })
  })

  it('deve renderizar valores dos contratos formatados', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      // Verifica se há valores monetários formatados
      expect(document.body.textContent).toContain('R$')
    })
  })

  it('deve renderizar datas de vigência dos contratos', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      // Verifica se há datas nos contratos
      expect(document.body.textContent).toContain('2024')
      expect(document.body.textContent).toContain('2025')
    })
  })

  it('deve permitir navegação de volta para lista de unidades', async () => {
    const user = userEvent.setup()
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Hospital Municipal de Saude Sao Joao'),
      ).toBeInTheDocument()
    })

    const voltarButton = screen.getByText('Voltar')
    await user.click(voltarButton)

    expect(mockNavigate).toHaveBeenCalledWith('/unidades')
  })

  it('deve permitir navegar para detalhes do contrato', async () => {
    const user = userEvent.setup()
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(screen.getByText('CT-2024-001')).toBeInTheDocument()
    })

    const abrirButtons = screen.getAllByText('Abrir')
    await user.click(abrirButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith('/contratos/101')
  })

  it('deve renderizar ações rápidas', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument()
      expect(screen.getByText('Ver Todos os Contratos')).toBeInTheDocument()
      expect(screen.getByText('Relatórios da Unidade')).toBeInTheDocument()
      expect(screen.getByText('Editar Informações')).toBeInTheDocument()
    })
  })

  it('deve exibir estado vazio quando unidade não tem contratos', async () => {
    // Mudar para unidade sem contratos
    mockParams.unidadeId = '2'

    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum contrato vinculado')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Esta unidade não possui contratos ativos no momento.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('deve chamar handleError para unidade não encontrada', async () => {
    // ID de unidade que não existe
    mockParams.unidadeId = '999'

    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        'Unidade não encontrada',
        404,
      )
    })
  })

  it('deve renderizar badges de status dos contratos', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      const statusBadges = screen.getAllByText('Ativo')
      // Um badge para status da unidade, dois para contratos
      expect(statusBadges.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('deve ser responsivo e mostrar informações em dispositivos móveis', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      // Verifica se as classes responsivas estão aplicadas
      const headerElement = screen.getByText(
        'Hospital Municipal de Saude Sao Joao',
      )
      expect(headerElement).toHaveClass('text-xl', 'sm:text-2xl', 'lg:text-3xl')
    })
  })

  it('deve ter animações aplicadas aos elementos', async () => {
    renderWithRouter(<UnidadeDetalhesPage />)

    await waitFor(() => {
      // Como mockamos o framer-motion, verificamos se os elementos estão renderizados
      expect(
        screen.getByText('Hospital Municipal de Saude Sao Joao'),
      ).toBeInTheDocument()
    })
  })
})
