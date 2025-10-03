/**
 * ==========================================
 * SERVIÇO DE DADOS DO DASHBOARD
 * ==========================================
 * APIs e lógica de negócio para dados do dashboard usando endpoints existentes
 */

import {
  subMonths,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
} from 'date-fns'

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

// ========== FUNÇÕES UTILITÁRIAS ==========

/**
 * Filtra contratos por período (mês/ano)
 */
const filterContractsByPeriod = (
  contratos: Contrato[],
  filters: DashboardFilters,
): Contrato[] => {
  const startDate = startOfMonth(
    new Date(filters.periodo.ano, filters.periodo.mes - 1),
  )
  const endDate = endOfMonth(
    new Date(filters.periodo.ano, filters.periodo.mes - 1),
  )

  return contratos.filter((contrato) => {
    // Usar vigenciaInicial como proxy para data de formalização
    if (!contrato.vigenciaInicial) return false
    const contratoDate = parseISO(contrato.vigenciaInicial)
    return isAfter(contratoDate, startDate) && isBefore(contratoDate, endDate)
  })
}

/**
 * Calcula métricas do período anterior para comparação
 */
const getPreviousPeriodData = async (
  filters: DashboardFilters,
): Promise<Contrato[]> => {
  const previousMonth = subMonths(
    new Date(filters.periodo.ano, filters.periodo.mes - 1),
    1,
  )
  const previousStartDate = startOfMonth(previousMonth)
  const previousEndDate = endOfMonth(previousMonth)

  try {
    const response = await getContratos({
      dataInicialDe: format(previousStartDate, 'yyyy-MM-dd'),
      dataInicialAte: format(previousEndDate, 'yyyy-MM-dd'),
      tamanhoPagina: 1000, // Buscar todos os contratos do período
    })
    return response.dados
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_periodo_anterior',
        previousStartDate: format(previousStartDate, 'yyyy-MM-dd'),
        previousEndDate: format(previousEndDate, 'yyyy-MM-dd'),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar dados do período anterior',
    )
    return []
  }
}

// ========== SERVIÇOS DE API ==========

/**
 * Busca métricas consolidadas do dashboard usando endpoints específicos
 */
export const fetchDashboardMetrics = async (
  filters: DashboardFilters,
): Promise<DashboardMetrics> => {
  try {
    // Construir filtros para os endpoints específicos
    const filtrosBaseGeral = {
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      tamanhoPagina: 1000,
    }

    const filtrosBaseEspecifico = {
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
    }

    // Usar Promise.all para buscar dados em paralelo
    const [currentResponse, contratosVencendoResponse, previousContracts] =
      await Promise.all([
        getContratos({
          ...filtrosBaseGeral,
          filtroStatus:
            filters.status.length > 0 ? filters.status.join(',') : undefined,
        }),
        getContratosVencendo(30, filtrosBaseEspecifico), // 30 dias de antecedência
        getPreviousPeriodData(filters),
      ])

    const currentContracts = currentResponse.dados
    const filteredCurrentContracts = filterContractsByPeriod(
      currentContracts,
      filters,
    )

    // Obter dados específicos dos novos endpoints
    const contratosVencendo = contratosVencendoResponse.totalRegistros

    // Calcular métricas atuais
    const totalContratos = filteredCurrentContracts.length
    const contratosAtivos = filteredCurrentContracts.filter(
      (c) => c.status === 'ativo',
    ).length
    const valorTotal = filteredCurrentContracts.reduce(
      (sum, c) => sum + (c.valorGlobal || 0),
      0,
    )

    // Buscar dados do período anterior para contratos vencendo (para comparação)
    let contratosVencendoAnterior = 0
    const previousMonthDate = subMonths(
      new Date(filters.periodo.ano, filters.periodo.mes - 1),
      1,
    )

    try {
      const previousVencendoResponse = await getContratosVencendo(30, {
        dataInicialDe: format(startOfMonth(previousMonthDate), 'yyyy-MM-dd'),
        dataInicialAte: format(endOfMonth(previousMonthDate), 'yyyy-MM-dd'),
        unidadeSaudeId:
          filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      })
      contratosVencendoAnterior = previousVencendoResponse.totalRegistros
    } catch (error) {
      logger.error(
        {
          operation: 'buscar_vencendo_periodo_anterior',
          previousMonth: format(previousMonthDate, 'yyyy-MM-dd'),
          error: error instanceof Error ? error.message : String(error),
        },
        'Erro ao buscar contratos vencendo do período anterior',
      )
      contratosVencendoAnterior = 0
    }

    // Calcular métricas do período anterior
    const totalContratosAnterior = previousContracts.length
    const contratosAtivosAnterior = previousContracts.filter(
      (c) => c.status === 'ativo',
    ).length
    const valorTotalAnterior = previousContracts.reduce(
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
      contratosVencendo: createDashboardMetric(
        contratosVencendo,
        contratosVencendoAnterior,
      ),
      valorTotal: createDashboardMetric(valorTotal, valorTotalAnterior),
    }
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_metricas_dashboard',
        filters,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar métricas do dashboard',
    )

    // Retornar métricas zeradas em caso de erro
    return {
      totalContratos: createDashboardMetric(0, 0),
      contratosAtivos: createDashboardMetric(0, 0),
      contratosVencendo: createDashboardMetric(0, 0),
      valorTotal: createDashboardMetric(0, 0),
    }
  }
}

