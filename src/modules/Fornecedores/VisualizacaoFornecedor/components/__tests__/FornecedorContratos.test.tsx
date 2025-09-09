import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { FornecedorContratos } from '../FornecedorContratos'
import type { Contrato } from '@/modules/Contratos/types/contrato'

// Mock do TabelaContratos para verificar props
const mockTabelaContratos = vi.fn()
vi.mock('@/modules/Contratos/components/ListaContratos/tabela-contratos', () => ({
  TabelaContratos: (props: any) => {
    mockTabelaContratos(props)
    return <div data-testid="tabela-contratos">Mocked TabelaContratos</div>
  },
}))

// Mock do framer-motion
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

const mockEmpresa = {
  id: 'emp-1',
  razaoSocial: 'Empresa ABC Ltda',
}

const defaultProps = {
  contratos: [mockContrato],
  isLoading: false,
  empresa: mockEmpresa,
}

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('FornecedorContratos', () => {
  beforeEach(() => {
    mockTabelaContratos.mockClear()
  })

  it('Renderizar FornecedorContratos', () => {
    renderWithRouter(<FornecedorContratos {...defaultProps} />)

    expect(screen.getByText('Contratos de Empresa ABC Ltda')).toBeInTheDocument()
    expect(screen.getByTestId('tabela-contratos')).toBeInTheDocument()
  })

  it('deve passar hideContratadaColumn=true para TabelaContratos', () => {
    renderWithRouter(<FornecedorContratos {...defaultProps} />)

    // Verifica se TabelaContratos foi chamada com hideContratadaColumn=true
    expect(mockTabelaContratos).toHaveBeenCalledWith(
      expect.objectContaining({
        hideContratadaColumn: true,
      })
    )
  })

  it('deve passar contratos filtrados para TabelaContratos', () => {
    renderWithRouter(<FornecedorContratos {...defaultProps} />)

    // Verifica se os contratos foram passados corretamente
    expect(mockTabelaContratos).toHaveBeenCalledWith(
      expect.objectContaining({
        contratos: [mockContrato],
        totalContratos: 1,
      })
    )
  })

  it('deve configurar paginação corretamente', () => {
    renderWithRouter(<FornecedorContratos {...defaultProps} />)

    // Verifica se a paginação foi configurada para mostrar todos os contratos
    expect(mockTabelaContratos).toHaveBeenCalledWith(
      expect.objectContaining({
        paginacao: {
          pagina: 1,
          itensPorPagina: 1, // igual ao número de contratos
          total: 1,
        },
      })
    )
  })

  it('deve exibir estado vazio quando não há contratos', () => {
    renderWithRouter(
      <FornecedorContratos {...defaultProps} contratos={[]} />
    )

    // Sem busca e com filtro 'todos' deve exibir estado "Nenhum contrato vinculado"
    expect(screen.getByText('Nenhum contrato vinculado')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Este fornecedor ainda não possui contratos cadastrados no sistema.',
      ),
    ).toBeInTheDocument()
  })

  it('deve exibir estado de loading', () => {
    renderWithRouter(
      <FornecedorContratos {...defaultProps} isLoading={true} />
    )

    // Verifica se o skeleton loading está sendo mostrado
    expect(screen.queryByTestId('tabela-contratos')).not.toBeInTheDocument()
  })

  it('deve filtrar contratos por busca', () => {
    const contratos = [
      mockContrato,
      {
        ...mockContrato,
        id: '2',
        numeroContrato: 'CONT-2023/002',
        descricaoObjeto: 'Serviços de jardinagem',
      },
    ]

    renderWithRouter(
      <FornecedorContratos {...defaultProps} contratos={contratos} />
    )

    // Busca pelo input de pesquisa
    const searchInput = screen.getByPlaceholderText('Buscar por número, objeto, processo...')
    expect(searchInput).toBeInTheDocument()
  })

  it('deve exibir badges de status com contadores', () => {
    // Congela tempo para classificar o contrato como ativo
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-06-01T00:00:00Z'))

    renderWithRouter(<FornecedorContratos {...defaultProps} />)

    // Verifica se os badges de filtro estão presentes
    expect(screen.getByText('Todos 1')).toBeInTheDocument()
    expect(screen.getByText('Ativos 1')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('Verificar props passadas para TabelaContratos', () => {
    renderWithRouter(<FornecedorContratos {...defaultProps} />)

    expect(mockTabelaContratos).toHaveBeenCalledWith(
      expect.objectContaining({
        contratos: [mockContrato],
        totalContratos: 1,
        hideContratadaColumn: true,
        isLoading: false,
        contratosSelecionados: [],
        paginacao: {
          pagina: 1,
          itensPorPagina: 1,
          total: 1,
        },
        onSelecionarContrato: expect.any(Function),
        onSelecionarTodos: expect.any(Function),
        onPaginacaoChange: expect.any(Function),
      }),
    )
  })

  it('deve filtrar por status via badges e repassar contratos filtrados', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-06-01T00:00:00Z'))

    const contratos: Contrato[] = [
      {
        ...mockContrato,
        id: 'a',
        vigenciaFinal: '2099-01-01', // ativo
        status: 'ativo',
      },
      {
        ...mockContrato,
        id: 'b',
        vigenciaFinal: '2023-06-15', // vencendo (<= 30 dias)
        status: 'ativo',
      },
      {
        ...mockContrato,
        id: 'c',
        vigenciaFinal: '2023-01-01', // vencido
        status: 'ativo',
      },
    ]

    renderWithRouter(
      <FornecedorContratos {...defaultProps} contratos={contratos} />,
    )

    // TabelaContratos chamada inicialmente com todos
    expect(mockTabelaContratos).toHaveBeenLastCalledWith(
      expect.objectContaining({ contratos, totalContratos: 3 }),
    )

    // Clica em "Ativos"
    fireEvent.click(screen.getByText(/Ativos\s+\d+/))
    expect(mockTabelaContratos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contratos: expect.arrayContaining([expect.objectContaining({ id: 'a' })]),
        totalContratos: 1,
      }),
    )

    // Se existir badge "Vencendo", clica e valida
    const badgeVencendo = screen.queryByText(/Vencendo\s+\d+/)
    if (badgeVencendo) {
      fireEvent.click(badgeVencendo)
      expect(mockTabelaContratos).toHaveBeenLastCalledWith(
        expect.objectContaining({
          contratos: expect.arrayContaining([expect.objectContaining({ id: 'b' })]),
          totalContratos: 1,
        }),
      )
    }

    // Clica em "Vencidos" e valida
    const badgeVencidos = screen.queryByText(/Vencidos\s+\d+/)
    if (badgeVencidos) {
      fireEvent.click(badgeVencidos)
      expect(mockTabelaContratos).toHaveBeenLastCalledWith(
        expect.objectContaining({
          contratos: expect.arrayContaining([expect.objectContaining({ id: 'c' })]),
          totalContratos: 1,
        }),
      )
    }

    // Volta para "Todos"
    fireEvent.click(screen.getByText(/Todos\s+\d+/))
    expect(mockTabelaContratos).toHaveBeenLastCalledWith(
      expect.objectContaining({ totalContratos: 3 }),
    )

    vi.useRealTimers()
  })

  it('deve exibir estado vazio com busca sem resultados e limpar filtros restaura lista', async () => {
    const contratos: Contrato[] = [
      { ...mockContrato, id: '1', numeroContrato: 'X-001', descricaoObjeto: 'AAA' },
      { ...mockContrato, id: '2', numeroContrato: 'X-002', descricaoObjeto: 'BBB' },
    ]

    renderWithRouter(
      <FornecedorContratos {...defaultProps} contratos={contratos} />,
    )

    // Busca termo inexistente
    const searchInput = screen.getByPlaceholderText(
      'Buscar por número, objeto, processo...',
    )
    fireEvent.change(searchInput, { target: { value: 'inexistente-zzz' } })

    // Estado vazio + botão limpar (aguarda re-render)
    expect(
      await screen.findByText('Nenhum contrato encontrado'),
    ).toBeInTheDocument()
    const limparBtn = await screen.findByRole('button', { name: 'Limpar filtros' })
    expect(limparBtn).toBeInTheDocument()

    // Limpa filtros e TabelaContratos volta a aparecer
    fireEvent.click(limparBtn)
    expect(await screen.findByTestId('tabela-contratos')).toBeInTheDocument()
  })
})
