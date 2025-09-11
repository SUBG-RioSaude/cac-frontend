import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStatusConfig } from '../use-status-config'
import { CheckCircle, AlertTriangle, Clock, XCircle, Pause } from 'lucide-react'

describe('useStatusConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar funções e configurações necessárias', () => {
    const { result } = renderHook(() => useStatusConfig())

    expect(typeof result.current.getStatusConfig).toBe('function')
    expect(typeof result.current.getContratoStatusFromVigencia).toBe('function')
    expect(typeof result.current.statusConfigMap).toBe('object')
  })

  it('deve ter configurações para todos os domínios', () => {
    const { result } = renderHook(() => useStatusConfig())
    const { statusConfigMap } = result.current

    expect(statusConfigMap).toHaveProperty('contrato')
    expect(statusConfigMap).toHaveProperty('fornecedor')
    expect(statusConfigMap).toHaveProperty('unidade')
  })

  describe('statusConfigMap.contrato', () => {
    it('deve ter todas as configurações de status de contrato', () => {
      const { result } = renderHook(() => useStatusConfig())
      const { contrato } = result.current.statusConfigMap

      expect(contrato).toHaveProperty('ativo')
      expect(contrato).toHaveProperty('vencendo')
      expect(contrato).toHaveProperty('vencido')
      expect(contrato).toHaveProperty('suspenso')
      expect(contrato).toHaveProperty('encerrado')
      expect(contrato).toHaveProperty('indefinido')
    })

    it('deve ter configurações corretas para contrato ativo', () => {
      const { result } = renderHook(() => useStatusConfig())
      const { ativo } = result.current.statusConfigMap.contrato

      expect(ativo.variant).toBe('default')
      expect(ativo.label).toBe('Ativo')
      expect(ativo.className).toContain('bg-green-100')
      expect(ativo.icon).toBe(CheckCircle)
    })

    it('deve ter configurações corretas para contrato vencendo', () => {
      const { result } = renderHook(() => useStatusConfig())
      const { vencendo } = result.current.statusConfigMap.contrato

      expect(vencendo.variant).toBe('secondary')
      expect(vencendo.label).toBe('Vencendo')
      expect(vencendo.className).toContain('bg-yellow-100')
      expect(vencendo.icon).toBe(Clock)
    })

    it('deve ter configurações corretas para contrato vencido', () => {
      const { result } = renderHook(() => useStatusConfig())
      const { vencido } = result.current.statusConfigMap.contrato

      expect(vencido.variant).toBe('destructive')
      expect(vencido.label).toBe('Vencido')
      expect(vencido.className).toContain('bg-red-100')
      expect(vencido.icon).toBe(AlertTriangle)
    })
  })

  describe('statusConfigMap.fornecedor', () => {
    it('deve ter todas as configurações de status de fornecedor', () => {
      const { result } = renderHook(() => useStatusConfig())
      const { fornecedor } = result.current.statusConfigMap

      expect(fornecedor).toHaveProperty('ativo')
      expect(fornecedor).toHaveProperty('inativo')
      expect(fornecedor).toHaveProperty('suspenso')
    })

    it('deve ter configurações corretas para fornecedor ativo', () => {
      const { result } = renderHook(() => useStatusConfig())
      const { ativo } = result.current.statusConfigMap.fornecedor

      expect(ativo.variant).toBe('default')
      expect(ativo.label).toBe('Ativo')
      expect(ativo.className).toContain('bg-green-100')
      expect(ativo.icon).toBe(CheckCircle)
    })
  })

  describe('statusConfigMap.unidade', () => {
    it('deve ter todas as configurações de status de unidade', () => {
      const { result } = renderHook(() => useStatusConfig())
      const { unidade } = result.current.statusConfigMap

      expect(unidade).toHaveProperty('ativo')
      expect(unidade).toHaveProperty('inativo')
    })
  })

  describe('getStatusConfig', () => {
    it('deve retornar configuração correta para status de contrato válido', () => {
      const { result } = renderHook(() => useStatusConfig())
      const config = result.current.getStatusConfig('ativo', 'contrato')

      expect(config.label).toBe('Ativo')
      expect(config.variant).toBe('default')
      expect(config.className).toContain('bg-green-100')
      expect(config.icon).toBe(CheckCircle)
    })

    it('deve ser case-insensitive', () => {
      const { result } = renderHook(() => useStatusConfig())
      
      const configLower = result.current.getStatusConfig('ativo', 'contrato')
      const configUpper = result.current.getStatusConfig('ATIVO', 'contrato')
      const configMixed = result.current.getStatusConfig('Ativo', 'contrato')

      expect(configLower).toEqual(configUpper)
      expect(configLower).toEqual(configMixed)
    })

    it('deve retornar configuração correta para status de fornecedor', () => {
      const { result } = renderHook(() => useStatusConfig())
      const config = result.current.getStatusConfig('suspenso', 'fornecedor')

      expect(config.label).toBe('Suspenso')
      expect(config.variant).toBe('destructive')
      expect(config.icon).toBe(Pause)
    })

    it('deve retornar configuração correta para status de unidade', () => {
      const { result } = renderHook(() => useStatusConfig())
      const config = result.current.getStatusConfig('inativo', 'unidade')

      expect(config.label).toBe('Inativo')
      expect(config.variant).toBe('secondary')
      expect(config.icon).toBe(XCircle)
    })

    it('deve retornar fallback para contrato quando status não existe', () => {
      const { result } = renderHook(() => useStatusConfig())
      const config = result.current.getStatusConfig('status_inexistente', 'contrato')

      expect(config.label).toBe('Indefinido')
      expect(config.variant).toBe('outline')
    })

    it('deve retornar fallback para fornecedor quando status não existe', () => {
      const { result } = renderHook(() => useStatusConfig())
      const config = result.current.getStatusConfig('status_inexistente', 'fornecedor')

      expect(config.label).toBe('Ativo')
      expect(config.variant).toBe('default')
    })

    it('deve retornar fallback para unidade quando status não existe', () => {
      const { result } = renderHook(() => useStatusConfig())
      const config = result.current.getStatusConfig('status_inexistente', 'unidade')

      expect(config.label).toBe('Ativo')
      expect(config.variant).toBe('default')
    })

    it('deve lidar com status nulo ou undefined', () => {
      const { result } = renderHook(() => useStatusConfig())
      
      const configNull = result.current.getStatusConfig(null as any, 'contrato')
      const configUndefined = result.current.getStatusConfig(undefined as any, 'contrato')

      expect(configNull.label).toBe('Indefinido')
      expect(configUndefined.label).toBe('Indefinido')
    })
  })

  describe('getContratoStatusFromVigencia', () => {
    it('deve retornar "suspenso" quando status atual é suspenso', () => {
      const { result } = renderHook(() => useStatusConfig())
      const status = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        '2024-12-31',
        'suspenso'
      )

      expect(status).toBe('suspenso')
    })

    it('deve retornar "encerrado" quando status atual é encerrado', () => {
      const { result } = renderHook(() => useStatusConfig())
      const status = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        '2024-12-31',
        'encerrado'
      )

      expect(status).toBe('encerrado')
    })

    it('deve retornar "ativo" quando não há data de vigência final', () => {
      const { result } = renderHook(() => useStatusConfig())
      const status = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        null,
        null
      )

      expect(status).toBe('ativo')
    })

    it('deve retornar "vencido" quando data final já passou', () => {
      const { result } = renderHook(() => useStatusConfig())
      const dataPassada = '2023-12-31' // Data no passado
      
      const status = result.current.getContratoStatusFromVigencia(
        '2023-01-01',
        dataPassada,
        null
      )

      expect(status).toBe('vencido')
    })

    it('deve retornar "vencendo" quando faltam menos de 30 dias', () => {
      const { result } = renderHook(() => useStatusConfig())
      
      // Data em 15 dias
      const dataEm15Dias = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
      
      const status = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        dataEm15Dias,
        null
      )

      expect(status).toBe('vencendo')
    })

    it('deve retornar "ativo" quando há mais de 30 dias para vencer', () => {
      const { result } = renderHook(() => useStatusConfig())
      
      // Data em 60 dias
      const dataEm60Dias = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
      
      const status = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        dataEm60Dias,
        null
      )

      expect(status).toBe('ativo')
    })

    it('deve ser case-insensitive para status atual', () => {
      const { result } = renderHook(() => useStatusConfig())
      
      const statusLower = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        '2024-12-31',
        'suspenso'
      )
      const statusUpper = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        '2024-12-31',
        'SUSPENSO'
      )
      const statusMixed = result.current.getContratoStatusFromVigencia(
        '2024-01-01',
        '2024-12-31',
        'Suspenso'
      )

      expect(statusLower).toBe('suspenso')
      expect(statusUpper).toBe('suspenso')
      expect(statusMixed).toBe('suspenso')
    })

    it('deve ignorar vigência inicial (parâmetro não usado)', () => {
      const { result } = renderHook(() => useStatusConfig())
      
      // Mesmo resultado com diferentes vigências iniciais
      const status1 = result.current.getContratoStatusFromVigencia(
        '2020-01-01',
        null,
        null
      )
      const status2 = result.current.getContratoStatusFromVigencia(
        '2030-01-01',
        null,
        null
      )

      expect(status1).toBe('ativo')
      expect(status2).toBe('ativo')
    })

    it('deve priorizar status específico sobre cálculo de vigência', () => {
      const { result } = renderHook(() => useStatusConfig())
      
      // Data vencida, mas status suspenso deve ter prioridade
      const dataPassada = '2023-12-31'
      const status = result.current.getContratoStatusFromVigencia(
        '2023-01-01',
        dataPassada,
        'suspenso'
      )

      expect(status).toBe('suspenso')
    })
  })

  describe('memoização', () => {
    it('deve manter referência estável do statusConfigMap', () => {
      const { result, rerender } = renderHook(() => useStatusConfig())
      const firstConfigMap = result.current.statusConfigMap

      rerender()
      const secondConfigMap = result.current.statusConfigMap

      expect(firstConfigMap).toBe(secondConfigMap)
    })
  })
})