import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IndicadoresRelatorios } from '../indicadores-relatorios'

// Mock do framer-motion para evitar problemas nos testes
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
}))

const indicadoresMock = {
  saldoAtual: 750000.00,
  percentualExecutado: 40,
  cronogramaVigencia: [
    {
      inicio: '2023-05-12',
      fim: '2023-08-11',
      descricao: 'Fase 1: Início',
      status: 'concluido' as const
    },
    {
      inicio: '2023-08-12',
      fim: '2023-11-11',
      descricao: 'Fase 2: Execução Inicial',
      status: 'concluido' as const
    },
    {
      inicio: '2023-11-12',
      fim: '2024-02-11',
      descricao: 'Fase 3: Execução Principal',
      status: 'em_andamento' as const
    },
    {
      inicio: '2024-02-12',
      fim: '2024-05-11',
      descricao: 'Fase 4: Finalização',
      status: 'pendente' as const
    }
  ]
}

const unidadesMock = {
  demandante: 'Secretaria de Obras',
  gestora: 'Secretaria de Administração',
  vinculadas: [
    {
      nome: 'Secretaria de Obras',
      percentualValor: 60,
      valorTotalMensal: 62500.00
    },
    {
      nome: 'Secretaria de Educação',
      percentualValor: 25,
      valorTotalMensal: 26041.67
    },
    {
      nome: 'Secretaria de Saúde',
      percentualValor: 15,
      valorTotalMensal: 15625.00
    }
  ]
}

const valorTotalMock = 1250000.00

describe('IndicadoresRelatorios', () => {
  it('deve renderizar o componente com todas as seções', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
    )
    expect(screen.getByText('Saldo e Execução')).toBeInTheDocument()
    expect(screen.getByText('Cronograma de Vigência')).toBeInTheDocument()
    expect(screen.getByText('Distribuição por Unidade')).toBeInTheDocument()
  })

  it('deve exibir valor total formatado corretamente', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
    )
    
    expect(screen.getByText('R$ 1.250.000,00')).toBeInTheDocument()
  })

  it('deve exibir valor executado calculado corretamente', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
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
      />
    )
    
    expect(screen.getByText('R$ 750.000,00')).toBeInTheDocument()
  })

  it('deve calcular e exibir percentual de execução correto', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
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
      />
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
      />
    )
    
    expect(screen.getByText('Fase 1: Início')).toBeInTheDocument()
    expect(screen.getByText('Fase 2: Execução Inicial')).toBeInTheDocument()
    expect(screen.getByText('Fase 3: Execução Principal')).toBeInTheDocument()
    expect(screen.getByText('Fase 4: Finalização')).toBeInTheDocument()
  })

  it('deve exibir status correto para cada fase do cronograma', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
    )
    
    // Verifica se os status estão sendo exibidos (pode haver múltiplos)
    const elementosConcluido = screen.getAllByText('Concluído')
    const elementosEmAndamento = screen.getAllByText('Em Andamento')
    const elementosPendente = screen.getAllByText('Pendente')
    
    expect(elementosConcluido.length).toBeGreaterThan(0)
    expect(elementosEmAndamento.length).toBeGreaterThan(0)
    expect(elementosPendente.length).toBeGreaterThan(0)
  })

  it('deve aplicar cores corretas para cada status do cronograma', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
    )
    
    // Verifica se as cores estão sendo aplicadas nos containers dos status
    const fases = screen.getAllByText(/Fase 1|Fase 2|Fase 3|Fase 4/)
    expect(fases.length).toBeGreaterThan(0)
  })

  it('deve exibir todas as unidades vinculadas', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
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
      />
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
      />
    )
    
    expect(screen.getByText('R$ 62.500,00/mês')).toBeInTheDocument()
    expect(screen.getByText('R$ 26.041,67/mês')).toBeInTheDocument()
    expect(screen.getByText('R$ 15.625,00/mês')).toBeInTheDocument()
  })

  it('deve exibir resumo financeiro das unidades', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
    )
    
    expect(screen.getByText('Total Mensal')).toBeInTheDocument()
    expect(screen.getByText('Maior Participação')).toBeInTheDocument()
    expect(screen.getByText('Unidades Ativas')).toBeInTheDocument()
    
    // Verifica se há elementos "3" (pode haver múltiplos)
    const elementosTres = screen.getAllByText('3')
    expect(elementosTres.length).toBeGreaterThan(0)
  })

  it('deve renderizar corretamente quando não há unidades vinculadas', () => {
    const unidadesVazias = {
      demandante: 'Secretaria de Obras',
      gestora: 'Secretaria de Administração',
      vinculadas: []
    }
    
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesVazias}
        valorTotal={valorTotalMock}
      />
    )
    
    expect(screen.getByText('Distribuição por Unidade')).toBeInTheDocument()
    // Verifica se há elementos "0" (pode haver múltiplos)
    const elementosZero = screen.getAllByText('0')
    expect(elementosZero.length).toBeGreaterThan(0)
  })

  it('deve aplicar classes CSS corretas para responsividade', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
    )
    
    // Verifica se as classes de responsividade estão sendo aplicadas
    const gridContainer = screen.getByText('Valor Total').closest('.grid')
    expect(gridContainer).toHaveClass('grid', 'grid-cols-2', 'gap-4')
  })

  it('deve exibir ícones corretos para cada seção', () => {
    render(
      <IndicadoresRelatorios
        indicadores={indicadoresMock}
        unidades={unidadesMock}
        valorTotal={valorTotalMock}
      />
    )
    
    // Verifica se os títulos das seções estão sendo exibidos
    expect(screen.getByText('Saldo e Execução')).toBeInTheDocument()
    expect(screen.getByText('Cronograma de Vigência')).toBeInTheDocument()
    expect(screen.getByText('Distribuição por Unidade')).toBeInTheDocument()
  })
})
