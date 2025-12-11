/**
 * ==========================================
 * UTILITÁRIOS PARA GERAÇÃO DE PDF
 * ==========================================
 * Funções auxiliares para formatação e manipulação de dados em PDFs
 */

import { currencyUtils, dateUtils, cnpjUtils } from '@/lib/utils'

// ========== FORMATAÇÃO DE DADOS ==========

/**
 * Formata valor monetário para o PDF
 */
export const formatarMoeda = (valor: number): string => {
  return currencyUtils.formatar(valor)
}

/**
 * Formata data ISO para DD/MM/YYYY
 */
export const formatarData = (dataISO: string): string => {
  if (!dataISO) return '-'
  return dateUtils.formatarDataUTC(dataISO)
}

/**
 * Formata data ISO para DD/MM/YYYY às HH:MM
 */
export const formatarDataHora = (dataISO: string): string => {
  if (!dataISO) return '-'

  const data = new Date(dataISO)
  const dataFormatada = data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Transforma "28/12/2024, 14:30" em "28/12/2024 às 14:30"
  return dataFormatada.replace(',', ' às')
}

/**
 * Formata CNPJ
 */
export const formatarCNPJ = (cnpj: string): string => {
  if (!cnpj) return '-'
  return cnpjUtils.formatar(cnpj)
}

/**
 * Formata percentual
 */
export const formatarPercentual = (valor: number, casasDecimais = 2): string => {
  return `${valor.toFixed(casasDecimais)}%`
}

/**
 * Formata número com separador de milhares
 */
export const formatarNumero = (valor: number, casasDecimais = 0): string => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })
}

// ========== TRUNCAMENTO DE TEXTO ==========

/**
 * Trunca texto para caber no PDF
 */
export const truncarTexto = (texto: string, maxCaracteres: number): string => {
  if (!texto) return ''
  if (texto.length <= maxCaracteres) return texto
  return `${texto.substring(0, maxCaracteres)}...`
}

/**
 * Quebra texto em múltiplas linhas
 */
export const quebrarTexto = (
  texto: string,
  caracteresPorlinha: number,
): string[] => {
  if (!texto) return []

  const palavras = texto.split(' ')
  const linhas: string[] = []
  let linhaAtual = ''

  for (const palavra of palavras) {
    const testeLinhaAtual = linhaAtual
      ? `${linhaAtual} ${palavra}`
      : palavra

    if (testeLinhaAtual.length <= caracteresPorlinha) {
      linhaAtual = testeLinhaAtual
    } else {
      if (linhaAtual) {
        linhas.push(linhaAtual)
      }
      linhaAtual = palavra
    }
  }

  if (linhaAtual) {
    linhas.push(linhaAtual)
  }

  return linhas
}

// ========== CÁLCULOS E ANÁLISES ==========

/**
 * Calcula diferença em dias entre duas datas
 */
export const calcularDiferencaDias = (
  dataInicial: string,
  dataFinal: string,
): number => {
  const inicio = new Date(dataInicial)
  const fim = new Date(dataFinal)
  const diferencaMs = fim.getTime() - inicio.getTime()
  return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24))
}

/**
 * Calcula dias restantes até uma data
 */
export const calcularDiasRestantes = (dataFinal: string): number => {
  const hoje = new Date()
  const fim = new Date(dataFinal)
  const diferencaMs = fim.getTime() - hoje.getTime()
  return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24))
}

/**
 * Calcula percentual de execução temporal
 */
