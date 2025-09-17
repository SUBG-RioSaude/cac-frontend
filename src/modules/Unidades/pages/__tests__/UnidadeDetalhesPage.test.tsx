import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { UnidadeDetalhesPage } from '../UnidadeDetalhesPage'
import { useUnidadeDetalhada } from '../../hooks/use-unidade-detalhada'

// Mock do hook
vi.mock('../../hooks/use-unidade-detalhada')

const mockUseUnidadeDetalhada = vi.mocked(useUnidadeDetalhada)

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    useParams: () => ({ unidadeId: 'test-id' }),
    useNavigate: () => mockNavigate,
  }
})

const mockUnidade = {
  nome: 'Assessoria de Comunicação Social',
  sigla: 'S/ACS',
  capId: 'd0231632-82c4-4f4d-94d9-d6e9aef8fd2c',
  cap: {
    nome: 'CAP Temporário',
    uo: '0',
    id: 'd0231632-82c4-4f4d-94d9-d6e9aef8fd2c',
    ativo: true
  },
  endereco: 'Rua Afonso Cavalcanti, 455',
  bairro: 'Cidade Nova',
  ua: 13210,
  subsecretaria: '0',
  ap: '0',
  uo: 0,
  ug: 0,
  cnes: '0',
  latitude: '0',
  longitude: '0',
  tipoUnidadeId: 1,
  tipoUnidade: null,
  tipoAdministracaoId: 1,
  tipoAdministracao: null,
  id: 'f5884390-f61a-4c88-b8ec-bd1e7e305ac5',
  ativo: true
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('UnidadeDetalhesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar loading quando está carregando', () => {
    vi.mocked(mockUseUnidadeDetalhada).mockReturnValue({
      unidade: null,
      carregando: true,
      erro: null,
      recarregar: vi.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    // Verifica se há elementos de loading (divs com animate-pulse)
    const loadingElements = document.querySelectorAll('.animate-pulse')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('deve renderizar erro quando há erro', () => {
    vi.mocked(mockUseUnidadeDetalhada).mockReturnValue({
      unidade: null,
      carregando: false,
      erro: 'Erro ao carregar dados da unidade',
      recarregar: vi.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Erro ao Carregar Unidade')).toBeInTheDocument()
    expect(screen.getByText('Erro ao carregar dados da unidade')).toBeInTheDocument()
    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
  })

  it('deve renderizar dados da unidade quando carregado com sucesso', async () => {
    vi.mocked(mockUseUnidadeDetalhada).mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: vi.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Assessoria de Comunicação Social').length).toBeGreaterThan(0)
      expect(screen.getByText('S/ACS')).toBeInTheDocument()
      expect(screen.getByText('CAP Temporário')).toBeInTheDocument()
    })
  })

  it('deve mostrar badge ativo quando unidade está ativa', () => {
    vi.mocked(mockUseUnidadeDetalhada).mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: vi.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('deve mostrar badge inativo quando unidade está inativa', () => {
    const unidadeInativa = { ...mockUnidade, ativo: false }
    
    vi.mocked(mockUseUnidadeDetalhada).mockReturnValue({
      unidade: unidadeInativa,
      carregando: false,
      erro: null,
      recarregar: vi.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('deve navegar de volta quando clicar em voltar', async () => {
    vi.mocked(mockUseUnidadeDetalhada).mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: vi.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    const botaoVoltar = screen.getByText('Voltar')
    await userEvent.click(botaoVoltar)
    
    expect(mockNavigate).toHaveBeenCalledWith('/unidades')
  })

  it('deve mostrar abas de informações gerais e endereço', () => {
    vi.mocked(mockUseUnidadeDetalhada).mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: vi.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Informações Gerais')).toBeInTheDocument()
    expect(screen.getByText('Endereço')).toBeInTheDocument()
  })
})
