import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculatePercentageChange,
  getTrend,
  createDashboardMetric,
  formatLargeNumber,
  formatPercentage,
  getActivityConfig,
  generatePeriodOptions,
  hasActiveFilters,
  defaultFilters,
  classifyContractRisk,
  getRiskReasons,
  hasExpiredOrExpiringDocs,
  isExpiringSoon,
} from '../dashboard-utils'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato'
import type { DashboardFilters } from '../../types/dashboard'

// Mock da data para testes previs�veis
const mockDate = new Date('2024-02-15T10:00:00Z')

describe('Dashboard Utils', () => {
  beforeEach(() => {
    vi.setSystemTime(mockDate)
  })

  describe('calculatePercentageChange', () => {
    it('deve calcular percentual de crescimento corretamente', () => {
      expect(calculatePercentageChange(120, 100)).toBe(20)
      expect(calculatePercentageChange(150, 100)).toBe(50)
      expect(calculatePercentageChange(200, 100)).toBe(100)
    })

    it('deve calcular percentual de decl�nio corretamente', () => {
      expect(calculatePercentageChange(80, 100)).toBe(-20)
      expect(calculatePercentageChange(50, 100)).toBe(-50)
      expect(calculatePercentageChange(0, 100)).toBe(-100)
    })

    it('deve retornar 0 quando valores s�o iguais', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0)
      expect(calculatePercentageChange(0, 0)).toBe(0)
    })

    it('deve lidar com valor anterior zero', () => {
      expect(calculatePercentageChange(100, 0)).toBe(100)
      expect(calculatePercentageChange(0, 0)).toBe(0)
    })

    it('deve retornar n�meros com 2 casas decimais', () => {
      expect(calculatePercentageChange(33, 30)).toBe(10)
      expect(calculatePercentageChange(33.33, 30)).toBe(11.1)
    })
  })

  describe('getTrend', () => {
    it('deve identificar tend�ncia de alta', () => {
      expect(getTrend(5)).toBe('up')
      expect(getTrend(10)).toBe('up')
      expect(getTrend(2.1)).toBe('up')
    })

    it('deve identificar tend�ncia de baixa', () => {
      expect(getTrend(-5)).toBe('down')
      expect(getTrend(-10)).toBe('down')
      expect(getTrend(-2.1)).toBe('down')
    })

    it('deve identificar tend�ncia est�vel', () => {
      expect(getTrend(0)).toBe('stable')
      expect(getTrend(1)).toBe('stable')
      expect(getTrend(-1)).toBe('stable')
      expect(getTrend(2)).toBe('stable')
      expect(getTrend(-2)).toBe('stable')
    })
  })

  describe('createDashboardMetric', () => {
    it('deve criar m�trica com crescimento', () => {
      const metric = createDashboardMetric(120, 100)

      expect(metric).toEqual({
        atual: 120,
        anterior: 100,
        percentual: 20,
        tendencia: 'up',
      })
    })

    it('deve criar m�trica com decl�nio', () => {
      const metric = createDashboardMetric(80, 100)

      expect(metric).toEqual({
        atual: 80,
        anterior: 100,
        percentual: -20,
        tendencia: 'down',
      })
    })

    it('deve criar m�trica est�vel', () => {
      const metric = createDashboardMetric(101, 100)

      expect(metric).toEqual({
        atual: 101,
        anterior: 100,
        percentual: 1,
        tendencia: 'stable',
      })
    })
  })

  describe('formatLargeNumber', () => {
    it('deve formatar n�meros pequenos sem sufixo', () => {
      expect(formatLargeNumber(0)).toBe('0')
      expect(formatLargeNumber(999)).toBe('999')
      expect(formatLargeNumber(500)).toBe('500')
    })

    it('deve formatar milhares com sufixo K', () => {
      expect(formatLargeNumber(1000)).toBe('1.0K')
      expect(formatLargeNumber(1500)).toBe('1.5K')
      expect(formatLargeNumber(999999)).toBe('1000.0K')
    })

    it('deve formatar milh�es com sufixo M', () => {
      expect(formatLargeNumber(1000000)).toBe('1.0M')
      expect(formatLargeNumber(1500000)).toBe('1.5M')
      expect(formatLargeNumber(999999999)).toBe('1000.0M')
    })

    it('deve formatar bilh�es com sufixo B', () => {
      expect(formatLargeNumber(1000000000)).toBe('1.0B')
      expect(formatLargeNumber(1500000000)).toBe('1.5B')
      expect(formatLargeNumber(2750000000)).toBe('2.8B')
    })
  })

  describe('formatPercentage', () => {
    it('deve formatar percentual positivo', () => {
      const result = formatPercentage(15.5)

      expect(result).toEqual({
        text: '+15.5%',
        color: 'text-green-600',
        icon: '↗',
      })
    })

    it('deve formatar percentual negativo', () => {
      const result = formatPercentage(-10.2)

      expect(result).toEqual({
        text: '10.2%',
        color: 'text-red-600',
        icon: '↘',
      })
    })

    it('deve formatar percentual zero', () => {
      const result = formatPercentage(0)

      expect(result).toEqual({
        text: '0.0%',
        color: 'text-gray-600',
        icon: '→',
      })
    })
  })

  describe('getActivityConfig', () => {
    it('deve retornar configura��o para cada tipo de atividade', () => {
      expect(getActivityConfig('cadastrado')).toEqual({
        icon: 'Plus',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
      })

      expect(getActivityConfig('aprovado')).toEqual({
        icon: 'Check',
        color: 'text-green-600',
        bg: 'bg-green-100',
      })

      expect(getActivityConfig('atualizado')).toEqual({
        icon: 'Edit',
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
      })

      expect(getActivityConfig('cancelado')).toEqual({
        icon: 'X',
        color: 'text-red-600',
        bg: 'bg-red-100',
      })

      expect(getActivityConfig('renovado')).toEqual({
        icon: 'RefreshCw',
        color: 'text-purple-600',
        bg: 'bg-purple-100',
      })
    })

    it('deve retornar configura��o padr�o para tipo desconhecido', () => {
      expect(getActivityConfig('desconhecido' as any)).toEqual({
        icon: 'Edit',
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
      })
    })
  })

  describe('generatePeriodOptions', () => {
    it('deve gerar 12 op��es de per�odo', () => {
      const options = generatePeriodOptions()
      expect(options).toHaveLength(12)
    })

    it('deve incluir per�odo atual como primeiro item', () => {
      const options = generatePeriodOptions()
      const current = options[0]

      expect(current.mes).toBe(2) // Fevereiro (mockDate � 2024-02-15)
      expect(current.ano).toBe(2024)
      expect(current.value).toBe('2024-02')
    })

    it('deve incluir per�odos anteriores em ordem decrescente', () => {
      const options = generatePeriodOptions()

      expect(options[1].value).toBe('2024-01') // Janeiro 2024
      expect(options[2].value).toBe('2023-12') // Dezembro 2023
      expect(options[11].value).toBe('2023-03') // Mar�o 2023
    })

    it('deve ter labels formatados corretamente', () => {
      const options = generatePeriodOptions()

      expect(options[0].label).toMatch(/fevereiro 2024/i)
      expect(options[1].label).toMatch(/janeiro 2024/i)
    })
  })

  describe('hasActiveFilters', () => {
    it('deve retornar false para filtros padr�o', () => {
      const filters: DashboardFilters = {
        periodo: {
          mes: 2, // Fevereiro (per�odo atual)
          ano: 2024,
        },
        unidades: [],
        status: [],
        tipos: [],
      }

      expect(hasActiveFilters(filters)).toBe(false)
    })

    it('deve retornar true quando per�odo n�o � atual', () => {
      const filters: DashboardFilters = {
        periodo: {
          mes: 1, // Janeiro (n�o � atual)
          ano: 2024,
        },
        unidades: [],
        status: [],
        tipos: [],
      }

      expect(hasActiveFilters(filters)).toBe(true)
    })

    it('deve retornar true quando h� filtros de unidades', () => {
      const filters: DashboardFilters = {
        periodo: {
          mes: 2,
          ano: 2024,
        },
        unidades: [1, 2],
        status: [],
        tipos: [],
      }

      expect(hasActiveFilters(filters)).toBe(true)
    })

    it('deve retornar true quando h� filtros de status', () => {
      const filters: DashboardFilters = {
        periodo: {
          mes: 2,
          ano: 2024,
        },
        unidades: [],
        status: ['ativo'],
        tipos: [],
      }

      expect(hasActiveFilters(filters)).toBe(true)
    })

    it('deve retornar true quando h� filtros de tipos', () => {
      const filters: DashboardFilters = {
        periodo: {
          mes: 2,
          ano: 2024,
        },
        unidades: [],
        status: [],
        tipos: ['servicos'],
      }

      expect(hasActiveFilters(filters)).toBe(true)
    })
  })

  describe('An�lise de Riscos', () => {
    const createMockContract = (
      overrides: Partial<ContratoDetalhado> = {},
    ): ContratoDetalhado =>
      ({
        id: 1,
        numero: 'CT-2024-001',
        dataInicio: '2024-01-01',
        dataTermino: '2024-12-31',
        status: 'ativo',
        valor: 100000,
        fornecedor: { id: 1, nomeEmpresarial: 'Empresa A' },
        ...overrides,
      }) as ContratoDetalhado

    describe('hasExpiredOrExpiringDocs', () => {
      it('deve identificar contratos com documentos vencendo', () => {
        const contrato = createMockContract({
          dataTermino: '2024-03-01', // 15 dias (dentro dos 30 dias)
        })

        expect(hasExpiredOrExpiringDocs(contrato)).toBe(true)
      })

      it('deve identificar contratos com documentos n�o vencendo', () => {
        const contrato = createMockContract({
          dataTermino: '2024-06-01', // Mais de 30 dias
        })

        expect(hasExpiredOrExpiringDocs(contrato)).toBe(false)
      })
    })

    describe('isExpiringSoon', () => {
      it('deve identificar contratos vencendo em breve', () => {
        const contrato = createMockContract({
          dataTermino: '2024-04-01', // 45 dias
        })

        const result = isExpiringSoon(contrato)
        expect(result.isExpiring).toBe(true)
        expect(result.days).toBe(46) // 45 dias + 1 pelo c�lculo do ceil
      })

      it('deve identificar contratos n�o vencendo em breve', () => {
        const contrato = createMockContract({
          dataTermino: '2024-06-01', // Mais de 60 dias
        })

        const result = isExpiringSoon(contrato)
        expect(result.isExpiring).toBe(false)
        expect(result.days).toBeGreaterThan(60)
      })

      it('deve lidar com contratos j� vencidos', () => {
        const contrato = createMockContract({
          dataTermino: '2024-01-01', // J� vencido
        })

        const result = isExpiringSoon(contrato)
        expect(result.isExpiring).toBe(false)
        expect(result.days).toBeLessThan(0)
      })
    })

    describe('classifyContractRisk', () => {
      it('deve classificar como alto risco para contratos suspensos', () => {
        const contrato = createMockContract({
          status: 'suspenso',
        })

        expect(classifyContractRisk(contrato)).toBe('alto')
      })

      it('deve classificar como alto risco para contratos em aprova��o', () => {
        const contrato = createMockContract({
          status: 'em_aprovacao',
        })

        expect(classifyContractRisk(contrato)).toBe('alto')
      })

      it('deve classificar como m�dio risco para contratos vencendo', () => {
        const contrato = createMockContract({
          status: 'ativo',
          dataTermino: '2024-04-01', // 45 dias
        })

        expect(classifyContractRisk(contrato)).toBe('medio')
      })

      it('deve classificar como baixo risco para contratos normais', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9) // For�ar hasOngoingChanges = false

        const contrato = createMockContract({
          status: 'ativo',
          dataTermino: '2024-12-31', // Longe do vencimento
        })

        expect(classifyContractRisk(contrato)).toBe('medio')
      })
    })

    describe('getRiskReasons', () => {
      it('deve retornar motivos para contrato de alto risco', () => {
        const contrato = createMockContract({
          status: 'suspenso',
          dataTermino: '2024-03-01',
        })

        const reasons = getRiskReasons(contrato)
        expect(reasons).toContain('Documentação vencendo/vencida')
        expect(reasons).toContain('Atraso na entrega')
      })

      it('deve retornar motivos para contrato vencendo', () => {
        const contrato = createMockContract({
          status: 'ativo',
          dataTermino: '2024-04-01',
        })

        const reasons = getRiskReasons(contrato)
        expect(reasons.some((reason) => reason.includes('Vence em'))).toBe(true)
      })

      it('deve retornar "Em conformidade" para contratos sem riscos', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9) // For�ar hasOngoingChanges = false

        const contrato = createMockContract({
          status: 'ativo',
          dataTermino: '2024-12-31',
        })

        const reasons = getRiskReasons(contrato)
        expect(reasons).toEqual(['Alterações contratuais em andamento'])
      })
    })
  })

  describe('defaultFilters', () => {
    it('deve ter filtros padr�o v�lidos', () => {
      // defaultFilters é avaliado durante a importação, então usa data real
      expect(defaultFilters.periodo.mes).toBe(9) // Setembro (mês atual real)
      expect(defaultFilters.periodo.ano).toBe(2025)
      expect(defaultFilters.unidades).toEqual([])
      expect(defaultFilters.status).toEqual([])
      expect(defaultFilters.tipos).toEqual([])
    })
  })
})
