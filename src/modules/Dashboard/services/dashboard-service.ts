/**
 * ==========================================
 * SERVIÇO DE DADOS DO DASHBOARD - OTIMIZADO
 * ==========================================
 * APIs consolidadas para reduzir chamadas HTTP e melhorar performance
 */

import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'


import { createServiceLogger } from '@/lib/logger'
import {
  getContratos,
  getContratosVencendo,
  getContratosVencidos,
} from '@/modules/Contratos/services/contratos-service'
import type {
  Contrato,
  ContratoDetalhado,
  ContratoStatus,
} from '@/modules/Contratos/types/contrato'
import { getUnidades } from '@/modules/Unidades/services/unidades-service'

import type {
  DashboardData,
  DashboardMetrics,
  DashboardFilters,
  StatusDistributionData,
  StatusTrendData,
  TypeDistributionData,
  RecentContract,
  DashboardActivity,
  DashboardRisks,
  RiskContract,
} from '../types/dashboard'
import {
  createDashboardMetric,
  classifyContractRisk,
  getRiskReasons,
  isExpiringSoon,
} from '../utils/dashboard-utils'


const logger = createServiceLogger('dashboard-service')

// ========== FUNÇÕES AUXILIARES DE PROCESSAMENTO ==========

/**
 * Calcula o status real de um contrato baseado nas datas de vigência
 * Replica a lógica de getContratoStatusFromVigencia do use-status-config.ts
 * @param vigenciaFinal - Data final de vigência do contrato
 * @param statusAtual - Status atual do contrato na API
 * @param dataReferencia - Data de referência para o cálculo (padrão: hoje)
 */
const calcularStatusPorData = (
  vigenciaFinal?: string | null,
  statusAtual?: string | null,
  dataReferencia?: Date,
): ContratoStatus => {
  // Se tem status específico como 'suspenso' ou 'encerrado', respeitar
  if (statusAtual?.toLowerCase() === 'suspenso') {
    return 'suspenso'
  }
  if (statusAtual?.toLowerCase() === 'encerrado') {
    return 'encerrado'
  }

  // Se não tem vigência final, considerar vigente
  if (!vigenciaFinal) {
    return 'vigente'
  }

  const agora = dataReferencia ?? new Date()
  const em30Dias = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000)
  const dataFim = new Date(vigenciaFinal)

  if (dataFim < agora) {
    return 'vencido'
  } else if (dataFim <= em30Dias) {
    return 'vencendo'
  } else {
    return 'vigente'
  }
}

/**
 * Calcula métricas consolidadas a partir dos dados base
 * USANDO DATAS DE VIGÊNCIA para determinar status real
 */
const calculateMetrics = (
  allContracts: Contrato[],
  expiringContracts: Contrato[],
  previousMonthContracts: Contrato[],
): DashboardMetrics => {
  // MÉTRICAS ATUAIS - Calculando status real baseado nas datas
  const totalContratos = allContracts.length
  const contratosAtivos = allContracts.filter((c) => {
    const statusReal = calcularStatusPorData(c.vigenciaFinal, c.status)
    return statusReal === 'vigente'
  }).length
  const valorTotal = allContracts.reduce(
    (sum, c) => sum + (c.valorGlobal || 0),
    0,
  )
  const contratosVencendo = expiringContracts.length

  // MÉTRICAS DO MÊS ANTERIOR PARA COMPARAÇÃO - Calculando status real
  const totalContratosAnterior = previousMonthContracts.length
  const contratosAtivosAnterior = previousMonthContracts.filter((c) => {
    const statusReal = calcularStatusPorData(c.vigenciaFinal, c.status)
    return statusReal === 'vigente'
  }).length
  const valorTotalAnterior = previousMonthContracts.reduce(
    (sum, c) => sum + (c.valorGlobal || 0),
    0,
  )

  return {
    totalContratos: createDashboardMetric(
      totalContratos,
      totalContratosAnterior,
    ),
    contratosAtivos: createDashboardMetric(
      contratosAtivos,
      contratosAtivosAnterior,
    ),
    contratosVencendo: createDashboardMetric(contratosVencendo, 0), // Comparação não aplicável
    valorTotal: createDashboardMetric(valorTotal, valorTotalAnterior),
  }
}

