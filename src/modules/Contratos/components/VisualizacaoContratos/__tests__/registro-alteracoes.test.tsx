import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { AlteracaoContrato } from '@/modules/Contratos/types/contrato'
import type { TimelineEntry } from '@/modules/Contratos/types/timeline'
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils'

import { RegistroAlteracoes } from '../registro-alteracoes'

// Mock dos hooks de React Query
vi.mock('@/modules/Empresas/hooks/use-empresas', () => ({
  useEmpresasByIds: vi.fn(() => ({
    data: {},
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/modules/Unidades/hooks/use-unidades-batch', () => ({
  useUnidadesBatch: vi.fn(() => ({
    data: {},
    isLoading: false,
    error: null,
    getNome: vi.fn((id) => `Mock Unidade ${id}`),
  })),
}))

vi.mock('@/modules/Unidades/hooks/use-unidades', () => ({
  useUnidadesByIds: vi.fn(() => ({
    data: {
      'unidade-1': { nome: 'Mock Unidade 1' },
      'unidade-2': { nome: 'Mock Unidade 2' },
      'unidade-3': { nome: 'Mock Unidade 3' },
    },
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/modules/Contratos/hooks/use-historico-funcionarios', () => ({
  useHistoricoFuncionarios: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

// Mock framer-motion para simplificar testes
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

const mockAlteracoes: AlteracaoContrato[] = [
  {
    id: '1',
    tipo: 'criacao',
    descricao: 'Contrato criado no sistema',
    dataHora: '2024-01-10T09:00:00Z',
    responsavel: 'Sistema',
  },
  {
    id: '2',
    tipo: 'alteracao_valor',
    descricao: 'Aditivo de quantidade aprovado', // Corrigido para refletir o tipo correto
    dataHora: '2024-01-15T14:30:00Z',
    responsavel: 'João Silva',
  },
]

const mockEntradasTimeline: TimelineEntry[] = [
  {
    id: 'timeline-1',
    contratoId: 'contrato-123',
    tipo: 'alteracao_contratual',
    categoria: 'alteracao',
    titulo: 'Aditivo de Quantidade - Acréscimo 15%',
    descricao: 'Necessário acréscimo devido a demanda adicional',
    dataEvento: '2024-01-20T10:00:00Z',
    autor: {
      id: 'user-1',
      nome: 'Maria Santos',
      tipo: 'gestor',
    },
    status: 'ativo',
    prioridade: 'alta',
    alteracaoContratual: {
      alteracaoId: 'alt-1',
      tipoAditivo: 'Aditivo - Quantidade',
      valorOriginal: 100000,
      valorNovo: 115000,
      diferenca: 15000,
      percentualDiferenca: 15,
      novaVigencia: '2024-12-31',
      statusAlteracao: 'aprovada',
    },
    tags: ['quantidade', 'aprovada'],
    criadoEm: '2024-01-20T10:00:00Z',
  },
]

describe('RegistroAlteracoes', () => {
  const mockProps = {
    contratoId: 'test-contract-id',
    alteracoes: mockAlteracoes,
    entradasTimeline: mockEntradasTimeline,
    onAdicionarObservacao: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização inicial', () => {
    it('deve renderizar título e contador de entradas', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(screen.getByText('Registro de Alterações')).toBeInTheDocument()
      // Buscar especificamente pelo badge que tem o número 3
      const badges = screen.getAllByText('3')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('deve renderizar barra de pesquisa e filtro', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(
        screen.getByPlaceholderText('Pesquisar alterações...'),
      ).toBeInTheDocument()
      expect(screen.getByText('Todos os tipos')).toBeInTheDocument()
    })

    it('deve renderizar botão de observação quando callback fornecido', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(
        screen.getByRole('button', { name: /observação/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Exibição de entradas', () => {
    it('deve mostrar entradas unificadas ordenadas por data', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(
        screen.getByText('Aditivo de Quantidade - Acréscimo 15%'),
      ).toBeInTheDocument()
      expect(
        screen.getAllByText('Aditivo de Quantidade')[0],
      ).toBeInTheDocument() // Primeira ocorrência (timeline principal) - corrigido
      expect(screen.getAllByText('Criação do Contrato')[0]).toBeInTheDocument() // Primeira ocorrência (timeline principal)
    })

    it('deve exibir dados financeiros para alterações contratuais', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(screen.getByText('R$ 100.000,00')).toBeInTheDocument()
      expect(screen.getByText('R$ 115.000,00')).toBeInTheDocument()
      expect(screen.getByText('+R$ 15.000,00')).toBeInTheDocument()
    })

    it('deve mostrar badges de origem e prioridade', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(screen.getByText('Alteração')).toBeInTheDocument()
      expect(screen.getByText('alta')).toBeInTheDocument()
    })

    it('deve exibir tags quando disponíveis', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(screen.getByText('quantidade')).toBeInTheDocument()
      expect(screen.getByText('aprovada')).toBeInTheDocument()
    })
  })

  describe('Filtros e pesquisa', () => {
    it('deve filtrar entradas por termo de pesquisa', async () => {
      render(<RegistroAlteracoes {...mockProps} />)

      const searchInput = screen.getByPlaceholderText('Pesquisar alterações...')
      fireEvent.change(searchInput, { target: { value: 'Quantidade' } })

      await waitFor(() => {
        expect(
          screen.getByText('Aditivo de Quantidade - Acréscimo 15%'),
        ).toBeInTheDocument()
        expect(
          screen.queryByText('Criação do Contrato'),
        ).not.toBeInTheDocument()
      })
    })

    it('deve mostrar mensagem quando nenhuma entrada é encontrada', async () => {
      render(<RegistroAlteracoes {...mockProps} />)

      const searchInput = screen.getByPlaceholderText('Pesquisar alterações...')
      fireEvent.change(searchInput, { target: { value: 'inexistente' } })

      await waitFor(() => {
        expect(
          screen.getByText('Nenhuma alteração encontrada'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Estados edge case', () => {
    it('deve renderizar corretamente sem entradas da timeline', () => {
      const propsVazias = {
        ...mockProps,
        entradasTimeline: [],
      }

      render(<RegistroAlteracoes {...propsVazias} />)

      // Verificar que há pelo menos um badge com '2'
      const badges = screen.getAllByText('2')
      expect(badges.length).toBeGreaterThan(0)
      expect(screen.getAllByText('Criação do Contrato')[0]).toBeInTheDocument() // Primeira ocorrência (timeline principal)
    })

    it('deve mostrar mensagem de vazio quando não há alterações', () => {
      const propsSemDados = {
        ...mockProps,
        alteracoes: [],
        entradasTimeline: [],
      }

      render(<RegistroAlteracoes {...propsSemDados} />)

      expect(
        screen.getByText('Nenhuma alteração registrada'),
      ).toBeInTheDocument()
    })

    it('deve funcionar sem callbacks opcionais', () => {
      const propsSemCallbacks = {
        alteracoes: mockAlteracoes,
        entradasTimeline: mockEntradasTimeline,
      }

      expect(() => {
        render(<RegistroAlteracoes {...propsSemCallbacks} />)
      }).not.toThrow()

      expect(
        screen.queryByRole('button', { name: /observação/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('deve chamar onAdicionarObservacao quando botão clicado', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      fireEvent.click(screen.getByRole('button', { name: /observação/i }))

      expect(mockProps.onAdicionarObservacao).toHaveBeenCalledTimes(1)
    })
  })

  describe('Resumo por tipo', () => {
    it('deve exibir seção de resumo com estatísticas', () => {
      render(<RegistroAlteracoes {...mockProps} />)

      expect(screen.getByText('Resumo por Tipo')).toBeInTheDocument()

      const registrosText = screen.getAllByText(/\d+ registros?/)
      expect(registrosText.length).toBeGreaterThan(0)
    })
  })
})
