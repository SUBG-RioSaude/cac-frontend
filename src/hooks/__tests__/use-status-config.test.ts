import { renderHook } from '@testing-library/react'
import { CheckCircle, AlertTriangle, Clock, XCircle, Pause } from 'lucide-react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useStatusConfig, useContratoStatus } from '../use-status-config'

describe('useStatusConfig', () => {
  describe('getStatusConfig', () => {
    describe('Dom�nio contrato', () => {
      it('deve retornar configura��o para status vigente', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('vigente', 'contrato')

        expect(config).toEqual({
          variant: 'default',
          label: 'Vigente',
          className:
            'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
          icon: CheckCircle,
        })
      })

      it('deve mapear ativo para vigente (retrocompatibilidade)', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('ativo', 'contrato')

        expect(config).toEqual({
          variant: 'default',
          label: 'Vigente',
          className:
            'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
          icon: CheckCircle,
        })
      })

      it('deve retornar configura��o para status vencendo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('vencendo', 'contrato')

        expect(config).toEqual({
          variant: 'secondary',
          label: 'Vencendo',
          className:
            'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
          icon: Clock,
        })
      })

      it('deve retornar configura��o para status vencido', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('vencido', 'contrato')

        expect(config).toEqual({
          variant: 'destructive',
          label: 'Vencido',
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
          icon: AlertTriangle,
        })
      })

      it('deve retornar configura��o para status suspenso', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('suspenso', 'contrato')

        expect(config).toEqual({
          variant: 'outline',
          label: 'Suspenso',
          className:
            'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: Pause,
        })
      })

      it('deve retornar configura��o para status encerrado', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('encerrado', 'contrato')

        expect(config).toEqual({
          variant: 'outline',
          label: 'Encerrado',
          className:
            'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
          icon: XCircle,
        })
      })

      it('deve retornar configura��o para status indefinido', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('indefinido', 'contrato')

        expect(config).toEqual({
          variant: 'outline',
          label: 'Indefinido',
          className:
            'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200',
          icon: undefined,
        })
      })

      it('deve usar fallback indefinido para status inv�lido', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig(
          'invalido' as Status,
          'contrato',
        )

        expect(config).toEqual({
          variant: 'outline',
          label: 'Indefinido',
          className:
            'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200',
          icon: undefined,
        })
      })
    })

    describe('Dom�nio fornecedor', () => {
      it('deve retornar configura��o para status ativo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('ativo', 'fornecedor')

        expect(config).toEqual({
          variant: 'default',
          label: 'Ativo',
          className:
            'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle,
        })
      })

      it('deve retornar configura��o para status inativo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('inativo', 'fornecedor')

        expect(config).toEqual({
          variant: 'secondary',
          label: 'Inativo',
          className:
            'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: XCircle,
        })
      })

      it('deve retornar configura��o para status suspenso', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('suspenso', 'fornecedor')

        expect(config).toEqual({
          variant: 'destructive',
          label: 'Suspenso',
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
          icon: Pause,
        })
      })

      it('deve usar fallback ativo para status inv�lido', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig(
          'invalido' as Status,
          'fornecedor',
        )

        expect(config).toEqual({
          variant: 'default',
          label: 'Ativo',
          className:
            'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle,
        })
      })
    })

    describe('Dom�nio unidade', () => {
      it('deve retornar configura��o para status ativo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('ativo', 'unidade')

        expect(config).toEqual({
          variant: 'default',
          label: 'Ativo',
          className:
            'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle,
        })
      })

      it('deve retornar configura��o para status inativo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('inativo', 'unidade')

        expect(config).toEqual({
          variant: 'secondary',
          label: 'Inativo',
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
          icon: XCircle,
        })
      })

      it('deve usar fallback ativo para status inv�lido', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig(
          'invalido' as Status,
          'unidade',
        )

        expect(config).toEqual({
          variant: 'default',
          label: 'Ativo',
          className:
            'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle,
        })
      })
    })

    describe('Case insensitive', () => {
      it('deve tratar status em mai�sculo corretamente', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('ATIVO', 'contrato')

        expect(config.label).toBe('Vigente')
      })

      it('deve tratar status em mixed case corretamente', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig('VenCenDo', 'contrato')

        expect(config.label).toBe('Vencendo')
      })
    })

    describe('Dom�nio inv�lido', () => {
      it('deve usar fallback contrato.indefinido para dom�nio inv�lido', () => {
        const { result } = renderHook(() => useStatusConfig())
        const config = result.current.getStatusConfig(
          'ativo',
          'invalido' as StatusDomain,
        )

        expect(config).toEqual({
          variant: 'outline',
          label: 'Indefinido',
          className:
            'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200',
          icon: undefined,
        })
      })
    })
  })

  describe('getContratoStatusFromVigencia', () => {
    let mockDate: Date

    beforeEach(() => {
      // Mock de data fixa para testes previs�veis
      mockDate = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(mockDate)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('Status espec�ficos t�m prioridade', () => {
      it('deve retornar suspenso quando statusAtual � suspenso', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2024-01-01',
          '2024-12-31',
          'suspenso',
        )

        expect(status).toBe('suspenso')
      })

      it('deve retornar encerrado quando statusAtual � encerrado', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2024-01-01',
          '2024-12-31',
          'encerrado',
        )

        expect(status).toBe('encerrado')
      })

      it('deve tratar status em mai�sculo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2024-01-01',
          '2024-12-31',
          'SUSPENSO',
        )

        expect(status).toBe('suspenso')
      })
    })

    describe('L�gica de vig�ncia', () => {
      it('deve retornar vigente quando n�o h� vig�ncia final', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2024-01-01',
          null,
          null,
        )

        expect(status).toBe('vigente')
      })

      it('deve retornar vigente quando n�o h� vig�ncia final (undefined)', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2024-01-01',
          undefined,
          null,
        )

        expect(status).toBe('vigente')
      })

      it('deve retornar vencido quando data final j� passou', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2024-01-10', // 5 dias atr�s
          null,
        )

        expect(status).toBe('vencido')
      })

      it('deve retornar vencendo quando data final est� em at� 30 dias', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2024-02-10', // Em 26 dias (dentro dos 30 dias)
          null,
        )

        expect(status).toBe('vencendo')
      })

      it('deve retornar vencendo quando data final � exatamente em 30 dias', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2024-02-14', // Exatamente 30 dias
          null,
        )

        expect(status).toBe('vencendo')
      })

      it('deve retornar vigente quando data final � mais de 30 dias', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2024-03-01', // Mais de 30 dias
          null,
        )

        expect(status).toBe('vigente')
      })

      it('deve retornar vencendo quando data final � hoje + 1 dia', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2024-01-16', // Amanh�
          null,
        )

        expect(status).toBe('vencendo')
      })
    })

    describe('Casos extremos de datas', () => {
      it('deve lidar com datas em formato ISO completo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01T00:00:00Z',
          '2024-01-10T23:59:59Z',
          null,
        )

        expect(status).toBe('vencido')
      })

      it('deve lidar com string de data inv�lida graciosamente', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          'data-invalida',
          null,
        )

        // Data inv�lida deve resultar em Invalid Date, que compara��es falham
        // Comportamento pode variar, mas deve ser est�vel
        expect(['vencido', 'vencendo', 'vigente']).toContain(status)
      })
    })

    describe('Prioridade de status sobre vig�ncia', () => {
      it('deve retornar suspenso mesmo se contrato vencido', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2024-01-10', // Vencido
          'suspenso', // Mas suspenso tem prioridade
        )

        expect(status).toBe('suspenso')
      })

      it('deve retornar encerrado mesmo se contrato ativo', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2025-01-01', // Ativo por vig�ncia
          'encerrado', // Mas encerrado tem prioridade
        )

        expect(status).toBe('encerrado')
      })

      it('deve ignorar status n�o reconhecidos e usar l�gica de vig�ncia', () => {
        const { result } = renderHook(() => useStatusConfig())
        const status = result.current.getContratoStatusFromVigencia(
          '2023-01-01',
          '2025-01-01', // Vigente por vig�ncia
          'status-desconhecido',
        )

        expect(status).toBe('vigente')
      })
    })
  })

  describe('statusConfigMap', () => {
    it('deve estar dispon�vel e conter todas as configura��es', () => {
      const { result } = renderHook(() => useStatusConfig())
      const configMap = result.current.statusConfigMap

      expect(configMap).toHaveProperty('contrato')
      expect(configMap).toHaveProperty('fornecedor')
      expect(configMap).toHaveProperty('unidade')

      // Verificar estrutura do contrato
      expect(configMap.contrato).toHaveProperty('vigente')
      expect(configMap.contrato).toHaveProperty('ativo')
      expect(configMap.contrato).toHaveProperty('vencendo')
      expect(configMap.contrato).toHaveProperty('vencido')
      expect(configMap.contrato).toHaveProperty('suspenso')
      expect(configMap.contrato).toHaveProperty('encerrado')
      expect(configMap.contrato).toHaveProperty('indefinido')

      // Verificar estrutura do fornecedor
      expect(configMap.fornecedor).toHaveProperty('ativo')
      expect(configMap.fornecedor).toHaveProperty('inativo')
      expect(configMap.fornecedor).toHaveProperty('suspenso')

      // Verificar estrutura da unidade
      expect(configMap.unidade).toHaveProperty('ativo')
      expect(configMap.unidade).toHaveProperty('inativo')
    })

    it('deve manter refer�ncia est�vel entre renderiza��es', () => {
      const { result, rerender } = renderHook(() => useStatusConfig())
      const firstConfigMap = result.current.statusConfigMap

      rerender()

      const secondConfigMap = result.current.statusConfigMap
      expect(firstConfigMap).toBe(secondConfigMap)
    })
  })

  describe('Estabilidade de fun��es', () => {
    it('deve manter refer�ncia est�vel das fun��es entre renderiza��es', () => {
      const { result, rerender } = renderHook(() => useStatusConfig())
      const firstFunctions = {
        getStatusConfig: result.current.getStatusConfig,
        getContratoStatusFromVigencia:
          result.current.getContratoStatusFromVigencia,
      }

      rerender()

      const secondFunctions = {
        getStatusConfig: result.current.getStatusConfig,
        getContratoStatusFromVigencia:
          result.current.getContratoStatusFromVigencia,
      }

      expect(firstFunctions.getStatusConfig).toBe(
        secondFunctions.getStatusConfig,
      )
      expect(firstFunctions.getContratoStatusFromVigencia).toBe(
        secondFunctions.getContratoStatusFromVigencia,
      )
    })
  })
})

