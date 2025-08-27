import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegistroAlteracoes } from '../registro-alteracoes'
import type { AlteracaoContrato } from '@/modules/Contratos/types/contrato'
import type { TimelineEntry } from '@/modules/Contratos/types/timeline'

// Mock framer-motion para simplificar testes
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const mockAlteracoes: AlteracaoContrato[] = [
  {
    id: '1',
    tipo: 'criacao',
    descricao: 'Contrato criado no sistema',
    dataHora: '2024-01-10T09:00:00Z',
    responsavel: 'Sistema'
  },
  {
    id: '2',
    tipo: 'alteracao_valor',
    descricao: 'Alteração de valor contratual aprovada',
    dataHora: '2024-01-15T14:30:00Z',
    responsavel: 'João Silva'
  }
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
      tipo: 'gestor'
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
      statusAlteracao: 'aprovada'
    },
    tags: ['quantidade', 'aprovada'],
    criadoEm: '2024-01-20T10:00:00Z'
  }
]

describe('RegistroAlteracoes', () => {
  const mockProps = {
    alteracoes: mockAlteracoes,
    entradasTimeline: mockEntradasTimeline,
    onAdicionarObservacao: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização inicial', () => {
    it('deve renderizar título e contador de entradas', () => {
      render(<RegistroAlteracoes {...mockProps} />)
      
      expect(screen.getByText('Registro de Alterações')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('deve renderizar barra de pesquisa e filtro', () => {
      render(<RegistroAlteracoes {...mockProps} />)
      
      expect(screen.getByPlaceholderText('Pesquisar alterações...')).toBeInTheDocument()
      expect(screen.getByText('Todos os tipos')).toBeInTheDocument()
    })

    it('deve renderizar botão de observação quando callback fornecido', () => {
      render(<RegistroAlteracoes {...mockProps} />)
      
      expect(screen.getByRole('button', { name: /observação/i })).toBeInTheDocument()
    })
  })

  describe('Exibição de entradas', () => {
    it('deve mostrar entradas unificadas ordenadas por data', () => {
      render(<RegistroAlteracoes {...mockProps} />)
      
      expect(screen.getByText('Aditivo de Quantidade - Acréscimo 15%')).toBeInTheDocument()
      expect(screen.getAllByText('Alteração de Valor')[0]).toBeInTheDocument() // Primeira ocorrência (timeline principal)
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
        expect(screen.getByText('Aditivo de Quantidade - Acréscimo 15%')).toBeInTheDocument()
        expect(screen.queryByText('Criação do Contrato')).not.toBeInTheDocument()
      })
    })

    it('deve mostrar mensagem quando nenhuma entrada é encontrada', async () => {
      render(<RegistroAlteracoes {...mockProps} />)
      
      const searchInput = screen.getByPlaceholderText('Pesquisar alterações...')
      fireEvent.change(searchInput, { target: { value: 'inexistente' } })

      await waitFor(() => {
        expect(screen.getByText('Nenhuma alteração encontrada')).toBeInTheDocument()
      })
    })
  })

  describe('Estados edge case', () => {
    it('deve renderizar corretamente sem entradas da timeline', () => {
      const propsVazias = {
        ...mockProps,
        entradasTimeline: []
      }
      
      render(<RegistroAlteracoes {...propsVazias} />)
      
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getAllByText('Criação do Contrato')[0]).toBeInTheDocument() // Primeira ocorrência (timeline principal)
    })

    it('deve mostrar mensagem de vazio quando não há alterações', () => {
      const propsSemDados = {
        ...mockProps,
        alteracoes: [],
        entradasTimeline: []
      }
      
      render(<RegistroAlteracoes {...propsSemDados} />)
      
      expect(screen.getByText('Nenhuma alteração registrada')).toBeInTheDocument()
    })

    it('deve funcionar sem callbacks opcionais', () => {
      const propsSemCallbacks = {
        alteracoes: mockAlteracoes,
        entradasTimeline: mockEntradasTimeline
      }
      
      expect(() => {
        render(<RegistroAlteracoes {...propsSemCallbacks} />)
      }).not.toThrow()
      
      expect(screen.queryByRole('button', { name: /observação/i })).not.toBeInTheDocument()
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