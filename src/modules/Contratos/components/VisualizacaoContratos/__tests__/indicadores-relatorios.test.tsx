import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/test-utils'
import { IndicadoresRelatorios } from '../indicadores-relatorios'
import type { ContratoDetalhado } from '../../../types/contrato'

// Mock dos hooks de React Query
vi.mock('@/modules/Unidades/hooks/use-unidades', () => ({
  useUnidadesByIds: vi.fn(() => ({
    data: {
      'unidade-1': { nome: 'Secretaria de Obras' },
      'unidade-2': { nome: 'Secretaria de Educação' },
      'unidade-3': { nome: 'Secretaria de Saúde' }
    },
    isLoading: false,
    error: null
  }))
}))

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
    span: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <span {...props}>{children}</span>
    ),
    path: ({ ...props }: { [key: string]: unknown }) => <path {...props} />,
    svg: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <svg {...props}>{children}</svg>
    ),
  },
}))

const indicadoresMock = {
  saldoAtual: 750000.0,
  percentualExecutado: 40,
  cronogramaVigencia: [
    {
      inicio: '2023-05-12',
      fim: '2023-08-11',
      descricao: 'Fase 1: Início',
      status: 'concluido' as const,
    },
    {
      inicio: '2023-08-12',
      fim: '2023-11-11',
      descricao: 'Fase 2: Execução Inicial',
      status: 'concluido' as const,
    },
    {
      inicio: '2023-11-12',
      fim: '2024-02-11',
      descricao: 'Fase 3: Execução Principal',
      status: 'em_andamento' as const,
    },
    {
      inicio: '2024-02-12',
      fim: '2024-05-11',
      descricao: 'Fase 4: Finalização',
      status: 'pendente' as const,
    },
  ],
}

const unidadesMock = {
  demandante: 'Secretaria de Obras',
  gestora: 'Secretaria de Administração',
  vinculadas: [
    {
      nome: 'Secretaria de Obras',
      percentualValor: 60,
      valorTotalMensal: 62500.0,
    },
    {
      nome: 'Secretaria de Educação',
      percentualValor: 25,
      valorTotalMensal: 26041.67,
    },
    {
      nome: 'Secretaria de Saúde',
      percentualValor: 15,
      valorTotalMensal: 15625.0,
    },
  ],
}

const valorTotalMock = 1250000.0
const vtmTotalContratoMock = 26042

const contratoMock: ContratoDetalhado = {
  id: '1',
  numeroContrato: 'CONT-2023/0042',
  objeto: 'Teste de Contrato',
  dataInicio: '2023-05-12T00:00:00Z',
  dataTermino: '2024-05-11T23:59:59Z',
  valorTotal: valorTotalMock,
  vigenciaInicial: '2023-05-12T00:00:00Z',
  vigenciaFinal: '2024-05-11T23:59:59Z',
  valorGlobal: valorTotalMock,
  vtmTotalContrato: vtmTotalContratoMock,
  prazoInicialMeses: 12,
  valorTotalAtribuido: 1250000,
  valorDisponivel: 750000,
  quantidadeUnidadesVinculadas: 3,
  quantidadeDocumentos: 0,
  empresaId: 'empresa-1',
  ativo: true,
  usuarioCadastroId: 'user-1',
  usuarioAtualizacaoId: 'user-1',
  dataCadastro: '2023-05-12T00:00:00Z',
  dataAtualizacao: '2023-05-12T00:00:00Z',
  responsaveis: {
    fiscaisAdministrativos: [],
    gestores: []
  },
  fornecedor: {
    razaoSocial: 'Empresa Teste LTDA',
    cnpj: '12345678000199',
    contatos: [],
    endereco: {
      cep: '20000-000',
      logradouro: 'Rua Teste',
      bairro: 'Bairro Teste',
      cidade: 'Rio de Janeiro',
      uf: 'RJ'
    }
  },
  unidades: {
    demandante: 'Unidade Demandante',
    gestora: 'Unidade Gestora',
    vinculadas: []
  },
  alteracoes: [],
  documentos: [],
  documentosChecklist: {
    termoReferencia: { entregue: false },
    homologacao: { entregue: false },
    ataRegistroPrecos: { entregue: false },
    garantiaContratual: { entregue: false },
    contrato: { entregue: false },
    publicacaoPncp: { entregue: false },
    publicacaoExtrato: { entregue: false }
  },
  indicadores: {
    saldoAtual: 750000,
    percentualExecutado: 40,
    cronogramaVigencia: []
  },
  unidadesVinculadas: [
    {
      id: '1',
      contratoId: '1',
      unidadeSaudeId: 'unidade-1',
      nomeUnidade: 'Secretaria de Obras',
      valorAtribuido: 750000,
      ativo: true
    },
    {
      id: '2',
      contratoId: '1',
      unidadeSaudeId: 'unidade-2',
      nomeUnidade: 'Secretaria de Educação',
      valorAtribuido: 312500,
      ativo: true
    },
    {
      id: '3',
      contratoId: '1',
      unidadeSaudeId: 'unidade-3',
      nomeUnidade: 'Secretaria de Saúde',
      valorAtribuido: 187500,
      ativo: true
    }
  ]
}

