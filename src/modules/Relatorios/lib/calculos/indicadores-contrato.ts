/**
 * ==========================================
 * BIBLIOTECA DE CÁLCULOS E INDICADORES
 * ==========================================
 * Cálculos financeiros e temporais para relatórios contratuais
 */

import type { ContratoRelatorio } from '../../types/relatorio'
import {
  calcularDiferencaDias,
  calcularDiasRestantes,
  calcularPercentualTemporal,
} from '../pdf/pdf-utils'

// ========== INDICADORES FINANCEIROS ==========

/**
 * Calcula saldo disponível do contrato
 */
export const calcularSaldo = (valorGlobal: number, valorEmpenhado: number): number => {
  return Math.max(0, valorGlobal - valorEmpenhado)
}

/**
 * Calcula percentual executado financeiramente
 */
export const calcularPercentualExecutado = (
  valorEmpenhado: number,
  valorGlobal: number,
): number => {
  if (valorGlobal === 0) return 0
  return Math.min(100, (valorEmpenhado / valorGlobal) * 100)
}

/**
 * Calcula valor médio de empenho
 */
export const calcularMediaEmpenhos = (
  empenhos: Array<{ valor: number }>,
): number => {
  if (!empenhos || empenhos.length === 0) return 0
  const total = empenhos.reduce((sum, emp) => sum + emp.valor, 0)
  return total / empenhos.length
}

/**
 * Encontra maior e menor empenho
 */
export const calcularRangeEmpenhos = (
  empenhos: Array<{ valor: number }>,
): { maior: number; menor: number } => {
  if (!empenhos || empenhos.length === 0) {
    return { maior: 0, menor: 0 }
  }

  const valores = empenhos.map((e) => e.valor)
  return {
    maior: Math.max(...valores),
    menor: Math.min(...valores),
  }
}

/**
 * Calcula velocidade de execução financeira (R$/mês)
 */
export const calcularVelocidadeExecucao = (
  valorEmpenhado: number,
  dataInicio: string,
): number => {
  const diasDecorridos = calcularDiferencaDias(
    dataInicio,
    new Date().toISOString(),
  )
  const mesesDecorridos = diasDecorridos / 30
  if (mesesDecorridos === 0) return 0
  return valorEmpenhado / mesesDecorridos
}

// ========== INDICADORES TEMPORAIS ==========

/**
 * Calcula prazo total em meses
 */
export const calcularPrazoMeses = (
  dataInicio: string,
  dataFim: string,
): number => {
  const dias = calcularDiferencaDias(dataInicio, dataFim)
  return Math.ceil(dias / 30)
}

/**
 * Calcula dias decorridos desde o início
 */
export const calcularDiasDecorridos = (dataInicio: string): number => {
  const hoje = new Date()
  const inicio = new Date(dataInicio)
  const diferencaMs = hoje.getTime() - inicio.getTime()
  return Math.max(0, Math.floor(diferencaMs / (1000 * 60 * 60 * 24)))
}

/**
 * Verifica se contrato está próximo do vencimento (30 dias)
 */
export const contratoVencendo = (dataFim: string): boolean => {
  const diasRestantes = calcularDiasRestantes(dataFim)
  return diasRestantes > 0 && diasRestantes <= 30
}

/**
 * Verifica se contrato está vencido
 */
export const contratoVencido = (dataFim: string): boolean => {
  return calcularDiasRestantes(dataFim) < 0
}

/**
 * Determina status de vigência do contrato
 */
export const determinarStatusVigencia = (
  dataFim: string,
): 'vigente' | 'vencendo' | 'vencido' => {
  if (contratoVencido(dataFim)) return 'vencido'
  if (contratoVencendo(dataFim)) return 'vencendo'
  return 'vigente'
}

// ========== ANÁLISE DE DESEMPENHO ==========

/**
 * Calcula índice de desempenho (execução vs tempo)
 */
export const calcularIndiceDesempenho = (
  percentualExecutado: number,
  percentualTemporal: number,
): number => {
  if (percentualTemporal === 0) return 0
  return percentualExecutado / percentualTemporal
}

/**
 * Classifica desempenho da execução
 */
