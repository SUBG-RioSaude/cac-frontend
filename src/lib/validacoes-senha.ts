/**
 * Utilitário para validação de senhas
 * Centraliza as regras de validação de senha do sistema
 */

export interface RequisitoSenha {
  text: string
  met: boolean
}

/**
 * Valida se a senha atende aos requisitos mínimos do sistema
 * 
 * Requisitos:
 * - Mínimo de 10 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 * 
 * Nota: A validação de histórico (últimas 5 senhas) é feita no backend
 */
export const validarRequisitosSenha = (
  senha: string,
  confirmarSenha?: string,
): RequisitoSenha[] => {
  const requisitos: RequisitoSenha[] = [
    {
      text: 'Mínimo de 10 caracteres',
      met: senha.length >= 10,
    },
    {
      text: 'Pelo menos uma letra maiúscula',
      met: /[A-Z]/.test(senha),
    },
    {
      text: 'Pelo menos uma letra minúscula',
      met: /[a-z]/.test(senha),
    },
    {
      text: 'Pelo menos um número',
      met: /[0-9]/.test(senha),
    },
    {
      text: 'Pelo menos um caractere especial',
      met: /[^a-zA-Z0-9]/.test(senha),
    },
  ]

  // Adiciona validação de confirmação se fornecida
  if (confirmarSenha !== undefined) {
    requisitos.push({
      text: 'Senhas coincidem',
      met: senha === confirmarSenha && senha.length > 0,
    })
  }

  return requisitos
}

/**
 * Valida se a senha é válida (todos os requisitos atendidos)
 */
export const senhaEValida = (requisitos: RequisitoSenha[]): boolean => {
  return requisitos.every((req) => req.met)
}

/**
 * Calcula a força da senha baseada nos requisitos atendidos
 * Retorna porcentagem (0-100) e cor correspondente
 */
export const calcularForcaSenha = (
  requisitos: RequisitoSenha[],
): { porcentagem: number; cor: string; nivel: string } => {
  const atendidos = requisitos.filter((req) => req.met).length
  const porcentagem = (atendidos / requisitos.length) * 100

  let cor = '#ef4444' // vermelho
  let nivel = 'Muito fraca'

  if (porcentagem >= 80) {
    cor = '#10b981' // verde
    nivel = 'Forte'
  } else if (porcentagem >= 60) {
    cor = '#f59e0b' // amarelo
    nivel = 'Média'
  } else if (porcentagem >= 40) {
    cor = '#f97316' // laranja
    nivel = 'Fraca'
  }

  return { porcentagem, cor, nivel }
}

/**
 * Constantes de validação
 */
export const SENHA_CONFIG = {
  MIN_CARACTERES: 10,
  MAX_HISTORICO: 5, // Número de senhas anteriores que não podem ser reutilizadas
} as const