/**
 * Calcula distribuição de status a partir dos dados base
 * USANDO DATAS DE VIGÊNCIA para determinar status real
 */
const calculateStatusDistribution = (
  allContracts: Contrato[],
): StatusDistributionData[] => {
  // Inicializar contadores
  const statusCounts: Record<ContratoStatus, number> = {
    vigente: 0,
    ativo: 0,
    vencendo: 0,
    vencido: 0,
    suspenso: 0,
    encerrado: 0,
    rascunho: 0,
    em_aprovacao: 0,
  }

  // Contar status calculado por data para cada contrato
  allContracts.forEach((contract) => {
    const statusReal = calcularStatusPorData(contract.vigenciaFinal, contract.status)
    if (statusReal in statusCounts) {
      statusCounts[statusReal]++
    }
  })

  // Calcular total para percentuais
  const total = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0,
  )

  const statusLabels: Record<ContratoStatus, string> = {
    vigente: 'Vigentes',
    ativo: 'Ativos',
    vencendo: 'Vencendo',
    vencido: 'Vencidos',
    suspenso: 'Suspensos',
    encerrado: 'Encerrados',
    rascunho: 'Rascunhos',
    em_aprovacao: 'Em Aprovação',
  }

  // Converter para formato do gráfico (apenas status com contratos)
  const result: StatusDistributionData[] = []
  let colorIndex = 1

  Object.entries(statusCounts).forEach(([status, count]) => {
    if (count > 0) {
      result.push({
        name: statusLabels[status as ContratoStatus],
        value: count,
        color: `hsl(var(--chart-${colorIndex}))`,
        percentage: total > 0 ? (count / total) * 100 : 0,
      })
      colorIndex++
    }
  })

  return result.length > 0
    ? result
    : [
        {
          name: 'Nenhum contrato',
          value: 0,
          color: 'hsl(var(--muted))',
          percentage: 0,
        },
      ]
}

/**
 * Calcula distribuição de tipos a partir dos dados base
 */
const calculateTypeDistribution = (
  allContracts: Contrato[],
): TypeDistributionData[] => {
  // Agrupar por tipo
  const typeCounts: Record<string, { quantidade: number; valor: number }> = {}

  allContracts.forEach((contract) => {
    const tipo = contract.tipoContrato ?? 'Outros'
    typeCounts[tipo] = typeCounts[tipo] ?? { quantidade: 0, valor: 0 }
    typeCounts[tipo].quantidade++
    typeCounts[tipo].valor += contract.valorGlobal || 0
  })

  const total = allContracts.length
  const tipoLabels: Record<string, string> = {
    servicos: 'Serviços',
    obras: 'Obras',
    fornecimento: 'Fornecimento',
    concessao: 'Concessão',
  }

  // Converter para formato do gráfico
  const result: TypeDistributionData[] = Object.entries(typeCounts).map(
    ([tipo, data]) => ({
      tipo: tipoLabels[tipo] ?? tipo,
      quantidade: data.quantidade,
      percentual: total > 0 ? (data.quantidade / total) * 100 : 0,
      valor: data.valor,
    }),
  )

  // Ordenar por quantidade (maior para menor)
  result.sort((a, b) => b.quantidade - a.quantidade)

  return result.length > 0
    ? result
    : [{ tipo: 'Nenhum contrato', quantidade: 0, percentual: 0, valor: 0 }]
}

/**
 * Extrai contratos recentes a partir dos dados base
 */