export const classificarDesempenho = (
  percentualExecutado: number,
  percentualTemporal: number,
): 'excelente' | 'bom' | 'adequado' | 'atencao' | 'critico' => {
  const indice = calcularIndiceDesempenho(percentualExecutado, percentualTemporal)

  if (indice >= 1.2) return 'excelente' // Execução muito acelerada
  if (indice >= 1.0) return 'bom' // Execução alinhada ou acima
  if (indice >= 0.9) return 'adequado' // Execução ligeiramente abaixo
  if (indice >= 0.7) return 'atencao' // Execução lenta
  return 'critico' // Execução muito lenta
}

/**
 * Gera mensagem de análise de desempenho
 */
export const gerarAnaliseDesempenho = (
  percentualExecutado: number,
  percentualTemporal: number,
): string => {
  const classificacao = classificarDesempenho(
    percentualExecutado,
    percentualTemporal,
  )

  const mensagens = {
    excelente:
      'Execução financeira está significativamente acima do esperado para o período. Continue monitorando.',
    bom: 'Execução financeira está alinhada com o progresso temporal. Desempenho adequado.',
    adequado:
      'Execução financeira está ligeiramente abaixo do esperado, mas dentro da normalidade.',
    atencao:
      'Atenção: execução financeira está abaixo do esperado para o período. Recomenda-se análise.',
    critico:
      'Crítico: execução financeira muito abaixo do esperado. Necessária intervenção imediata.',
  }

  return mensagens[classificacao]
}

// ========== PROJEÇÕES ==========

/**
 * Projeta saldo final com base na velocidade atual
 */
export const projetarSaldoFinal = (
  valorGlobal: number,
  valorEmpenhado: number,
  dataInicio: string,
  dataFim: string,
): number => {
  const velocidade = calcularVelocidadeExecucao(valorEmpenhado, dataInicio)
  const mesesRestantes = calcularPrazoMeses(
    new Date().toISOString(),
    dataFim,
  )

  const projecaoExecucao = valorEmpenhado + velocidade * mesesRestantes
  const saldoProjetado = valorGlobal - projecaoExecucao

  return Math.max(0, saldoProjetado)
}

/**
 * Projeta data de conclusão financeira
 */
export const projetarDataConclusao = (
  valorGlobal: number,
  valorEmpenhado: number,
  dataInicio: string,
): Date | null => {
  const saldo = valorGlobal - valorEmpenhado
  if (saldo <= 0) return new Date() // Já concluído

  const velocidade = calcularVelocidadeExecucao(valorEmpenhado, dataInicio)
  if (velocidade === 0) return null // Velocidade zero, impossível projetar

  const mesesNecessarios = saldo / velocidade
  const hoje = new Date()
  const dataConclusao = new Date(hoje)
  dataConclusao.setMonth(dataConclusao.getMonth() + Math.ceil(mesesNecessarios))

  return dataConclusao
}

// ========== ANÁLISE DE ALTERAÇÕES ==========

/**
 * Calcula impacto financeiro total das alterações
 */
export const calcularImpactoAlteracoes = (
  alteracoes: Array<{ valor?: number; tipo: string }>,
): { totalAcrescimos: number; totalSupressoes: number; saldo: number } => {
  if (!alteracoes || alteracoes.length === 0) {
    return { totalAcrescimos: 0, totalSupressoes: 0, saldo: 0 }
  }

  let totalAcrescimos = 0
  let totalSupressoes = 0

  alteracoes.forEach((alt) => {
    if (alt.valor) {
      if (
        alt.tipo.toLowerCase().includes('acréscimo') ||
        alt.tipo.toLowerCase().includes('aditivo') ||
        alt.tipo.toLowerCase().includes('aumento')
      ) {
        totalAcrescimos += alt.valor
      } else if (
        alt.tipo.toLowerCase().includes('supressão') ||
        alt.tipo.toLowerCase().includes('redução') ||
        alt.tipo.toLowerCase().includes('decréscimo')
      ) {
        totalSupressoes += Math.abs(alt.valor)
      }
    }
  })

  return {
    totalAcrescimos,
    totalSupressoes,
    saldo: totalAcrescimos - totalSupressoes,
  }
}

/**
 * Calcula número de prorrogações de prazo
 */
export const contarProrrogacoes = (
  alteracoes: Array<{ tipo: string }>,
): number => {
  if (!alteracoes) return 0
  return alteracoes.filter((alt) =>
    alt.tipo.toLowerCase().includes('prorrogação'),
  ).length
}

// ========== ANÁLISE DE DOCUMENTAÇÃO ==========

/**
 * Calcula percentual de documentos entregues
 */