describe('useContratoStatus', () => {
  let mockDate: Date

  beforeEach(() => {
    mockDate = new Date('2024-01-15T10:00:00Z')
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve retornar status vigente para contrato com vig�ncia futura', () => {
    const { result } = renderHook(() =>
      useContratoStatus('2024-01-01', '2025-01-01', null),
    )

    expect(result.current).toBe('vigente')
  })

  it('deve retornar status vencendo para contrato vencendo em 30 dias', () => {
    const { result } = renderHook(() =>
      useContratoStatus('2024-01-01', '2024-02-14', null),
    )

    expect(result.current).toBe('vencendo')
  })

  it('deve retornar status vencido para contrato j� vencido', () => {
    const { result } = renderHook(() =>
      useContratoStatus('2023-01-01', '2024-01-10', null),
    )

    expect(result.current).toBe('vencido')
  })

  it('deve retornar suspenso quando statusAtual � suspenso', () => {
    const { result } = renderHook(() =>
      useContratoStatus('2024-01-01', '2025-01-01', 'suspenso'),
    )

    expect(result.current).toBe('suspenso')
  })

  it('deve retornar encerrado quando statusAtual � encerrado', () => {
    const { result } = renderHook(() =>
      useContratoStatus('2024-01-01', '2025-01-01', 'encerrado'),
    )

    expect(result.current).toBe('encerrado')
  })

  it('deve memoizar corretamente quando props n�o mudam', () => {
    const { result, rerender } = renderHook(
      ({ vigenciaInicial, vigenciaFinal, statusAtual }) =>
        useContratoStatus(vigenciaInicial, vigenciaFinal, statusAtual),
      {
        initialProps: {
          vigenciaInicial: '2024-01-01',
          vigenciaFinal: '2025-01-01',
          statusAtual: null,
        },
      },
    )

    const firstStatus = result.current

    rerender({
      vigenciaInicial: '2024-01-01',
      vigenciaFinal: '2025-01-01',
      statusAtual: null,
    })

    expect(result.current).toBe(firstStatus)
    expect(result.current).toBe('vigente')
  })

  it('deve recalcular quando vigenciaFinal muda', () => {
    const { result, rerender } = renderHook(
      ({ vigenciaInicial, vigenciaFinal, statusAtual }) =>
        useContratoStatus(vigenciaInicial, vigenciaFinal, statusAtual),
      {
        initialProps: {
          vigenciaInicial: '2024-01-01',
          vigenciaFinal: '2025-01-01',
          statusAtual: null,
        },
      },
    )

    expect(result.current).toBe('vigente')

    rerender({
      vigenciaInicial: '2024-01-01',
      vigenciaFinal: '2024-01-10',
      statusAtual: null,
    })

    expect(result.current).toBe('vencido')
  })

  it('deve recalcular quando statusAtual muda', () => {
    const { result, rerender } = renderHook(
      ({ vigenciaInicial, vigenciaFinal, statusAtual }) =>
        useContratoStatus(vigenciaInicial, vigenciaFinal, statusAtual),
      {
        initialProps: {
          vigenciaInicial: '2024-01-01',
          vigenciaFinal: '2025-01-01',
          statusAtual: null,
        },
      },
    )

    expect(result.current).toBe('vigente')

    rerender({
      vigenciaInicial: '2024-01-01',
      vigenciaFinal: '2025-01-01',
      statusAtual: 'suspenso',
    })

    expect(result.current).toBe('suspenso')
  })
})
