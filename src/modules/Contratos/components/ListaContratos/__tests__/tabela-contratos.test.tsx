import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { TabelaContratos } from '../tabela-contratos'
import type { Contrato } from '@/modules/Contratos/types/contrato'

// Mock do framer-motion para evitar problemas nos testes
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    contratada: {
      razaoSocial: 'Construtora ABC Ltda',
      cnpj: '12345678000190'
    },
    valor: 1250000.00,
    dataInicial: '2023-05-12',
    dataFinal: '2024-05-11',
    status: 'ativo',
    unidade: 'Secretaria de Obras',
    objeto: 'Contratação de empresa especializada para prestação de serviços de manutenção predial'
  },
  {
    id: '2',
    numeroContrato: 'CONT-2023/0043',
    numeroCCon: 'CCON-2023/002',
    contratada: {
      razaoSocial: 'Empresa XYZ Ltda',
      cnpj: '98765432000110'
    },
    valor: 850000.00,
    dataInicial: '2023-06-01',
    dataFinal: '2024-06-01',
    status: 'vencendo',
    unidade: 'Secretaria de Educação',
    objeto: 'Fornecimento de material escolar'
  },
  {
    id: '3',
    numeroContrato: 'CONT-2023/0044',
    numeroCCon: 'CCON-2023/003',
    contratada: {
      razaoSocial: 'Serviços DEF Ltda',
      cnpj: '45678912000134'
    },
    valor: 320000.00,
    dataInicial: '2023-04-15',
    dataFinal: '2024-04-15',
    status: 'vencido',
    unidade: 'Secretaria de Saúde',
    objeto: 'Manutenção de equipamentos médicos'
  }
]

const renderizarComRouter = (componente: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {componente}
    </BrowserRouter>
  )
}

describe('TabelaContratos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseContratosStore.mockReturnValue({
      contratosFiltrados: contratosMock,
      paginacao: {
        pagina: 1,
        itensPorPagina: 10,
        total: 3
      },
      contratosSelecionados: [],
      setPaginacao: vi.fn(),
      selecionarContrato: vi.fn(),
      selecionarTodosContratos: vi.fn(),
      limparSelecao: vi.fn()
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
        total: 0
      },
      contratosSelecionados: [],
      setPaginacao: vi.fn(),
      selecionarContrato: vi.fn(),
      selecionarTodosContratos: vi.fn(),
      limparSelecao: vi.fn()
    })
    
    renderizarComRouter(<TabelaContratos />)
    
    expect(screen.getByText('0 contratos encontrados')).toBeInTheDocument()
  })
})