export const calcularPercentualDocumentos = (
  documentos: Array<{ entregue: boolean }>,
): number => {
  if (!documentos || documentos.length === 0) return 0
  const entregues = documentos.filter((d) => d.entregue).length
  return (entregues / documentos.length) * 100
}

/**
 * Verifica status de conformidade documental
 */
export const verificarConformidadeDocumental = (
  documentos: Array<{ entregue: boolean; obrigatorio?: boolean }>,
): { conforme: boolean; pendenciasObrigatorias: number } => {
  if (!documentos || documentos.length === 0) {
    return { conforme: true, pendenciasObrigatorias: 0 }
  }

  const obrigatoriosPendentes = documentos.filter(
    (d) => d.obrigatorio && !d.entregue,
  ).length

  return {
    conforme: obrigatoriosPendentes === 0,
    pendenciasObrigatorias: obrigatoriosPendentes,
  }
}

// ========== ENRIQUECIMENTO DE DADOS ==========

/**
 * Enriquece dados do contrato com indicadores calculados
 */
export const enriquecerDadosContrato = (
  contrato: ContratoRelatorio,
): ContratoRelatorio => {
  const contratoEnriquecido = { ...contrato }

  // Cálculos financeiros
  if (contrato.valores) {
    contratoEnriquecido.valores = {
      ...contrato.valores,
      saldo: calcularSaldo(contrato.valores.global, contrato.valores.empenhado),
      percentualExecutado: calcularPercentualExecutado(
        contrato.valores.empenhado,
        contrato.valores.global,
      ),
    }
  }

  // Cálculos temporais
  if (contrato.vigencia) {
    contratoEnriquecido.vigencia = {
      ...contrato.vigencia,
      prazoMeses: calcularPrazoMeses(
        contrato.vigencia.inicial,
        contrato.vigencia.final,
      ),
      diasRestantes: calcularDiasRestantes(contrato.vigencia.final),
      percentualTemporal: calcularPercentualTemporal(
        contrato.vigencia.inicial,
        contrato.vigencia.final,
      ),
      statusVigencia: determinarStatusVigencia(contrato.vigencia.final),
    }
  }

  // Análise de desempenho
  if (contrato.valores && contrato.vigencia) {
    contratoEnriquecido.analiseDesempenho = {
      indiceDesempenho: calcularIndiceDesempenho(
        contratoEnriquecido.valores.percentualExecutado,
        contratoEnriquecido.vigencia.percentualTemporal,
      ),
      classificacao: classificarDesempenho(
        contratoEnriquecido.valores.percentualExecutado,
        contratoEnriquecido.vigencia.percentualTemporal,
      ),
      mensagem: gerarAnaliseDesempenho(
        contratoEnriquecido.valores.percentualExecutado,
        contratoEnriquecido.vigencia.percentualTemporal,
      ),
    }
  }

  // Estatísticas de empenhos
  if (contrato.empenhos && contrato.empenhos.length > 0) {
    const rangeEmpenhos = calcularRangeEmpenhos(contrato.empenhos)
    contratoEnriquecido.estatisticasEmpenhos = {
      total: contrato.empenhos.length,
      valorMedio: calcularMediaEmpenhos(contrato.empenhos),
      maiorEmpenho: rangeEmpenhos.maior,
      menorEmpenho: rangeEmpenhos.menor,
    }
  }

  // Análise de alterações
  if (contrato.alteracoes) {
    const impacto = calcularImpactoAlteracoes(contrato.alteracoes)
    contratoEnriquecido.analiseAlteracoes = {
      totalAlteracoes: contrato.alteracoes.length,
      numeroProrrogacoes: contarProrrogacoes(contrato.alteracoes),
      impactoFinanceiro: impacto,
    }
  }

  // Análise documental
  if (contrato.documentos) {
    const conformidade = verificarConformidadeDocumental(contrato.documentos)
    contratoEnriquecido.analiseDocumental = {
      percentualConclusao: calcularPercentualDocumentos(contrato.documentos),
      conforme: conformidade.conforme,
      pendenciasObrigatorias: conformidade.pendenciasObrigatorias,
    }
  }

  return contratoEnriquecido
}

/**
 * Enriquece múltiplos contratos com indicadores
 */
export const enriquecerMultiplosContratos = (
  contratos: ContratoRelatorio[],
): ContratoRelatorio[] => {
  return contratos.map(enriquecerDadosContrato)
}