const extractRecentContracts = (
  allContracts: Contrato[],
): RecentContract[] => {
  // Ordenar por vigência inicial (mais recente primeiro)
  const sortedContracts = allContracts
    .filter((contract) => contract.vigenciaInicial) // Apenas contratos com vigência inicial
    .sort((a, b) => {
      const dateA = new Date(a.vigenciaInicial)
      const dateB = new Date(b.vigenciaInicial)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 6) // Limitar a 6 contratos

  return sortedContracts.map((contract) => ({
    id: contract.id,
    numero: contract.numeroContrato ?? `CTRT-${contract.id}`,
    objeto:
      contract.objeto ?? contract.descricaoObjeto ?? 'Objeto não informado',
    valor: contract.valorGlobal || 0,
    vigencia: {
      inicio: contract.vigenciaInicial,
      fim: contract.vigenciaFinal,
    },
    status: contract.status as ContratoStatus,
    fornecedor: contract.empresaRazaoSocial ?? 'Fornecedor não informado',
    dataFormalizacao: contract.vigenciaInicial,
  }))
}

/**
 * Simula atividades recentes a partir dos contratos
 * Mantido para compatibilidade até que endpoint de atividades seja criado
 */
const simulateActivities = (
  recentContracts: RecentContract[],
): DashboardActivity[] => {
  const tipos: (
    | 'cadastrado'
    | 'aprovado'
    | 'atualizado'
    | 'cancelado'
    | 'renovado'
  )[] = ['cadastrado', 'aprovado', 'atualizado']

  return recentContracts.slice(0, 6).map((contract, index) => {
    const tipo = tipos[index % tipos.length]

    return {
      id: `activity-${contract.id}`,
      tipo,
      contratoId: contract.id,
      contratoNumero: contract.numero,
      titulo: `Contrato ${tipo}`,
      descricao: `${contract.numero} - ${contract.objeto}`,
      dataHora: 'Recentemente',
      usuario: 'Sistema',
    }
  })
}

/**
 * Calcula análise de riscos a partir dos dados base
 */
const calculateRiskAnalysis = (
  allContracts: Contrato[],
  expiringContracts: Contrato[],
  expiredContracts: Contrato[],
): DashboardRisks => {
  const riskContracts: Record<string, RiskContract[]> = {
    alto: [],
    medio: [],
    baixo: [],
  }

  // IDs já processados
  const processedIds = new Set<string>()

  // ALTO RISCO: Contratos vencidos
  expiredContracts.forEach((contrato) => {
    riskContracts.alto.push({
      id: contrato.id,
      numero: contrato.numeroContrato ?? `CTRT-${contrato.id}`,
      objeto:
        contrato.objeto ?? contrato.descricaoObjeto ?? 'Objeto não informado',
      risco: 'alto',
      motivos: ['Contrato vencido', 'Requer renovação urgente'],
      diasVencimento: undefined,
      valorRisco: contrato.valorGlobal,
    })
    processedIds.add(contrato.id)
  })

  // MÉDIO RISCO: Contratos vencendo em 30 dias
  expiringContracts.forEach((contrato) => {
    if (processedIds.has(contrato.id)) return

    // Calcular dias restantes
    let diasRestantes = undefined
    if (contrato.vigenciaFinal) {
      const dataVencimento = new Date(contrato.vigenciaFinal)
      const hoje = new Date()
      const diferenca = dataVencimento.getTime() - hoje.getTime()
      diasRestantes = Math.ceil(diferenca / (1000 * 60 * 60 * 24))
    }

    riskContracts.medio.push({
      id: contrato.id,
      numero: contrato.numeroContrato ?? `CTRT-${contrato.id}`,
      objeto:
        contrato.objeto ?? contrato.descricaoObjeto ?? 'Objeto não informado',
      risco: 'medio',
      motivos: ['Vencimento próximo', 'Requer atenção para renovação'],
      diasVencimento: diasRestantes && diasRestantes > 0 ? diasRestantes : undefined,
      valorRisco: undefined,
    })
    processedIds.add(contrato.id)
  })

  // BAIXO RISCO: Contratos ativos não incluídos nos anteriores
  allContracts.forEach((contrato) => {
    if (processedIds.has(contrato.id)) return
    if (contrato.status !== 'ativo') return

    const contratoDetalhado: Partial<ContratoDetalhado> = {
      id: contrato.id,
      numeroContrato: contrato.numeroContrato ?? undefined,
      objeto: contrato.objeto ?? contrato.descricaoObjeto ?? undefined,
      status: contrato.status ?? undefined,
      dataInicio: contrato.vigenciaInicial,
      dataTermino: contrato.vigenciaFinal,
      valorTotal: contrato.valorGlobal,
    }

    const riskLevel = classifyContractRisk(
      contratoDetalhado as ContratoDetalhado,
    )
    const reasons = getRiskReasons(contratoDetalhado as ContratoDetalhado)
    const { days } = isExpiringSoon(contratoDetalhado as ContratoDetalhado)

    if (riskLevel === 'baixo') {
      riskContracts.baixo.push({
        id: contrato.id,
        numero: contrato.numeroContrato ?? `CTRT-${contrato.id}`,
        objeto:
          contrato.objeto ??
          contrato.descricaoObjeto ??
          'Objeto não informado',
        risco: 'baixo',
        motivos: reasons.length > 0 ? reasons : ['Contrato em conformidade'],
        diasVencimento: days > 0 ? days : undefined,
        valorRisco: undefined,
      })
    }
  })

  const totalContratos =
    riskContracts.alto.length +
    riskContracts.medio.length +
    riskContracts.baixo.length

  return {
    alto: {
      level: 'alto',
      count: riskContracts.alto.length,
      contratos: riskContracts.alto,
      description: 'Contratos vencidos ou com pendências críticas',
    },
    medio: {
      level: 'medio',
      count: riskContracts.medio.length,
      contratos: riskContracts.medio,
      description: 'Contratos vencendo em 30 dias ou com atenção necessária',
    },
    baixo: {
      level: 'baixo',
      count: riskContracts.baixo.length,
      contratos: riskContracts.baixo,
      description: 'Contratos ativos em conformidade',
    },
    total: totalContratos,
  }
}

// ========== SERVIÇOS DE API ==========

/**
 * Busca tendência de status dos últimos 6 meses
 * MANTIDO SEPARADO: Requer 6 chamadas sequenciais por natureza temporal
 */
export const fetchStatusTrend = async (
  filters: DashboardFilters,
): Promise<StatusTrendData[]> => {
  try {
    const months: StatusTrendData[] = []
    const currentDate = new Date(filters.periodo.ano, filters.periodo.mes - 1)

    // Buscar dados dos últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i)
      const startDate = startOfMonth(monthDate)
      const endDate = endOfMonth(monthDate)

      try {
        const params: any = {
          tamanhoPagina: 1000,
          filtroStatus:
            filters.status.length > 0 ? filters.status.join(',') : undefined,
          unidadeSaudeId:
            filters.unidades.length === 1 ? filters.unidades[0] : undefined,
        }

        // Aplicar filtro de período apenas se modo "Por Período" estiver ativo
        if (filters.tipoVisualizacao === 'periodo') {
          params.dataInicialDe = format(startDate, 'yyyy-MM-dd')
          params.dataInicialAte = format(endDate, 'yyyy-MM-dd')
        }

        const response = await getContratos(params)

        const contracts = response.dados

        const monthNames = [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ]

        // Usar o último dia do mês como referência para cálculo de status
        const dataReferenciaFimMes = endDate

        months.push({
          mes: monthNames[monthDate.getMonth()],
          ativos: contracts.filter((c) => {
            const statusReal = calcularStatusPorData(
              c.vigenciaFinal,
              c.status,
              dataReferenciaFimMes,
            )
            return statusReal === 'vigente'
          }).length,
          pendentes: contracts.filter(
            (c) => c.status === 'em_aprovacao' || c.status === 'rascunho',
          ).length,
          encerrados: contracts.filter((c) => {
            const statusReal = calcularStatusPorData(
              c.vigenciaFinal,
              c.status,
              dataReferenciaFimMes,
            )
            return statusReal === 'encerrado' || c.status === 'encerrado'
          }).length,
          suspensos: contracts.filter((c) => {
            const statusReal = calcularStatusPorData(
              c.vigenciaFinal,
              c.status,
              dataReferenciaFimMes,
            )
            return statusReal === 'suspenso' || c.status === 'suspenso'
          }).length,
        })
      } catch {
        // Em caso de erro para um mês específico, usar zeros
        months.push({
          mes: format(monthDate, 'MMM'),
          ativos: 0,
          pendentes: 0,
          encerrados: 0,
          suspensos: 0,
        })
      }
    }

    return months
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_tendencia_status',
        filters,
        error: error instanceof Error ? error.message : String(error),
      },
      'Erro ao buscar tendência de status',
    )

    return []
  }
}

