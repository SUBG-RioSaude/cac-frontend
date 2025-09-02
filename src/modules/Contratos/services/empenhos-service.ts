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
    if (!numeroEmpenho || numeroEmpenho.trim() === '') {
      return {
        valido: false,
        erro: 'Número do empenho é obrigatório'
      }
    }

    const numeroLimpo = numeroEmpenho.trim()
    
    // Extrair ano (primeiros 4 dígitos encontrados)
    const anoMatch = numeroLimpo.match(/\d{4}/)
    
    if (!anoMatch) {
      return {
        valido: false,
        erro: 'Número deve conter um ano válido (4 dígitos)'
      }
    }

    const anoNumerico = parseInt(anoMatch[0])
    const anoAtual = new Date().getFullYear()

    // Validar ano (deve estar entre 2020 e anoAtual + 5)
    if (anoNumerico < 2020 || anoNumerico > anoAtual + 5) {
      return {
        valido: false,
        erro: `Ano deve estar entre 2020 e ${anoAtual + 5}`
      }
    }

    // Verificar se tem pelo menos 5 caracteres
    if (numeroLimpo.length < 5) {
      return {
        valido: false,
        erro: 'Número de empenho deve ter pelo menos 5 caracteres'
      }
    }

    return { valido: true }
  }

/**
 * Valida valor do empenho
 */
export function validarValor(valor: number | string): { valido: boolean; erro?: string } {
    const valorNumerico = typeof valor === 'string' 
      ? parseFloat(valor.replace(/[^\d,.]/g, '').replace(',', '.')) 
      : valor

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return {
        valido: false,
        erro: 'Valor deve ser um número positivo'
      }
    }

    // Valor mínimo de R$ 100,00
    if (valorNumerico < 100) {
      return {
        valido: false,
        erro: 'Valor mínimo é R$ 100,00'
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
 * Valida data do empenho
 */
export function validarDataEmpenho(dataEmpenho: string): { valido: boolean; erro?: string } {
  if (!dataEmpenho) {
    return {
      valido: false,
      erro: 'Data do empenho é obrigatória'
    }
  }

  const data = new Date(dataEmpenho)
  const hoje = new Date()
  const umAnoAtras = new Date()
  umAnoAtras.setFullYear(hoje.getFullYear() - 1)

  if (isNaN(data.getTime())) {
    return {
      valido: false,
      erro: 'Data inválida'
    }
  }

  if (data > hoje) {
    return {
      valido: false,
      erro: 'Data não pode ser futura'
    }
  }

  if (data < umAnoAtras) {
    return {
      valido: false,
      erro: 'Data não pode ser anterior a um ano'
    }
  }

  return { valido: true }
}

/**
 * Valida se o número de empenho já existe
 */
export function validarNumeroEmpenhoUnico(
  numeroEmpenho: string, 
  empenhos: Empenho[], 
  empenhoIdAtual?: string
): { valido: boolean; erro?: string } {
  const numeroExistente = empenhos.find(emp => 
    emp.numeroEmpenho === numeroEmpenho && emp.id !== empenhoIdAtual
  )

  if (numeroExistente) {
    return {
      valido: false,
      erro: 'Este número de empenho já está sendo utilizado'
    }
  }

  return { valido: true }
}

/**
 * Calcula estatísticas dos empenhos
 */
export function calcularEstatisticas(empenhos: Empenho[], valorTotalContrato: number) {
    const valorTotalEmpenhado = empenhos.reduce((acc, emp) => acc + emp.valor, 0)
    const valorDisponivel = Math.max(0, valorTotalContrato - valorTotalEmpenhado)
    const percentualEmpenhado = valorTotalContrato > 0 ? (valorTotalEmpenhado / valorTotalContrato) * 100 : 0

    const unidadesComEmpenho = new Set(empenhos.map(emp => emp.unidadeSaudeId)).size

  return {
    totalEmpenhos: empenhos.length,
    valorTotalEmpenhado,
    valorDisponivel,
    percentualEmpenhado: Math.round(percentualEmpenhado * 100) / 100,
    unidadesComEmpenho
  }
}