import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { UnidadeDetalhesPage } from '../UnidadeDetalhesPage'
import { useUnidadeDetalhada } from '../../hooks/use-unidade-detalhada'

// Mock do hook
jest.mock('../../hooks/use-unidade-detalhada')

const mockUseUnidadeDetalhada = useUnidadeDetalhada as jest.MockedFunction<typeof useUnidadeDetalhada>

// Mock do react-router-dom
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-id' }),
  useNavigate: () => mockNavigate,
}))

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
    jest.clearAllMocks()
  })

  it('deve renderizar loading quando está carregando', () => {
    mockUseUnidadeDetalhada.mockReturnValue({
      unidade: null,
      carregando: true,
      erro: null,
      recarregar: jest.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve renderizar erro quando há erro', () => {
    mockUseUnidadeDetalhada.mockReturnValue({
      unidade: null,
      carregando: false,
      erro: 'Erro ao carregar dados da unidade',
      recarregar: jest.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Erro ao Carregar Unidade')).toBeInTheDocument()
    expect(screen.getByText('Erro ao carregar dados da unidade')).toBeInTheDocument()
    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
  })

  it('deve renderizar dados da unidade quando carregado com sucesso', async () => {
    mockUseUnidadeDetalhada.mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: jest.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Assessoria de Comunicação Social')).toBeInTheDocument()
      expect(screen.getByText('S/ACS')).toBeInTheDocument()
      expect(screen.getByText('CAP Temporário')).toBeInTheDocument()
      expect(screen.getByText('Rua Afonso Cavalcanti, 455')).toBeInTheDocument()
    })
  })

  it('deve mostrar badge ativo quando unidade está ativa', () => {
    mockUseUnidadeDetalhada.mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: jest.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('deve mostrar badge inativo quando unidade está inativa', () => {
    const unidadeInativa = { ...mockUnidade, ativo: false }
    
    mockUseUnidadeDetalhada.mockReturnValue({
      unidade: unidadeInativa,
      carregando: false,
      erro: null,
      recarregar: jest.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('deve navegar de volta quando clicar em voltar', () => {
    mockUseUnidadeDetalhada.mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: jest.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    const botaoVoltar = screen.getByText('Voltar')
    botaoVoltar.click()
    
    expect(mockNavigate).toHaveBeenCalledWith('/unidades')
  })

  it('deve mostrar abas de informações gerais e endereço', () => {
    mockUseUnidadeDetalhada.mockReturnValue({
      unidade: mockUnidade,
      carregando: false,
      erro: null,
      recarregar: jest.fn()
    })

    renderWithRouter(<UnidadeDetalhesPage />)
    
    expect(screen.getByText('Informações Gerais')).toBeInTheDocument()
    expect(screen.getByText('Endereço')).toBeInTheDocument()
  })
})
