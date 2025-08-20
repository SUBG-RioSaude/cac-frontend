import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTimelineIntegration } from '../useTimelineIntegration'
import type { AlteracaoContratualForm } from '../../types/alteracoes-contratuais'
import type { TimelineEntry } from '../../types/timeline'

describe('useTimelineIntegration', () => {
  const mockContratoId = 'contrato-123'
  const mockOnAdicionarEntrada = vi.fn()
  
  const mockAlteracao: AlteracaoContratualForm = {
    id: 'alteracao-1',
    tipoAditivo: 'quantidade',
    dataSolicitacao: '2024-01-15T10:00:00Z',
    justificativa: 'Necessário acréscimo devido a demanda adicional',
    dataAutorizacao: '2024-01-16T14:00:00Z',
    manifestacaoTecnica: 'Aprovado pelo departamento técnico',
    novaVigencia: '2024-12-31T23:59:59Z',
    valorAjustado: 100000.00,
    status: 'aprovada'
  }

  const mockAutor = {
    id: 'user-1',
    nome: 'João Silva',
    tipo: 'gestor' as const
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('criarEntradaAlteracao', () => {
    it('deve criar entrada da timeline corretamente', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      act(() => {
        result.current.criarEntradaAlteracao(mockAlteracao, mockAutor)
      })

      expect(mockOnAdicionarEntrada).toHaveBeenCalledTimes(1)
      
      const entradaCriada = mockOnAdicionarEntrada.mock.calls[0][0] as TimelineEntry
      
      expect(entradaCriada).toMatchObject({
        contratoId: mockContratoId,
        tipo: 'alteracao_contratual',
        categoria: 'alteracao',
        titulo: expect.stringContaining('Aditivo - Quantidade'),
        descricao: expect.stringContaining(mockAlteracao.justificativa),
        dataEvento: mockAlteracao.dataSolicitacao,
        autor: mockAutor,
        status: 'ativo',
        prioridade: 'alta'
      })

      expect(entradaCriada.alteracaoContratual).toMatchObject({
        alteracaoId: mockAlteracao.id,
        tipoAditivo: 'Aditivo - Quantidade',
        valorOriginal: expect.any(Number),
        valorNovo: mockAlteracao.valorAjustado,
        diferenca: expect.any(Number),
        percentualDiferenca: expect.any(Number),
        novaVigencia: mockAlteracao.novaVigencia,
        statusAlteracao: mockAlteracao.status
      })

      expect(entradaCriada.tags).toEqual(
        expect.arrayContaining(['quantidade', 'aprovada'])
      )
    })

    it('deve calcular valores corretamente para aditivo de quantidade', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      act(() => {
        result.current.criarEntradaAlteracao(mockAlteracao, mockAutor)
      })

      const entradaCriada = mockOnAdicionarEntrada.mock.calls[0][0] as TimelineEntry
      const alteracaoData = entradaCriada.alteracaoContratual!
      
      expect(alteracaoData.valorOriginal).toBe(85000.00) // 100000 * 0.85
      expect(alteracaoData.valorNovo).toBe(100000.00)
      expect(alteracaoData.diferenca).toBe(15000.00)
      expect(alteracaoData.percentualDiferenca).toBeCloseTo(17.65, 1)
    })

    it('deve gerar prioridade correta baseada no tipo', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      // Teste diferentes tipos
      const tiposEPrioridades = [
        { tipo: 'repactuacao_reequilibrio', prioridade: 'critica' },
        { tipo: 'repactuacao', prioridade: 'critica' },
        { tipo: 'quantidade', prioridade: 'alta' },
        { tipo: 'qualitativo', prioridade: 'alta' },
        { tipo: 'prazo', prioridade: 'media' },
        { tipo: 'reajuste', prioridade: 'baixa' }
      ]

      tiposEPrioridades.forEach(({ tipo, prioridade }) => {
        const alteracaoTeste = { ...mockAlteracao, tipoAditivo: tipo as AlteracaoContratualForm['tipoAditivo'] }
        
        act(() => {
          result.current.criarEntradaAlteracao(alteracaoTeste, mockAutor)
        })

        const entradaCriada = mockOnAdicionarEntrada.mock.lastCall?.[0] as TimelineEntry
        expect(entradaCriada.prioridade).toBe(prioridade)
      })
    })

    it('deve lançar erro para tipo de aditivo inválido', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      const alteracaoInvalida = { ...mockAlteracao, tipoAditivo: 'tipo_invalido' as AlteracaoContratualForm['tipoAditivo'] }
      
      expect(() => {
        act(() => {
          result.current.criarEntradaAlteracao(alteracaoInvalida, mockAutor)
        })
      }).toThrow('Tipo de aditivo não encontrado: tipo_invalido')
    })
  })

  describe('criarMarcosAlteracao', () => {
    it('deve criar marco de autorização quando dataAutorizacao existe', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      act(() => {
        result.current.criarMarcosAlteracao(mockAlteracao)
      })

      expect(mockOnAdicionarEntrada).toHaveBeenCalled()
      
      const marcoAutorizacao = mockOnAdicionarEntrada.mock.calls.find(call => 
        call[0].titulo === 'Autorização da Alteração Contratual'
      )?.[0]

      expect(marcoAutorizacao).toMatchObject({
        tipo: 'marco_sistema',
        categoria: 'milestone',
        dataEvento: mockAlteracao.dataAutorizacao,
        autor: {
          id: 'SYSTEM',
          nome: 'Sistema CAC',
          tipo: 'sistema'
        },
        milestone: {
          etapa: 'Autorização de Alteração',
          concluido: true,
          percentualCompleto: 100
        }
      })
    })

    it('deve criar marco de vigência para alterações de prazo', () => {
      const alteracaoPrazo = { ...mockAlteracao, tipoAditivo: 'prazo' as const }
      
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      act(() => {
        result.current.criarMarcosAlteracao(alteracaoPrazo)
      })

      const marcoVigencia = mockOnAdicionarEntrada.mock.calls.find(call => 
        call[0].titulo === 'Nova Vigência - Final do Contrato'
      )?.[0]

      expect(marcoVigencia).toMatchObject({
        tipo: 'marco_sistema',
        categoria: 'milestone',
        dataEvento: alteracaoPrazo.novaVigencia,
        milestone: {
          etapa: 'Fim de Vigência',
          dataLimite: alteracaoPrazo.novaVigencia,
          concluido: false,
          percentualCompleto: 0
        }
      })
    })
  })

  describe('atualizarStatusAlteracao', () => {
    it('deve criar entrada de acompanhamento de status', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      act(() => {
        result.current.atualizarStatusAlteracao('alteracao-123', 'aprovada')
      })

      expect(mockOnAdicionarEntrada).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'marco_sistema',
          categoria: 'alteracao',
          titulo: 'Alteração aprovada e autorizada',
          prioridade: 'alta',
          tags: ['status', 'alteração', 'aprovada']
        })
      )
    })

    it('deve usar prioridade adequada para diferentes status', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntrada
        })
      )

      const statusTests = [
        { status: 'aprovada', prioridade: 'alta' },
        { status: 'rejeitada', prioridade: 'media' },
        { status: 'submetida', prioridade: 'media' },
        { status: 'rascunho', prioridade: 'media' }
      ]

      statusTests.forEach(({ status, prioridade }) => {
        act(() => {
          result.current.atualizarStatusAlteracao('test-id', status as 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada')
        })

        const entrada = mockOnAdicionarEntrada.mock.lastCall?.[0]
        expect(entrada.prioridade).toBe(prioridade)
      })
    })
  })

  describe('tratamento de erros', () => {
    it('deve chamar callback mesmo se onAdicionarEntrada for undefined', () => {
      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId
          // onAdicionarEntrada undefined
        })
      )

      expect(() => {
        act(() => {
          result.current.criarEntradaAlteracao(mockAlteracao, mockAutor)
        })
      }).not.toThrow()
    })

    it('deve propagar erros do callback', () => {
      const mockOnAdicionarEntradaComErro = vi.fn(() => {
        throw new Error('Erro ao adicionar entrada')
      })

      const { result } = renderHook(() => 
        useTimelineIntegration({
          contratoId: mockContratoId,
          onAdicionarEntrada: mockOnAdicionarEntradaComErro
        })
      )

      expect(() => {
        act(() => {
          result.current.criarEntradaAlteracao(mockAlteracao, mockAutor)
        })
      }).toThrow('Erro ao adicionar entrada')
    })
  })
})