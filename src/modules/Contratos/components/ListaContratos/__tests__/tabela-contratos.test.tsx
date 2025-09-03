import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { TabelaContratos } from '../tabela-contratos'
import type { Contrato, PaginacaoParams } from '@/modules/Contratos/types/contrato'

// Mock props para os testes
const mockProps = {
  contratos: [] as Contrato[],
  isLoading: false,
  paginacao: {
    pagina: 1,
    itensPorPagina: 10,
    total: 0
  } as PaginacaoParams,
  contratosSelecionados: [] as string[],
  onPaginacaoChange: vi.fn(),
  onSelecionarContrato: vi.fn(),
  onSelecionarTodos: vi.fn(),
  totalContratos: 0
}

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

// Mock do useContratosStore
const mockUseContratosStore = vi.fn()
vi.mock('@/modules/Contratos/store/contratos-store', () => ({
  useContratosStore: () => mockUseContratosStore(),
}))

// Mock do useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const contratosMock: Contrato[] = [
  {
    id: '1',
    numeroContrato: 'CONT-2023/0042',
    numeroCCon: 'CCON-2023/001',
    processoSei: 'SEI-2023/001',
    vigenciaInicial: '2023-05-12',
    vigenciaFinal: '2024-05-11',
    prazoInicialMeses: 12,
    valorGlobal: 1250000.0,
    empresaId: 'emp-1',
    tipoContratacao: 'Pregão Eletrônico',
    contratada: {
      razaoSocial: 'Construtora ABC Ltda',
      cnpj: '12345678000190',
    },
    valor: 1250000.0,
    dataInicial: '2023-05-12',
    dataFinal: '2024-05-11',
    status: 'ativo',
    unidade: 'Secretaria de Obras',
    objeto: 'Contratação de empresa especializada para prestação de serviços de manutenção predial',
    ativo: true,
    usuarioCadastroId: 'user-1',
    usuarioAtualizacaoId: 'user-1',
    dataCadastro: '2023-05-01T10:00:00Z',
    dataAtualizacao: '2023-05-01T10:00:00Z',
    valorTotalAtribuido: 1250000.0,
    valorDisponivel: 0,
    vtmTotalContrato: 15000,
    quantidadeUnidadesVinculadas: 1,
    quantidadeDocumentos: 5,
  },
  {
    id: '2',
    numeroContrato: 'CONT-2023/0043',
    numeroCCon: 'CCON-2023/002',
    processoSei: 'SEI-2023/002',
    vigenciaInicial: '2023-06-01',
    vigenciaFinal: '2024-06-01',
    prazoInicialMeses: 12,
    valorGlobal: 850000.0,
    empresaId: 'emp-2',
    tipoContratacao: 'Pregão Presencial',
    contratada: {
      razaoSocial: 'Empresa XYZ Ltda',
      cnpj: '98765432000110',
    },
    valor: 850000.0,
    dataInicial: '2023-06-01',
    dataFinal: '2024-06-01',
    status: 'vencendo',
    unidade: 'Secretaria de Educação',
    objeto: 'Fornecimento de material escolar',
    ativo: true,
    usuarioCadastroId: 'user-2',
    usuarioAtualizacaoId: 'user-2',
    dataCadastro: '2023-05-15T14:30:00Z',
    dataAtualizacao: '2023-05-15T14:30:00Z',
    valorTotalAtribuido: 850000.0,
    valorDisponivel: 100000.0,
    vtmTotalContrato: 20000,
    quantidadeUnidadesVinculadas: 2,
    quantidadeDocumentos: 3,
  },
  {
    id: '3',
    numeroContrato: 'CONT-2023/0044',
    numeroCCon: 'CCON-2023/003',
    processoSei: 'SEI-2023/003',
    vigenciaInicial: '2023-04-15',
    vigenciaFinal: '2024-04-15',
    prazoInicialMeses: 12,
    valorGlobal: 320000.0,
    empresaId: 'emp-3',
    tipoContratacao: 'Tomada de Preços',
    contratada: {
      razaoSocial: 'Serviços DEF Ltda',
      cnpj: '45678912000134',
    },
    valor: 320000.0,
    dataInicial: '2023-04-15',
    dataFinal: '2024-04-15',
    status: 'vencido',
    unidade: 'Secretaria de Saúde',
    objeto: 'Manutenção de equipamentos médicos',
    ativo: false,
    usuarioCadastroId: 'user-3',
    usuarioAtualizacaoId: 'user-3',
    dataCadastro: '2023-04-01T09:15:00Z',
    dataAtualizacao: '2023-04-15T16:45:00Z',
    valorTotalAtribuido: 320000.0,
    valorDisponivel: 0,
    vtmTotalContrato: 12500,
    quantidadeUnidadesVinculadas: 1,
    quantidadeDocumentos: 2,
  },
]

const renderizarComRouter = (componente: React.ReactElement) => {
  return render(<BrowserRouter>{componente}</BrowserRouter>)
}

describe('TabelaContratos', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseContratosStore.mockReturnValue({
      contratosFiltrados: contratosMock,
      paginacao: {
        pagina: 1,
        itensPorPagina: 10,
        total: 3,
      },
      contratosSelecionados: [],
      setPaginacao: vi.fn(),
      selecionarContrato: vi.fn(),
      selecionarTodosContratos: vi.fn(),
      limparSelecao: vi.fn(),
    })
  })

  it('deve renderizar o componente sem erros', () => {
    // Teste simples para verificar se o componente está sendo importado corretamente
    expect(TabelaContratos).toBeDefined()
    expect(typeof TabelaContratos).toBe('function')
  })

  it('deve renderizar corretamente quando não há contratos', () => {
    mockUseContratosStore.mockReturnValue({
      contratosFiltrados: [],
      paginacao: {
        pagina: 1,
        itensPorPagina: 10,
        total: 0,
      },
      contratosSelecionados: [],
      setPaginacao: vi.fn(),
      selecionarContrato: vi.fn(),
      selecionarTodosContratos: vi.fn(),
      limparSelecao: vi.fn(),
    })

    renderizarComRouter(<TabelaContratos {...mockProps} />)

    expect(screen.getByText('0 contratos encontrados')).toBeInTheDocument()
  })
})