/**
 * Busca distribuição de contratos por status usando endpoints específicos
 */
export const fetchStatusDistribution = async (
  filters: DashboardFilters,
): Promise<StatusDistributionData[]> => {
  try {
    // Construir filtros base
    const filtrosBaseGeral = {
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      tamanhoPagina: 1000,
    }

    const filtrosBaseEspecifico = {
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
    }

    // Buscar dados usando endpoints específicos e gerais
    const [
      allContractsResponse,
      contratosVencendoResponse,
      contratosVencidosResponse,
    ] = await Promise.all([
      getContratos({
        ...filtrosBaseGeral,
        filtroStatus:
          filters.status.length > 0 ? filters.status.join(',') : undefined,
      }),
      getContratosVencendo(30, filtrosBaseEspecifico), // Contratos vencendo em 30 dias
      getContratosVencidos(filtrosBaseEspecifico), // Contratos vencidos
    ])

    const contracts = allContractsResponse.dados
    const filteredContracts = filterContractsByPeriod(contracts, filters)

    // Inicializar contadores com dados dos endpoints específicos
    const statusCounts: Record<ContratoStatus, number> = {
      ativo: 0,
      vencendo: contratosVencendoResponse.totalRegistros,
      vencido: contratosVencidosResponse.totalRegistros,
      suspenso: 0,
      encerrado: 0,
      rascunho: 0,
      em_aprovacao: 0,
    }

    // Contar outros status dos contratos filtrados (exceto vencendo e vencido que já vieram dos endpoints específicos)
    filteredContracts.forEach((contract) => {
      if (
        contract.status &&
        contract.status in statusCounts &&
        contract.status !== 'vencendo' &&
        contract.status !== 'vencido'
      ) {
        statusCounts[contract.status as ContratoStatus]++
      }
    })

    // Calcular total para percentuais
    const total = Object.values(statusCounts).reduce(
      (sum, count) => sum + count,
      0,
    )

    const statusLabels: Record<ContratoStatus, string> = {
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
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_distribuicao_status',
        filters,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar distribuição por status',
    )

    // Retornar array vazio em caso de erro
    return []
  }
}

/**
 * Busca tendência de status dos últimos 6 meses baseada em dados reais
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
        const response = await getContratos({
          dataInicialDe: format(startDate, 'yyyy-MM-dd'),
          dataInicialAte: format(endDate, 'yyyy-MM-dd'),
          tamanhoPagina: 1000,
          filtroStatus:
            filters.status.length > 0 ? filters.status.join(',') : undefined,
          unidadeSaudeId:
            filters.unidades.length === 1 ? filters.unidades[0] : undefined,
        })

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
        months.push({
          mes: monthNames[monthDate.getMonth()],
          ativos: contracts.filter((c) => c.status === 'ativo').length,
          pendentes: contracts.filter(
            (c) => c.status === 'em_aprovacao' || c.status === 'rascunho',
          ).length,
          encerrados: contracts.filter((c) => c.status === 'encerrado').length,
          suspensos: contracts.filter((c) => c.status === 'suspenso').length,
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
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar tendência de status',
    )

    // Retornar array vazio em caso de erro
    return []
  }
}

/**
 * Busca distribuição de contratos por tipo baseada em dados reais
 */