export const calcularPercentualTemporal = (
  dataInicial: string,
  dataFinal: string,
): number => {
  const hoje = new Date()
  const inicio = new Date(dataInicial)
  const fim = new Date(dataFinal)

  const totalDias = calcularDiferencaDias(dataInicial, dataFinal)
  const diasDecorridos = Math.floor(
    (hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (totalDias === 0) return 0
  const percentual = (diasDecorridos / totalDias) * 100

  return Math.min(100, Math.max(0, percentual))
}

// ========== VALIDAÇÃO ==========

/**
 * Verifica se um valor é válido (não null, undefined ou vazio)
 */
export const valorValido = (valor: any): boolean => {
  if (valor === null || valor === undefined) return false
  if (typeof valor === 'string' && valor.trim() === '') return false
  if (typeof valor === 'number' && isNaN(valor)) return false
  return true
}

/**
 * Retorna valor ou placeholder
 */
export const valorOuPadrao = (valor: any, padrao = '-'): string => {
  return valorValido(valor) ? String(valor) : padrao
}

// ========== SUMÁRIOS E TOTALIZAÇÕES ==========

/**
 * Calcula soma de valores
 */
export const somarValores = (valores: number[]): number => {
  return valores.reduce((soma, valor) => soma + (valor || 0), 0)
}

/**
 * Calcula média de valores
 */
export const calcularMedia = (valores: number[]): number => {
  if (valores.length === 0) return 0
  return somarValores(valores) / valores.length
}

/**
 * Encontra valor máximo
 */
export const valorMaximo = (valores: number[]): number => {
  if (valores.length === 0) return 0
  return Math.max(...valores)
}

/**
 * Encontra valor mínimo
 */
export const valorMinimo = (valores: number[]): number => {
  if (valores.length === 0) return 0
  return Math.min(...valores)
}

// ========== GERAÇÃO DE NOMES DE ARQUIVO ==========

/**
 * Gera nome de arquivo para o relatório
 */
export const gerarNomeArquivo = (
  tipo: string,
  numeroContrato?: string,
): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, -5) // Remove milliseconds

  const prefixo = numeroContrato
    ? `${tipo}-${numeroContrato.replace(/\//g, '-')}`
    : tipo

  return `relatorio-${prefixo}-${timestamp}.pdf`
}

// ========== ANÁLISE DE STATUS ==========

/**
 * Determina status baseado em dias restantes
 */
export const determinarStatusVigencia = (diasRestantes: number): string => {
  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes <= 30) return 'vencendo'
  return 'vigente'
}

/**
 * Determina cor baseada em percentual
 */
export const determinarCorPercentual = (percentual: number): string => {
  if (percentual < 50) return '#22c55e' // Verde
  if (percentual < 80) return '#f59e0b' // Amarelo
  return '#ef4444' // Vermelho
}

/**
 * Determina status de execução financeira
 */
export const determinarStatusExecucao = (
  percentualExecutado: number,
  percentualTemporal: number,
): 'normal' | 'atencao' | 'critico' => {
  const velocidade = percentualTemporal > 0
    ? percentualExecutado / percentualTemporal
    : 0

  if (velocidade < 0.7) return 'critico' // Execução muito lenta
  if (velocidade < 0.9) return 'atencao' // Execução lenta
  return 'normal' // Execução adequada
}

// ========== AGRUPAMENTO DE DADOS ==========

/**
 * Agrupa dados por chave
 */
export const agruparPor = <T>(
  dados: T[],
  chave: keyof T,
): Record<string, T[]> => {
  return dados.reduce(
    (grupos, item) => {
      const valor = String(item[chave])
      if (!grupos[valor]) {
        grupos[valor] = []
      }
      grupos[valor].push(item)
      return grupos
    },
    {} as Record<string, T[]>,
  )
}

/**
 * Ordena dados por chave
 */
export const ordenarPor = <T>(
  dados: T[],
  chave: keyof T,
  ordem: 'asc' | 'desc' = 'asc',
): T[] => {
  return [...dados].sort((a, b) => {
    const valorA = a[chave]
    const valorB = b[chave]

    if (typeof valorA === 'string' && typeof valorB === 'string') {
      return ordem === 'asc'
        ? valorA.localeCompare(valorB)
        : valorB.localeCompare(valorA)
    }

    if (typeof valorA === 'number' && typeof valorB === 'number') {
      return ordem === 'asc' ? valorA - valorB : valorB - valorA
    }

    return 0
  })
}

// ========== METADADOS DO RELATÓRIO ==========

/**
 * Gera metadados do PDF
 */
export const gerarMetadados = (tipo: string, numeroContrato?: string) => {
  return {
    title: `Relatório ${tipo}${numeroContrato ? ` - ${numeroContrato}` : ''}`,
    author: 'Sistema CAC',
    subject: `Relatório Contratual - ${tipo}`,
    keywords: 'contrato, relatório, gestão',
    creator: 'CAC Sistema de Contratos',
    producer: 'React PDF',
  }
}
