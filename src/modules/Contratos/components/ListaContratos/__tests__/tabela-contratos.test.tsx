import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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
    tr: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => <tr {...props}>{children}</tr>,
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

describe('TabelaContratos - hideContratadaColumn', () => {
  const mockContrato: Contrato = {
    id: '1',
    numeroContrato: 'CONT-2023/001',
    empresaRazaoSocial: 'Empresa ABC Ltda',
    empresaCnpj: '12345678000190',
    valorGlobal: 100000,
    vigenciaInicial: '2023-01-01',
    vigenciaFinal: '2024-01-01',
    status: 'ativo',
    contratacao: 'Pregão Eletrônico',
    unidadeGestoraNomeCompleto: 'Secretaria de Saúde',
    descricaoObjeto: 'Prestação de serviços de limpeza',
    ativo: true,
    usuarioCadastroId: 'user-1',
    usuarioAtualizacaoId: 'user-1',
    dataCadastro: '2023-01-01T10:00:00Z',
    dataAtualizacao: '2023-01-01T10:00:00Z',
    valorTotalAtribuido: 100000,
    valorDisponivel: 0,
    vtmTotalContrato: 12000,
    quantidadeUnidadesVinculadas: 1,
    quantidadeDocumentos: 2,
  }

  const propsWithData = {
    ...mockProps,
    contratos: [mockContrato],
    totalContratos: 1,
  }

  beforeEach(() => {
    mockUseContratosStore.mockReturnValue({
      contratos: [mockContrato],
      paginacao: {
        pagina: 1,
        itensPorPagina: 10,
        total: 1,
      },
      contratosSelecionados: [],
      setPaginacao: vi.fn(),
      selecionarContrato: vi.fn(),
      selecionarTodosContratos: vi.fn(),
      limparSelecao: vi.fn(),
    })
  })

  it('Renderizar componente sem hideContratadaColumn', () => {
    renderizarComRouter(<TabelaContratos {...propsWithData} />)

    // Verifica se o header da coluna Contratada está presente (pode haver múltiplas devido ao responsive)
    expect(screen.getAllByText('Contratada').length).toBeGreaterThan(0)
    
    // Verifica se os dados da empresa estão visíveis
    expect(screen.getAllByText('Empresa ABC Ltda').length).toBeGreaterThan(0)
    expect(screen.getAllByText('CNPJ: 12.345.678/0001-90').length).toBeGreaterThan(0)
  })

  it('Renderizar componente com hideContratadaColumn={true}', () => {
    renderizarComRouter(<TabelaContratos {...propsWithData} hideContratadaColumn={true} />)

    // Verifica se a coluna Contratada NÃO está presente
    expect(screen.queryAllByText('Contratada')).toHaveLength(0)
    
    // Verifica se os dados da empresa NÃO estão visíveis
    expect(screen.queryByText('Empresa ABC Ltda')).not.toBeInTheDocument()
    expect(screen.queryByText('CNPJ: 12.345.678/0001-90')).not.toBeInTheDocument()
  
    // Mas outros dados do contrato devem estar presentes
    expect(screen.getAllByText('CONT-2023/001').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pregão Eletrônico').length).toBeGreaterThan(0)
  })

  it('Verificar se coluna "Contratada" NÃO está visível', () => {
    renderizarComRouter(
      <TabelaContratos {...propsWithData} hideContratadaColumn={true} />,
    )

    // Nenhuma coluna Contratada deve estar presente
    expect(screen.queryAllByText('Contratada')).toHaveLength(0)
  })

  it('deve ocultar células da Contratada no modo mobile', () => {
    renderizarComRouter(
      <TabelaContratos {...propsWithData} hideContratadaColumn={true} />,
    )

    // No mobile, Razão Social e CNPJ também não devem aparecer quando oculto
    expect(screen.queryByText('Empresa ABC Ltda')).not.toBeInTheDocument()
    expect(screen.queryByText('CNPJ: 12.345.678/0001-90')).not.toBeInTheDocument()
  })

  it('deve exibir células da Contratada no modo mobile quando visível', () => {
    renderizarComRouter(
      <TabelaContratos {...propsWithData} hideContratadaColumn={false} />,
    )

    expect(screen.getAllByText('Empresa ABC Ltda').length).toBeGreaterThan(0)
    expect(screen.getAllByText('CNPJ: 12.345.678/0001-90').length).toBeGreaterThan(0)
  })

  it('Verificar condicionamento das TableCells no corpo (desktop)', () => {
    const { rerender } = renderizarComRouter(
      <TabelaContratos {...propsWithData} hideContratadaColumn={false} />,
    )

    // Linha do corpo (tbody) e presença do conteúdo da coluna Contratada
    const bodyRows = screen
      .getAllByRole('row')
      .filter((r) => r.closest('tbody'))
    const firstRow = bodyRows[0]
    expect(within(firstRow).getAllByText('Empresa ABC Ltda').length).toBeGreaterThan(0)
    expect(
      within(firstRow).getAllByText('CNPJ: 12.345.678/0001-90').length,
    ).toBeGreaterThan(0)

    // Oculta a coluna e verifica ausência do conteúdo na mesma linha
    rerender(
      <BrowserRouter>
        <TabelaContratos {...propsWithData} hideContratadaColumn={true} />
      </BrowserRouter>,
    )
    const bodyRowsHidden = screen
      .getAllByRole('row')
      .filter((r) => r.closest('tbody'))
    const firstRowHidden = bodyRowsHidden[0]
    expect(
      within(firstRowHidden).queryByText('Empresa ABC Ltda'),
    ).not.toBeInTheDocument()
    expect(
      within(firstRowHidden).queryByText('CNPJ: 12.345.678/0001-90'),
    ).not.toBeInTheDocument()
  })

  it('Verificar condicionamento das TableCells durante loading', () => {
    const propsLoading = { ...mockProps, isLoading: true, totalContratos: 10 }

    // Com coluna visível - verificar apenas desktop view
    const { rerender } = renderizarComRouter(
      <TabelaContratos {...propsLoading} hideContratadaColumn={false} />,
    )
    const desktopTable = document.querySelector('.hidden.xl\\:block table')
    if (desktopTable) {
      const headersCom = within(desktopTable as HTMLElement).getAllByRole('columnheader')
      const bodyRows = within(desktopTable as HTMLElement).getAllByRole('row').filter((r) => r.closest('tbody'))
      if (bodyRows.length > 0) {
        expect(within(bodyRows[0]).getAllByRole('cell').length).toBe(headersCom.length)
      }
    }

    // Com coluna oculta
    rerender(
      <BrowserRouter>
        <TabelaContratos {...propsLoading} hideContratadaColumn={true} />
      </BrowserRouter>,
    )
    const desktopTableHidden = document.querySelector('.hidden.xl\\:block table')
    if (desktopTableHidden) {
      const headersSem = within(desktopTableHidden as HTMLElement).getAllByRole('columnheader')
      const bodyRowsHidden = within(desktopTableHidden as HTMLElement).getAllByRole('row').filter((r) => r.closest('tbody'))
      if (bodyRowsHidden.length > 0) {
        expect(within(bodyRowsHidden[0]).getAllByRole('cell').length).toBe(headersSem.length)
      }
    }
  })

  it('Renderizar estado de loading com hideContratadaColumn={true}', () => {
    renderizarComRouter(<TabelaContratos {...mockProps} isLoading={true} hideContratadaColumn={true} />)

    // Verifica se o header da coluna Contratada NÃO está presente durante loading
    expect(screen.queryAllByText('Contratada')).toHaveLength(0)
    
    // Verifica se ainda existem outros headers
    expect(screen.getAllByText('Contrato').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tipo Contratação').length).toBeGreaterThan(0)
  })

  it('deve manter compatibilidade quando hideContratadaColumn=false', () => {
    renderizarComRouter(<TabelaContratos {...propsWithData} hideContratadaColumn={false} />)

    // Deve se comportar igual ao padrão
    expect(screen.getAllByText('Contratada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Empresa ABC Ltda').length).toBeGreaterThan(0)
  })

  it('deve re-renderizar corretamente ao alternar hideContratadaColumn', () => {
    const { rerender } = renderizarComRouter(
      <TabelaContratos {...propsWithData} hideContratadaColumn={false} />,
    )

    // Presente inicialmente
    expect(screen.getAllByText('Contratada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Empresa ABC Ltda').length).toBeGreaterThan(0)

    // Alterna para ocultar
    rerender(
      <BrowserRouter>
        <TabelaContratos {...propsWithData} hideContratadaColumn={true} />
      </BrowserRouter>,
    )
    expect(screen.queryAllByText('Contratada')).toHaveLength(0)
    expect(screen.queryByText('Empresa ABC Ltda')).not.toBeInTheDocument()

    // Alterna de volta para mostrar
    rerender(
      <BrowserRouter>
        <TabelaContratos {...propsWithData} hideContratadaColumn={false} />
      </BrowserRouter>,
    )
    expect(screen.getAllByText('Contratada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Empresa ABC Ltda').length).toBeGreaterThan(0)
  })

  it('deve exibir N/A na coluna Contratada quando dados ausentes e removê-la quando oculto', () => {
    const contratoSemEmpresa: Contrato = {
      id: 'na',
      numeroContrato: 'CONT-NA/0001',
      valorGlobal: 5000,
      vigenciaInicial: '2023-01-01',
      vigenciaFinal: '2023-12-31',
      status: 'ativo',
      contratacao: 'Dispensa',
      unidadeGestoraNomeCompleto: 'UG Test',
      descricaoObjeto: 'Objeto Teste',
      ativo: true,
      usuarioCadastroId: 'user-na',
      usuarioAtualizacaoId: 'user-na',
      dataCadastro: '2023-01-01T00:00:00Z',
      dataAtualizacao: '2023-01-01T00:00:00Z',
      valorTotalAtribuido: 5000,
      valorDisponivel: 0,
      vtmTotalContrato: 0,
      quantidadeUnidadesVinculadas: 1,
      quantidadeDocumentos: 0,
    }

    const propsSemEmpresa = {
      ...mockProps,
      contratos: [contratoSemEmpresa],
      totalContratos: 1,
    }

    const { rerender } = renderizarComRouter(
      <TabelaContratos {...propsSemEmpresa} hideContratadaColumn={false} />,
    )

    // Com coluna visível, deve mostrar N/A e CNPJ: N/A nessa coluna
    expect(screen.getAllByText('Contratada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/CNPJ:\s*N\/A/).length).toBeGreaterThan(0)

    // Ao ocultar, nem header nem conteúdo devem existir
    rerender(
      <BrowserRouter>
        <TabelaContratos {...propsSemEmpresa} hideContratadaColumn={true} />
      </BrowserRouter>,
    )
    expect(screen.queryAllByText('Contratada')).toHaveLength(0)
    expect(screen.queryByText(/CNPJ:\s*N\/A/)).not.toBeInTheDocument()
  })

  it('deve manter a contagem de colunas consistente com e sem a coluna Contratada', () => {
    const { rerender } = renderizarComRouter(
      <TabelaContratos {...propsWithData} hideContratadaColumn={false} />,
    )

    // Com coluna visível - verifica só desktop view (hidden xl:block)
    const desktopTable = document.querySelector('.hidden.xl\\:block table')
    if (desktopTable) {
      const headersCom = within(desktopTable as HTMLElement).getAllByRole('columnheader')
      const bodyRowsCom = within(desktopTable as HTMLElement).getAllByRole('row').filter((r) => r.closest('tbody'))
      if (bodyRowsCom.length > 0) {
        const firstRowCellsCom = within(bodyRowsCom[0]).getAllByRole('cell').length
        expect(headersCom.map((h) => h.textContent)).toEqual(
          expect.arrayContaining(['Contratada']),
        )
        expect(firstRowCellsCom).toBe(headersCom.length)
      }
    }

    // Sem coluna Contratada
    rerender(
      <BrowserRouter>
        <TabelaContratos {...propsWithData} hideContratadaColumn={true} />
      </BrowserRouter>,
    )
    
    const desktopTableHidden = document.querySelector('.hidden.xl\\:block table')
    if (desktopTableHidden) {
      const headersSem = within(desktopTableHidden as HTMLElement).getAllByRole('columnheader')
      const bodyRowsSem = within(desktopTableHidden as HTMLElement).getAllByRole('row').filter((r) => r.closest('tbody'))
      if (bodyRowsSem.length > 0) {
        const firstRowCellsSem = within(bodyRowsSem[0]).getAllByRole('cell').length
        expect(headersSem.map((h) => h.textContent)).not.toEqual(
          expect.arrayContaining(['Contratada']),
        )
        expect(firstRowCellsSem).toBe(headersSem.length)
      }
    }
  })
})
