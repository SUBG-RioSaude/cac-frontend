import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utilitários para validação e formatação de CNPJ
 */
export const cnpjUtils = {
  /**
   * Remove todos os caracteres não numéricos do CNPJ
   * @param cnpj - CNPJ com ou sem formatação
   * @returns CNPJ apenas com números
   */
  limpar: (cnpj: string): string => {
    return cnpj.replace(/\D/g, '')
  },

  /**
   * Formata um CNPJ para o padrão XX.XXX.XXX/XXXX-XX
   * @param cnpj - CNPJ com ou sem formatação
   * @returns CNPJ formatado ou string vazia se inválido
   */
  formatar: (cnpj: string): string => {
    const cnpjLimpo = cnpjUtils.limpar(cnpj)

    if (cnpjLimpo.length !== 14) {
      return cnpjLimpo // Retorna o que foi digitado se não tiver 14 dígitos
    }

    return cnpjLimpo.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  },

  /**
   * Valida se um CNPJ é válido
   * @param cnpj - CNPJ com ou sem formatação
   * @returns true se o CNPJ for válido, false caso contrário
   */
  validar: (cnpj: string): boolean => {
    const cnpjLimpo = cnpjUtils.limpar(cnpj)

    // Verifica se tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      return false
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) {
      return false
    }

    // Validação do primeiro dígito verificador
    let soma = 0
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpjLimpo[i]) * pesos1[i]
    }

    const resto1 = soma % 11
    const digito1 = resto1 < 2 ? 0 : 11 - resto1

    if (parseInt(cnpjLimpo[12]) !== digito1) {
      return false
    }

    // Validação do segundo dígito verificador
    soma = 0
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpjLimpo[i]) * pesos2[i]
    }

    const resto2 = soma % 11
    const digito2 = resto2 < 2 ? 0 : 11 - resto2

    return parseInt(cnpjLimpo[13]) === digito2
  },

  /**
   * Valida e retorna mensagem de erro se CNPJ for inválido
   * @param cnpj - CNPJ com ou sem formatação
   * @returns string vazia se válido, mensagem de erro se inválido
   */
  validarComMensagem: (cnpj: string): string => {
    const cnpjLimpo = cnpjUtils.limpar(cnpj)

    if (!cnpjLimpo) {
      return 'CNPJ é obrigatório'
    }

    if (cnpjLimpo.length !== 14) {
      return 'CNPJ deve ter 14 dígitos'
    }

    if (!cnpjUtils.validar(cnpj)) {
      return 'CNPJ inválido'
    }

    return ''
  },

  /**
   * Aplica máscara de CNPJ durante a digitação
   * @param value - Valor atual do input
   * @returns Valor com máscara aplicada
   */
  aplicarMascara: (value: string): string => {
    const cnpjLimpo = cnpjUtils.limpar(value)

    // Limita a 14 dígitos
    const cnpjLimitado = cnpjLimpo.slice(0, 14)

    // Aplica a máscara progressivamente
    if (cnpjLimitado.length <= 2) {
      return cnpjLimitado
    } else if (cnpjLimitado.length <= 5) {
      return cnpjLimitado.replace(/(\d{2})(\d+)/, '$1.$2')
    } else if (cnpjLimitado.length <= 8) {
      return cnpjLimitado.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3')
    } else if (cnpjLimitado.length <= 12) {
      return cnpjLimitado.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4')
    } else {
      return cnpjLimitado.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/,
        '$1.$2.$3/$4-$5',
      )
    }
  },
}