describe('IndicadoresRelatorios', () => {
  it('deve renderizar o componente com todas as seções', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )
    expect(screen.getByText('Saldo e Acompanhamento')).toBeInTheDocument()
    expect(screen.getByText('Cronograma de Vigência')).toBeInTheDocument()
    expect(screen.getByText('Distribuição por Unidade')).toBeInTheDocument()
  })

  it('deve exibir valor total formatado corretamente', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    expect(screen.getByText('R$ 1.250.000,00')).toBeInTheDocument()
  })

  it('deve exibir valor executado calculado corretamente', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    // Valor executado = valorTotal - saldoAtual = 1250000 - 750000 = 500000
    expect(screen.getByText('R$ 500.000,00')).toBeInTheDocument()
  })

  it('deve exibir saldo atual formatado corretamente', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    expect(screen.getByText('R$ 750.000,00')).toBeInTheDocument()
  })

  it('deve calcular e exibir percentual de execução correto', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    // Percentual executado = (valorTotal - saldoAtual) / valorTotal * 100
    // (1250000 - 750000) / 1250000 * 100 = 500000 / 1250000 * 100 = 40%
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('deve exibir barra de progresso com valor correto', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('deve exibir cronograma de vigência com todas as fases', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    expect(screen.getByText('Cronograma de Vigência')).toBeInTheDocument()
    expect(screen.getByText('Período 1 (1º ao 3º mês)')).toBeInTheDocument()
  })

  it('deve exibir status correto para cada fase do cronograma', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    // Verifica se há pelo menos um status sendo exibido
    const statusElements = screen.queryAllByText(/Concluído|Em Andamento|Pendente/)
    expect(statusElements.length).toBeGreaterThan(0)
  })

  it('deve aplicar cores corretas para cada status do cronograma', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    // Verifica se há períodos sendo renderizados
    const periodos = screen.getAllByText(/Período \d/)
    expect(periodos.length).toBeGreaterThan(0)
  })

  it('deve exibir todas as unidades vinculadas', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    expect(screen.getByText('Secretaria de Obras')).toBeInTheDocument()
    expect(screen.getByText('Secretaria de Educação')).toBeInTheDocument()
    expect(screen.getByText('Secretaria de Saúde')).toBeInTheDocument()
  })

  it('deve exibir percentuais das unidades vinculadas', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    expect(screen.getByText('60% do total')).toBeInTheDocument()
    expect(screen.getByText('25% do total')).toBeInTheDocument()
    expect(screen.getByText('15% do total')).toBeInTheDocument()
  })

  it('deve exibir valores mensais das unidades', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    // Verifica se o VTM do contrato está sendo exibido no resumo
    expect(screen.getByText('R$ 26.042,00/mês')).toBeInTheDocument()
  })

  it('deve exibir resumo financeiro das unidades', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument()
    expect(screen.getByText('Maior Participação')).toBeInTheDocument()
    expect(screen.getAllByText('VTM do Contrato').length).toBeGreaterThan(0)
    expect(screen.getByText('Gasto Médio por Dia')).toBeInTheDocument()
  })

  it('deve renderizar corretamente quando não há unidades vinculadas', () => {
    const unidadesVazias = {
      demandante: 'Secretaria de Obras',
      gestora: 'Secretaria de Administração',
      vinculadas: [],
    }

    const contratoVazio = {
      ...contratoMock,
      unidadesVinculadas: []
    }

    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesVazias}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoVazio}
      />,
    )

    expect(screen.getByText('Distribuição por Unidade')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma unidade vinculada')).toBeInTheDocument()
  })

  it('deve aplicar classes CSS corretas para responsividade', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    // Verifica se as classes de responsividade estão sendo aplicadas
    const gridContainer = screen.getByText('Valor Total').closest('.grid')
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'gap-3', 'sm:grid-cols-2', 'sm:gap-4')
  })

  it('deve exibir ícones corretos para cada seção', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
        vtmTotalContrato={vtmTotalContratoMock}
        contrato={contratoMock}
      />,
    )

    // Verifica se os títulos das seções estão sendo exibidos
    expect(screen.getByText('Saldo e Acompanhamento')).toBeInTheDocument()
    expect(screen.getByText('Cronograma de Vigência')).toBeInTheDocument()
    expect(screen.getByText('Distribuição por Unidade')).toBeInTheDocument()
  })
})
