/**
 * Service para operações de empenhos
 */
import { executeWithFallback } from '@/lib/axios'
import type {
  Empenho,
  CriarEmpenhoPayload,
  AtualizarEmpenhoPayload
} from '../types/contrato'

/**
 * Lista empenhos por contrato
 */
export async function listarEmpenhosPorContrato(contratoId: string): Promise<Empenho[]> {
  const response = await executeWithFallback<Empenho[]>({
    method: 'get',
    url: `/empenhos/contratos/${contratoId}`,
  })
  return response.data || []
}

/**
 * Busca empenho por ID
 */
export async function buscarEmpenhoPorId(id: string): Promise<Empenho> {
  const response = await executeWithFallback<Empenho>({
    method: 'get',
    url: `/empenhos/${id}`,
  })
  return response.data
}

/**
 * Cria novo empenho
 */
export async function criarEmpenho(payload: CriarEmpenhoPayload): Promise<Empenho> {
  const response = await executeWithFallback<Empenho>({
    method: 'post',
    url: '/empenhos',
    data: payload,
  })
  return response.data
}

/**
 * Atualiza empenho existente
 */
export async function atualizarEmpenho(id: string, payload: AtualizarEmpenhoPayload): Promise<Empenho> {
  const response = await executeWithFallback<Empenho>({
    method: 'put',
    url: `/empenhos/${id}`,
    data: payload,
  })
  return response.data
}

/**
 * Exclui empenho
 */
export async function excluirEmpenho(id: string): Promise<void> {
  await executeWithFallback<void>({
    method: 'delete',
    url: `/empenhos/${id}`,
  })
}

/**
 * Valida número de empenho
 */
export function validarNumeroEmpenho(numeroEmpenho: string): { valido: boolean; erro?: string } {
    if (!numeroEmpenho) {
      return {
        valido: false,
        erro: 'Número do empenho é obrigatório'
      }
    }

    // Padrão: AAAANE999999 (ex.: 2025NE000123)
    const regex = /^(\d{4})NE(\d{6})$/
    const match = numeroEmpenho.match(regex)

    if (!match) {
      return {
        valido: false,
        erro: 'Número de empenho inválido. Use o formato AAAANE999999 (ex.: 2025NE000123)'
      }
    }

    const ano = parseInt(match[1])
    const anoAtual = new Date().getFullYear()

    // Validar ano (deve estar entre 2020 e anoAtual + 5)
    if (ano < 2020 || ano > anoAtual + 5) {
      return {
        valido: false,
        erro: `Ano deve estar entre 2020 e ${anoAtual + 5}`
      }
    }

    return { valido: true }
  }

/**
 * Valida valor do empenho
 */
export function validarValor(valor: number | string): { valido: boolean; erro?: string } {
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.')) : valor

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return {
        valido: false,
        erro: 'Valor deve ser um número positivo'
      }
    }

    if (valorNumerico > 999999999.99) {
      return {
        valido: false,
        erro: 'Valor não pode exceder R$ 999.999.999,99'
      }
    }

    return { valido: true }
  }

/**
 * Valida se a soma dos empenhos não excede o valor total do contrato
 */
export function validarLimiteContrato(
  empenhos: Empenho[], 
  novoValor: number, 
  valorTotalContrato: number,
  empenhoIdAtual?: string
): { valido: boolean; erro?: string } {
    // Soma dos empenhos existentes (excluindo o atual se estiver editando)
    const somaAtual = empenhos
      .filter(emp => emp.id !== empenhoIdAtual)
      .reduce((acc, emp) => acc + emp.valor, 0)

    const novasoma = somaAtual + novoValor

    if (novasoma > valorTotalContrato) {
      const valorDisponivel = valorTotalContrato - somaAtual
      return {
        valido: false,
        erro: `Valor excede o limite disponível do contrato. Valor disponível: R$ ${valorDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }
    }

    return { valido: true }
  }

/**
 * Calcula estatísticas dos empenhos
 */
export function calcularEstatisticas(empenhos: Empenho[], valorTotalContrato: number) {
    const valorTotalEmpenhado = empenhos.reduce((acc, emp) => acc + emp.valor, 0)
    const valorDisponivel = valorTotalContrato - valorTotalEmpenhado
    const percentualEmpenhado = valorTotalContrato > 0 ? (valorTotalEmpenhado / valorTotalContrato) * 100 : 0

    const unidadesComEmpenho = new Set(empenhos.map(emp => emp.unidadeSaudeId)).size

  return {
    totalEmpenhos: empenhos.length,
    valorTotalEmpenhado,
    valorDisponivel,
    percentualEmpenhado: Math.round(percentualEmpenhado * 100) / 100, // Arredondar para 2 casas decimais
    unidadesComEmpenho
  }
}