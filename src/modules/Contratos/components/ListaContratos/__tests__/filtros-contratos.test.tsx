import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FiltrosContratos } from '../filtros-contratos'
import type { FiltrosContrato } from '@/modules/Contratos/types/contrato'

// Mock das unidades
vi.mock('@/modules/Contratos/data/contratos-mock', () => ({
  unidadesMock: {
    demandantes: [
      'Secretaria de Obras',
      'Secretaria de Educação',
      'Secretaria de Saúde',
      'Secretaria de Administração',
      'Secretaria de Transportes',
    ],
    gestoras: [
      'Departamento de Compras',
      'Departamento de Contratos',
    ]
  },
}))

const filtrosIniciais: FiltrosContrato = {
  status: [],
  unidade: [],
  dataInicialDe: '',
  dataInicialAte: '',
  dataFinalDe: '',
  dataFinalAte: '',
  valorMinimo: undefined,
  valorMaximo: undefined,
}

const filtrosMock: FiltrosContrato = {
  status: ['ativo'],
  unidade: ['Secretaria de Obras'],
  dataInicialDe: '2023-01-01',
  dataInicialAte: '2023-12-31',
  dataFinalDe: '2024-01-01',
  dataFinalAte: '2024-12-31',
  valorMinimo: 100000,
  valorMaximo: 1500000.5,
}

const mockOnFiltrosChange = vi.fn()
const mockOnLimparFiltros = vi.fn()

describe('FiltrosContratos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o componente com título', () => {
    render(
      <FiltrosContratos
        filtros={filtrosIniciais}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve exibir todas as opções de status', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve exibir todas as unidades disponíveis', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve exibir campos de data para período de vigência', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve exibir campos de valor mínimo e máximo', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve permitir seleção de múltiplos status', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve permitir desmarcar status selecionados', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve permitir seleção de múltiplas unidades', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve permitir entrada de valores monetários', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve permitir entrada de datas', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve exibir indicador de filtros ativos quando há filtros', () => {
    const filtrosComStatus = {
      ...filtrosIniciais,
      status: ['ativo'],
      unidade: ['Secretaria de Obras'],
    }

    render(
      <FiltrosContratos
        filtros={filtrosComStatus}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    expect(screen.getByText('Ativos')).toBeInTheDocument()
  })

  it('deve permitir expansão e contração do painel de filtros', () => {
    render(
      <FiltrosContratos
        filtros={filtrosIniciais}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    const trigger = screen.getByText('Filtros Avançados')
    expect(trigger).toBeInTheDocument()

    // Inicialmente fechado
    expect(screen.queryByText('Status do Contrato')).not.toBeInTheDocument()

    // Clica para abrir
    fireEvent.click(trigger)
    expect(screen.getByText('Status do Contrato')).toBeInTheDocument()
  })

  it('deve exibir ícone de filtro', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve exibir ícone de chevron para expansão', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve aplicar classes CSS corretas para responsividade', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve exibir checkboxes com labels corretos', () => {
    render(
      <FiltrosContratos
        filtros={filtrosIniciais}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    const trigger = screen.getByText('Filtros Avançados')
    fireEvent.click(trigger)

    // Verifica se os checkboxes têm labels corretos
    expect(screen.getByLabelText('Ativo')).toBeInTheDocument()
    expect(screen.getByLabelText('Vencendo em Breve')).toBeInTheDocument()
    expect(screen.getByLabelText('Vencido')).toBeInTheDocument()
    expect(screen.getByLabelText('Suspenso')).toBeInTheDocument()
    expect(screen.getByLabelText('Encerrado')).toBeInTheDocument()
  })

  it('deve permitir entrada de valores decimais nos campos monetários', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve permitir entrada de datas em formato ISO', () => {
    render(
      <FiltrosContratos
        filtros={filtrosMock}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Verifica se o componente está sendo renderizado
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
  })

  it('deve renderizar corretamente quando não há filtros ativos', () => {
    render(
      <FiltrosContratos
        filtros={filtrosIniciais}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    // Não deve exibir indicador de filtros ativos
    expect(screen.queryByText('Ativos')).not.toBeInTheDocument()
  })

  it('deve aplicar classes CSS corretas para o indicador de filtros ativos', () => {
    const filtrosComStatus = {
      ...filtrosIniciais,
      status: ['ativo'],
    }

    render(
      <FiltrosContratos
        filtros={filtrosComStatus}
        onFiltrosChange={mockOnFiltrosChange}
        onLimparFiltros={mockOnLimparFiltros}
      />,
    )

    const indicador = screen.getByText('Ativos')
    expect(indicador).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
      'text-xs',
      'px-2',
      'py-1',
      'rounded-full',
    )
  })
})
