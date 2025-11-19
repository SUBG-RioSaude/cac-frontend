/**
 * ==========================================
 * TESTES PARA QUERY KEYS DO DASHBOARD
 * ==========================================
 * Testes para garantir que as query keys são geradas corretamente
 */

import { describe, it, expect } from 'vitest'

import type { DashboardFilters } from '../../types/dashboard'
import { dashboardKeys } from '../query-keys'

describe('dashboardKeys', () => {
  describe('Base keys', () => {
    it('deve retornar a chave base', () => {
      expect(dashboardKeys.all).toEqual(['dashboard'])
    })

    it('deve retornar a chave de data', () => {
      expect(dashboardKeys.data()).toEqual(['dashboard', 'data'])
    })

    it('deve retornar a chave de data com filtros', () => {
      const filtros: Partial<DashboardFilters> = {
        periodo: { mes: 10, ano: 2025 },
      }
      expect(dashboardKeys.dataWithFilters(filtros)).toEqual([
        'dashboard',
        'data',
        filtros,
      ])
    })

    it('deve retornar a chave de data sem filtros', () => {
      expect(dashboardKeys.dataWithFilters()).toEqual([
        'dashboard',
        'data',
        undefined,
      ])
    })
  })

  describe('Métricas', () => {
    it('deve retornar a chave de métricas', () => {
      expect(dashboardKeys.metrics()).toEqual(['dashboard', 'metrics'])
    })

    it('deve retornar a chave de métricas com filtros', () => {
      const filtros: Partial<DashboardFilters> = {
        unidades: [1, 2],
        status: ['ativo'],
      }
      expect(dashboardKeys.metricsWithFilters(filtros)).toEqual([
        'dashboard',
        'metrics',
        filtros,
      ])
    })

    it('deve retornar a chave de métricas sem filtros', () => {
      expect(dashboardKeys.metricsWithFilters()).toEqual([
        'dashboard',
        'metrics',
        undefined,
      ])
    })
  })

  describe('Gráficos e distribuições', () => {
    it('deve retornar a chave de charts', () => {
      expect(dashboardKeys.charts()).toEqual(['dashboard', 'charts'])
    })

    it('deve retornar a chave de distribuição de status', () => {
      expect(dashboardKeys.statusDistribution()).toEqual([
        'dashboard',
        'charts',
        'status-distribution',
      ])
    })

    it('deve retornar a chave de tendência de status', () => {
      expect(dashboardKeys.statusTrend()).toEqual([
        'dashboard',
        'charts',
        'status-trend',
      ])
    })

    it('deve retornar a chave de distribuição de tipos', () => {
      expect(dashboardKeys.typeDistribution()).toEqual([
        'dashboard',
        'charts',
        'type-distribution',
      ])
    })
  })

  describe('Contratos recentes', () => {
    it('deve retornar a chave de contratos recentes sem limite', () => {
      expect(dashboardKeys.recentContracts()).toEqual([
        'dashboard',
        'recent-contracts',
        undefined,
      ])
    })

    it('deve retornar a chave de contratos recentes com limite', () => {
      expect(dashboardKeys.recentContracts(10)).toEqual([
        'dashboard',
        'recent-contracts',
        10,
      ])
    })
  })

  describe('Atividades recentes', () => {
    it('deve retornar a chave de atividades recentes sem limite', () => {
      expect(dashboardKeys.recentActivities()).toEqual([
        'dashboard',
        'recent-activities',
        undefined,
      ])
    })

    it('deve retornar a chave de atividades recentes com limite', () => {
      expect(dashboardKeys.recentActivities(5)).toEqual([
        'dashboard',
        'recent-activities',
        5,
      ])
    })
  })

  describe('Análise de riscos', () => {
    it('deve retornar a chave de riscos', () => {
      expect(dashboardKeys.risks()).toEqual(['dashboard', 'risks'])
    })

    it('deve retornar a chave de riscos por nível alto', () => {
      expect(dashboardKeys.risksByLevel('alto')).toEqual([
        'dashboard',
        'risks',
        'alto',
      ])
    })

    it('deve retornar a chave de riscos por nível médio', () => {
      expect(dashboardKeys.risksByLevel('medio')).toEqual([
        'dashboard',
        'risks',
        'medio',
      ])
    })

    it('deve retornar a chave de riscos por nível baixo', () => {
      expect(dashboardKeys.risksByLevel('baixo')).toEqual([
        'dashboard',
        'risks',
        'baixo',
      ])
    })
  })

  describe('Invalidação de cache', () => {
    it('deve retornar chaves para invalidar tudo', () => {
      expect(dashboardKeys.invalidateAll()).toEqual([['dashboard']])
    })

    it('deve retornar chaves para invalidar métricas', () => {
      expect(dashboardKeys.invalidateMetrics()).toEqual([
        ['dashboard', 'metrics'],
        ['dashboard', 'data'],
        ['dashboard'],
      ])
    })

    it('deve retornar chaves para invalidar gráficos', () => {
      expect(dashboardKeys.invalidateCharts()).toEqual([
        ['dashboard', 'charts'],
        ['dashboard', 'charts', 'status-distribution'],
        ['dashboard', 'charts', 'status-trend'],
        ['dashboard', 'charts', 'type-distribution'],
        ['dashboard', 'data'],
      ])
    })

    it('deve retornar chaves para invalidar riscos', () => {
      expect(dashboardKeys.invalidateRisks()).toEqual([
        ['dashboard', 'risks'],
        ['dashboard', 'data'],
      ])
    })

    it('deve retornar chaves para invalidar ao mudar contrato', () => {
      expect(dashboardKeys.invalidateOnContratoChange()).toEqual([
        ['dashboard'],
        ['dashboard', 'data'],
        ['dashboard', 'metrics'],
        ['dashboard', 'recent-contracts', undefined],
        ['dashboard', 'risks'],
      ])
    })
  })

  describe('Imutabilidade', () => {
    it('deve retornar arrays readonly', () => {
      const key = dashboardKeys.data()
      expect(Object.isFrozen(key)).toBe(false) // TypeScript readonly, não JS frozen
      expect(Array.isArray(key)).toBe(true)
    })

    it('deve retornar diferentes instâncias a cada chamada', () => {
      const key1 = dashboardKeys.data()
      const key2 = dashboardKeys.data()
      expect(key1).toEqual(key2)
      expect(key1).not.toBe(key2) // Diferentes objetos
    })
  })

  describe('Consistência de estrutura', () => {
    it('todas as keys devem começar com dashboard', () => {
      expect(dashboardKeys.data()[0]).toBe('dashboard')
      expect(dashboardKeys.metrics()[0]).toBe('dashboard')
      expect(dashboardKeys.charts()[0]).toBe('dashboard')
      expect(dashboardKeys.recentContracts()[0]).toBe('dashboard')
      expect(dashboardKeys.recentActivities()[0]).toBe('dashboard')
      expect(dashboardKeys.risks()[0]).toBe('dashboard')
    })

    it('keys hierárquicas devem manter a hierarquia', () => {
      const base = dashboardKeys.charts()
      const statusDist = dashboardKeys.statusDistribution()

      // statusDistribution deve começar com os mesmos elementos de charts
      expect(statusDist.slice(0, 2)).toEqual(base)
    })
  })
})