export const fetchTypeDistribution = async (
  filters: DashboardFilters,
): Promise<TypeDistributionData[]> => {
  try {
    // Buscar todos os contratos
    const response = await getContratos({
      tamanhoPagina: 1000,
      filtroStatus:
        filters.status.length > 0 ? filters.status.join(',') : undefined,
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
    })

    const contracts = response.dados
    const filteredContracts = filterContractsByPeriod(contracts, filters)

    // Agrupar por tipo
    const typeCounts: Record<string, { quantidade: number; valor: number }> = {}

    filteredContracts.forEach((contract) => {
      const tipo = contract.tipoContrato ?? 'Outros'
      typeCounts[tipo] = typeCounts[tipo] ?? { quantidade: 0, valor: 0 }
      typeCounts[tipo].quantidade++
      typeCounts[tipo].valor += contract.valorGlobal || 0
    })

    const total = filteredContracts.length
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
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_distribuicao_tipo',
        filters,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar distribuição por tipo',
    )

    // Retornar array vazio em caso de erro
    return []
  }
}

/**
 * Busca contratos recentes (últimos 5 formalizados) baseada em dados reais
 */
export const fetchRecentContracts = async (
  filters: DashboardFilters,
): Promise<RecentContract[]> => {
  try {
    // Buscar contratos ordenados por data de formalização (mais recentes primeiro)
    const response = await getContratos({
      tamanhoPagina: 5, // Limitar a 5 contratos
      pagina: 1,
      filtroStatus:
        filters.status.length > 0 ? filters.status.join(',') : undefined,
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
    })

    const contracts = response.dados

    // Ordenar por vigência inicial (mais recente primeiro) como proxy para data de formalização
    const sortedContracts = contracts
      .filter((contract) => contract.vigenciaInicial) // Apenas contratos com vigência inicial
      .sort((a, b) => {
        const dateA = new Date(a.vigenciaInicial)
        const dateB = new Date(b.vigenciaInicial)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 5) // Garantir máximo de 5

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
      fornecedor: contract.empresaId || 'Fornecedor não informado',
      dataFormalizacao: contract.vigenciaInicial,
    }))
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_contratos_recentes',
        filters,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar contratos recentes',
    )

    // Retornar array vazio em caso de erro
    return []
  }
}

/**
 * Busca atividades recentes do sistema
 * Por enquanto retorna dados simulados pois não temos endpoint de atividades
 */
export const fetchRecentActivities = async (): Promise<DashboardActivity[]> => {
  try {
    // Buscar alguns contratos recentes para simular atividades
    const response = await getContratos({
      tamanhoPagina: 5,
      pagina: 1,
    })

    const contracts = response.dados

    // Simular atividades baseadas nos contratos
    const activities: DashboardActivity[] = contracts.map((contract, index) => {
      const tipos: (
        | 'cadastrado'
        | 'aprovado'
        | 'atualizado'
        | 'cancelado'
        | 'renovado'
      )[] = ['cadastrado', 'aprovado', 'atualizado']
      const tipo = tipos[index % tipos.length]

      return {
        id: `activity-${contract.id}`,
        tipo,
        contratoId: contract.id,
        contratoNumero: contract.numeroContrato ?? `CTRT-${contract.id}`,
        descricao: `Contrato ${tipo} no sistema`,
        dataHora: contract.vigenciaInicial,
        usuario: 'Sistema',
      }
    })

    return activities
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_atividades_recentes',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar atividades recentes',
    )

    // Retornar array vazio em caso de erro
    return []
  }
}

/**
 * Realiza análise de riscos dos contratos usando dados precisos dos endpoints específicos
 */
