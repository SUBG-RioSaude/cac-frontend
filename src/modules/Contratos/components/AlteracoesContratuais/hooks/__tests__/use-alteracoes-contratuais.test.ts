import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  TipoAlteracao,
  StatusAlteracao,
  OperacaoVigencia,
  TipoUnidadeTempo,
} from '../../../../types/alteracoes-contratuais'
import { useAlteracoesContratuais } from '../use-alteracoes-contratuais'

// Mocks simples das mutations da API
vi.mock('../../../../hooks/use-alteracoes-contratuais-api', () => ({
  useCriarAlteracaoContratual: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useAtualizarAlteracaoContratual: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}))

describe('useAlteracoesContratuais', () => {
  const defaultProps = {
    contratoId: 'test-contract-id',
    valorOriginal: 1000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('deve inicializar com dados padrão', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      expect(result.current.dados.contratoId).toBe('test-contract-id')
      expect(result.current.dados.tiposAlteracao).toEqual([])
      expect(result.current.dados.dadosBasicos?.justificativa).toBe('')
      expect(result.current.dados.dataEfeito).toBe('')
      expect(result.current.dados.blocos).toEqual({})
    })

    it('deve inicializar podeSubmeter como false', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )
      expect(result.current.podeSubmeter).toBe(false)
    })
  })

  describe('Atualização de dados', () => {
    it('deve atualizar dados corretamente', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoPrazo],
          dataEfeito: '2024-12-31',
        })
      })

      expect(result.current.dados.tiposAlteracao).toEqual([
        TipoAlteracao.AditivoPrazo,
      ])
      expect(result.current.dados.dataEfeito).toBe('2024-12-31')
    })

    it('deve manter dados existentes ao atualizar', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoPrazo],
        })
      })

      act(() => {
        result.current.atualizarDados({
          dataEfeito: '2024-12-31',
        })
      })

      expect(result.current.dados.tiposAlteracao).toEqual([
        TipoAlteracao.AditivoPrazo,
      ])
      expect(result.current.dados.dataEfeito).toBe('2024-12-31')
      expect(result.current.dados.contratoId).toBe('test-contract-id')
    })
  })

  describe('Validação de campos obrigatórios', () => {
    it('deve validar campos obrigatórios básicos', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      // Sem dados, deve ser inválido
      let valido = true
      act(() => {
        valido = result.current.validarCamposObrigatorios()
      })
      expect(valido).toBe(false)
    })

    it('deve ser válido com campos mínimos preenchidos', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoPrazo],
          dadosBasicos: {
            justificativa: 'Teste justificativa',
            fundamentoLegal: 'Art. 57',
            observacoes: '',
          },
          dataEfeito: '2024-12-31',
          blocos: {
            vigencia: {
              operacao: OperacaoVigencia.Acrescentar,
              valorTempo: 1,
              tipoUnidade: TipoUnidadeTempo.Dias,
            },
          },
        })
      })

      let valido = false
      act(() => {
        valido = result.current.validarCamposObrigatorios()
      })
      expect(valido).toBe(true)
    })
  })

  describe('Blocos obrigatórios', () => {
    it('deve calcular blocos obrigatórios baseado nos tipos', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoPrazo],
        })
      })

      expect(result.current.blocosObrigatorios.has('vigencia')).toBe(true)
    })

    it('deve atualizar blocos quando tipos mudam', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoQuantidade],
        })
      })

      expect(result.current.blocosObrigatorios.has('valor')).toBe(true)
    })
  })

  describe('Limite legal', () => {
    it('deve calcular limite legal baseado nos tipos', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoQuantidade],
        })
      })

      expect(result.current.limiteLegal).toBe(25)
    })

    it('deve ter limite 0 para tipos sem limite', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoPrazo],
        })
      })

      expect(result.current.limiteLegal).toBe(0)
    })
  })

  describe('Estado de loading', () => {
    it('deve reportar isLoading corretamente', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )
      // Com mocks padrão, não deve estar loading
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Reset do formulário', () => {
    it('deve resetar para estado inicial', () => {
      const { result } = renderHook(() =>
        useAlteracoesContratuais(defaultProps),
      )

      // Preencher dados
      act(() => {
        result.current.atualizarDados({
          tiposAlteracao: [TipoAlteracao.AditivoPrazo],
          dataEfeito: '2024-12-31',
        })
      })

      // Resetar
      act(() => {
        result.current.resetarFormulario()
      })

      expect(result.current.dados.tiposAlteracao).toEqual([])
      expect(result.current.dados.dataEfeito).toBe('')
      expect(result.current.dados.dadosBasicos?.justificativa).toBe('')
    })
  })
})