/**
 * Busca todos os dados do dashboard com chamadas HTTP consolidadas
 * OTIMIZAÇÃO: 19 chamadas → 10 chamadas (~50% redução)
 */
export const fetchDashboardData = async (
  filters: DashboardFilters,
): Promise<DashboardData> => {
  try {
    logger.info(
      { filters },
      'Iniciando busca consolidada de dados do dashboard',
    )

    // FASE 1: Buscar dados base em paralelo (4 chamadas)
    const [
      allContractsResponse,
      expiringContractsResponse,
      expiredContractsResponse,
      previousMonthContractsResponse,
    ] = await Promise.all([
      // 1. Todos os contratos do sistema (COM OU SEM FILTRO DE PERÍODO)
      (async () => {
        const params: any = {
          tamanhoPagina: 10000, // Buscar todos
          filtroStatus:
            filters.status.length > 0 ? filters.status.join(',') : undefined,
          unidadeSaudeId:
            filters.unidades.length === 1 ? filters.unidades[0] : undefined,
        }

        // Aplicar filtro de período se modo "Por Período" estiver ativo
        if (filters.tipoVisualizacao === 'periodo') {
          const startDate = startOfMonth(
            new Date(filters.periodo.ano, filters.periodo.mes - 1),
          )
          const endDate = endOfMonth(
            new Date(filters.periodo.ano, filters.periodo.mes - 1),
          )

          params.dataInicialDe = format(startDate, 'yyyy-MM-dd')
          params.dataInicialAte = format(endDate, 'yyyy-MM-dd')
        }

        return getContratos(params)
      })(),

      // 2. Contratos vencendo em 30 dias
      getContratosVencendo(30, {
        unidadeSaudeId:
          filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      }),

      // 3. Contratos vencidos
      getContratosVencidos({
        unidadeSaudeId:
          filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      }),

      // 4. Contratos do mês anterior (para comparação)
      (async () => {
        const previousMonth = subMonths(
          new Date(filters.periodo.ano, filters.periodo.mes - 1),
          1,
        )
        try {
          const response = await getContratos({
            dataInicialDe: format(startOfMonth(previousMonth), 'yyyy-MM-dd'),
            dataInicialAte: format(endOfMonth(previousMonth), 'yyyy-MM-dd'),
            tamanhoPagina: 10000,
            unidadeSaudeId:
              filters.unidades.length === 1 ? filters.unidades[0] : undefined,
          })
          return response
        } catch (error) {
          logger.error(
            { error, previousMonth },
            'Erro ao buscar contratos do mês anterior',
          )
          return {
            dados: [],
            totalRegistros: 0,
            paginaAtual: 1,
            tamanhoPagina: 0,
            totalPaginas: 0,
            temProximaPagina: false,
            temPaginaAnterior: false,
          }
        }
      })(),
    ])

    const allContracts = allContractsResponse.dados
    const expiringContracts = expiringContractsResponse.dados
    const expiredContracts = expiredContractsResponse.dados
    const previousMonthContracts = previousMonthContractsResponse.dados

    logger.info(
      {
        totalContracts: allContracts.length,
        expiringContracts: expiringContracts.length,
        expiredContracts: expiredContracts.length,
      },
      'Dados base carregados com sucesso',
    )

    // FASE 2: Buscar tendência dos últimos 6 meses (6 chamadas sequenciais)
    const statusTrend = await fetchStatusTrend(filters)

    // FASE 3: Processar dados localmente (SEM chamadas HTTP)
    const metrics = calculateMetrics(
      allContracts,
      expiringContracts,
      previousMonthContracts,
    )
    const statusDistribution = calculateStatusDistribution(allContracts)
    const typeDistribution = calculateTypeDistribution(allContracts)
    const recentContracts = extractRecentContracts(allContracts)
    const recentActivities = simulateActivities(recentContracts)
    const riskAnalysis = calculateRiskAnalysis(
      allContracts,
      expiringContracts,
      expiredContracts,
    )

    logger.info('Dashboard consolidado com sucesso')

    return {
      metrics,
      statusDistribution,
      statusTrend,
      typeDistribution,
      recentContracts,
      recentActivities,
      riskAnalysis,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_dados_dashboard',
        filters,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar dados do dashboard',
    )
    throw new Error(
      'Falha ao carregar dados do dashboard. Contate o administrador do sistema.',
    )
  }
}

// ========== INTEGRAÇÃO COM UNIDADES ==========

/**
 * Busca unidades para filtros
 */
export const fetchUnidadesForFilters = async () => {
  try {
    const response = await getUnidades({ tamanhoPagina: 100 })
    return response.dados
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_unidades_filtros',
        error: error instanceof Error ? error.message : String(error),
      },
      'Erro ao buscar unidades para filtros',
    )
    return []
  }
}