export const fetchRiskAnalysis = async (
  filters: DashboardFilters,
): Promise<DashboardRisks> => {
  try {
    // Construir filtros base
    const filtrosBaseGeral = {
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
      tamanhoPagina: 1000,
    }

    const filtrosBaseEspecifico = {
      unidadeSaudeId:
        filters.unidades.length === 1 ? filters.unidades[0] : undefined,
    }

    // Buscar dados dos endpoints específicos e gerais
    const [
      allContractsResponse,
      contratosVencendoResponse,
      contratosVencidosResponse,
    ] = await Promise.all([
      getContratos({
        ...filtrosBaseGeral,
        filtroStatus:
          filters.status.length > 0 ? filters.status.join(',') : undefined,
      }),
      getContratosVencendo(30, filtrosBaseEspecifico), // Vencendo em 30 dias
      getContratosVencidos(filtrosBaseEspecifico), // Já vencidos
    ])

    const contratos = allContractsResponse.dados
    const filteredContracts = filterContractsByPeriod(contratos, filters)

    // Dados dos contratos vencendo e vencidos dos endpoints específicos
    const contratosVencendo = contratosVencendoResponse.dados
    const contratosVencidos = contratosVencidosResponse.dados

    const riskContracts: Record<string, RiskContract[]> = {
      alto: [],
      medio: [],
      baixo: [],
    }

    // ALTO RISCO: Contratos vencidos (dados precisos do endpoint)
    contratosVencidos.forEach((contrato) => {
      riskContracts.alto.push({
        id: contrato.id,
        numero: contrato.numeroContrato ?? `CTRT-${contrato.id}`,
        objeto:
          contrato.objeto ?? contrato.descricaoObjeto ?? 'Objeto não informado',
        risco: 'alto',
        motivos: ['Contrato vencido', 'Requer renovação urgente'],
        diasVencimento: undefined, // Já vencido
        valorRisco: contrato.valorGlobal,
      })
    })

    // MÉDIO RISCO: Contratos vencendo em 30 dias (dados precisos do endpoint)
    contratosVencendo.forEach((contrato) => {
      // Calcular dias restantes com base na vigência final
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
        diasVencimento:
          diasRestantes && diasRestantes > 0 ? diasRestantes : undefined,
        valorRisco: undefined,
      })
    })

    // BAIXO RISCO: Contratos ativos não incluídos nos anteriores
    filteredContracts.forEach((contrato) => {
      // Verificar se não está nas listas de alto/médio risco
      const isVencido = contratosVencidos.some((cv) => cv.id === contrato.id)
      const isVencendo = contratosVencendo.some((cv) => cv.id === contrato.id)

      if (!isVencido && !isVencendo && contrato.status === 'ativo') {
        // Usar função existente para classificar risco de contratos não críticos
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

        // Se não foi classificado como alto risco pela função, considerar baixo risco
        if (riskLevel === 'baixo') {
          riskContracts.baixo.push({
            id: contrato.id,
            numero: contrato.numeroContrato ?? `CTRT-${contrato.id}`,
            objeto:
              contrato.objeto ??
              contrato.descricaoObjeto ??
              'Objeto não informado',
            risco: 'baixo',
            motivos:
              reasons.length > 0 ? reasons : ['Contrato em conformidade'],
            diasVencimento: days > 0 ? days : undefined,
            valorRisco: undefined,
          })
        } else if (riskLevel === 'medio') {
          // Se foi classificado como médio risco, adicionar à lista de médio risco
          riskContracts.medio.push({
            id: contrato.id,
            numero: contrato.numeroContrato ?? `CTRT-${contrato.id}`,
            objeto:
              contrato.objeto ??
              contrato.descricaoObjeto ??
              'Objeto não informado',
            risco: 'medio',
            motivos: reasons,
            diasVencimento: days > 0 ? days : undefined,
            valorRisco: undefined,
          })
        }
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
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_analise_riscos',
        filters,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar análise de riscos',
    )

    // Retornar estrutura vazia em caso de erro
    return {
      alto: {
        level: 'alto',
        count: 0,
        contratos: [],
        description: 'Contratos vencidos ou com pendências críticas',
      },
      medio: {
        level: 'medio',
        count: 0,
        contratos: [],
        description: 'Contratos vencendo em 30 dias ou com atenção necessária',
      },
      baixo: {
        level: 'baixo',
        count: 0,
        contratos: [],
        description: 'Contratos ativos em conformidade',
      },
      total: 0,
    }
  }
}

/**
 * Busca todos os dados do dashboard de uma vez usando endpoints existentes
 */
export const fetchDashboardData = async (
  filters: DashboardFilters,
): Promise<DashboardData> => {
  try {
    const [
      metrics,
      statusDistribution,
      statusTrend,
      typeDistribution,
      recentContracts,
      recentActivities,
      riskAnalysis,
    ] = await Promise.all([
      fetchDashboardMetrics(filters),
      fetchStatusDistribution(filters),
      fetchStatusTrend(filters),
      fetchTypeDistribution(filters),
      fetchRecentContracts(filters),
      fetchRecentActivities(),
      fetchRiskAnalysis(filters),
    ])

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
 * Busca unidades para filtros (integração com serviço existente)
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
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar unidades para filtros',
    )
    return []
  }
}
