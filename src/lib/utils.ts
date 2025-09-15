import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza texto para busca removendo acentos e caracteres especiais
 * Útil para comparações de busca em português brasileiro
 * @param text - Texto a ser normalizado
 * @returns Texto normalizado (sem acentos, lowercase, trimmed)
 */
export function normalizeText(text: string): string {
  if (!text) return ''
  
  return text
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove marcas diacríticas (acentos)
    .toLowerCase()
    .trim()
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

/**
 * Utilitários para validação e formatação de Inscrição Estadual
 */
interface IEUtils {
  limpar: (ie: string) => string
  mod11: (seq: string, pesos: number[], resto?: number) => number
  mod10: (seq: string, pesos: number[]) => number
  estados: Record<
    string,
    {
      len: number
      mask: string
      validate: (ie: string) => boolean
    }
  >
  validar: (value: string, estado?: string) => boolean
  aplicarMascara: (value: string, estado?: string) => string
}

export const ieUtils: IEUtils = {
  limpar: (ie: string): string => ie.replace(/\D/g, ''),

  // Funções de cálculo de dígito verificador
  mod11: (seq: string, pesos: number[], resto = 2) => {
    const soma = seq
      .split('')
      .reduce((acc, digit, i) => acc + parseInt(digit) * pesos[i], 0)
    const mod = soma % 11
    return mod < resto ? 0 : 11 - mod
  },

  mod10: (seq: string, pesos: number[]) => {
    let soma = 0
    for (let i = 0; i < seq.length; i++) {
      const produto = parseInt(seq[i]) * pesos[i % pesos.length]
      soma += produto > 9 ? Math.floor(produto / 10) + (produto % 10) : produto
    }
    const resto = soma % 10
    return resto === 0 ? 0 : 10 - resto
  },

  // Configurações compactas por estado
  estados: {
    // Acre
    AC: {
      len: 13,
      mask: '##.###.###/###-##',
      validate: (ie: string) => {
        if (ie.length !== 13 || !ie.startsWith('01')) return false
        const dv: number = ieUtils.mod11(
          ie.slice(0, 11),
          [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
        )
        return (
          parseInt(ie[11]) === dv &&
          parseInt(ie[12]) ===
            ieUtils.mod11(ie.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Alagoas
    AL: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9 || !/^24[0-3]/.test(ie.slice(0, 3))) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Amapá
    AP: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9 || !ie.startsWith('03')) return false
        let p = parseInt(ie.slice(0, 8))
        let r
        if (p >= 3000001 && p <= 3017000) {
          p -= 3000001
          r = 0
        } else if (p >= 3017001 && p <= 3019022) {
          p -= 3017001
          r = 1
        } else return false
        const dv = ((p % 11) + r) % 11 < 2 ? 0 : 11 - (((p % 11) + r) % 11)
        return parseInt(ie[8]) === dv
      },
    },

    // Amazonas
    AM: {
      len: 9,
      mask: '##.###.###-#',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Bahia
    BA: {
      len: 8,
      mask: '######-##',
      validate: (ie: string) => {
        if (ie.length === 8) {
          const primeiro = parseInt(ie[0])
          const sequencia = ie.slice(0, 6)

          // Segundo dígito verificador
          let dv2
          if (primeiro >= 6 && primeiro <= 9) {
            const soma = sequencia
              .split('')
              .reduce(
                (acc, digit, i) =>
                  acc + parseInt(digit) * [7, 6, 5, 4, 3, 2][i],
                0,
              )
            const resto = soma % 10
            dv2 = resto === 0 ? 0 : 10 - resto
          } else {
            dv2 = ieUtils.mod11(sequencia, [7, 6, 5, 4, 3, 2])
          }

          if (parseInt(ie[7]) !== dv2) return false

          // Primeiro dígito verificador
          const dv1: number = ieUtils.mod11(
            ie.slice(0, 7),
            [8, 7, 6, 5, 4, 3, 0, 2].slice(0, 7),
          )
          return parseInt(ie[6]) === dv1
        }
        return false
      },
    },

    // Ceará
    CE: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Distrito Federal
    DF: {
      len: 13,
      mask: '###########-##',
      validate: (ie: string) => {
        if (ie.length !== 13 || !ie.startsWith('07')) return false
        const dv1 = ieUtils.mod11(
          ie.slice(0, 11),
          [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
        )
        if (parseInt(ie[11]) !== dv1) return false
        const dv2 = ieUtils.mod11(
          ie.slice(0, 12),
          [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
        )
        return parseInt(ie[12]) === dv2
      },
    },

    // Espírito Santo
    ES: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Goiás
    GO: {
      len: 9,
      mask: '##.###.###-#',
      validate: (ie: string) => {
        if (ie.length !== 9 || !/^1[015]/.test(ie.slice(0, 2))) return false
        let dv: number = ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        const num = parseInt(ie.slice(0, 8))
        if (num === 11094402 && dv === 0) dv = 1
        else if (num === 11094402 && dv === 1) dv = 0
        return parseInt(ie[8]) === dv
      },
    },

    // Maranhão
    MA: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9 || !ie.startsWith('12')) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Mato Grosso
    MT: {
      len: 11,
      mask: '###########',
      validate: (ie: string) => {
        if (ie.length !== 11) return false
        return (
          parseInt(ie[10]) ===
          ieUtils.mod11(ie.slice(0, 10), [3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Mato Grosso do Sul
    MS: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9 || !ie.startsWith('28')) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Minas Gerais
    MG: {
      len: 13,
      mask: '###.###.###/####',
      validate: (ie: string) => {
        if (ie.length !== 13) return false
        const seq = ie.slice(0, 3) + '0' + ie.slice(3, 11)
        const dv1 = ieUtils.mod10(seq, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2])
        if (parseInt(ie[11]) !== dv1) return false
        const dv2 = ieUtils.mod11(
          ie.slice(0, 12),
          [3, 2, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
        )
        return parseInt(ie[12]) === dv2
      },
    },

    // Pará
    PA: {
      len: 9,
      mask: '##-######-#',
      validate: (ie: string) => {
        if (ie.length !== 9 || !ie.startsWith('15')) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Paraíba
    PB: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Paraná
    PR: {
      len: 10,
      mask: '########-##',
      validate: (ie: string) => {
        if (ie.length !== 10) return false
        const dv1 = ieUtils.mod11(ie.slice(0, 8), [3, 2, 7, 6, 5, 4, 3, 2])
        if (parseInt(ie[8]) !== dv1) return false
        const dv2 = ieUtils.mod11(ie.slice(0, 9), [4, 3, 2, 7, 6, 5, 4, 3, 2])
        return parseInt(ie[9]) === dv2
      },
    },

    // Pernambuco
    PE: {
      len: 9,
      mask: '#######-##',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        const dv1 = ieUtils.mod11(ie.slice(0, 7), [8, 7, 6, 5, 4, 3, 2])
        if (parseInt(ie[7]) !== dv1) return false
        const dv2 = ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        return parseInt(ie[8]) === dv2
      },
    },

    // Piauí
    PI: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Rio de Janeiro
    RJ: {
      len: 8,
      mask: '##.###.##-#',
      validate: (ie: string) => {
        if (ie.length !== 8) return false
        return (
          parseInt(ie[7]) ===
          ieUtils.mod11(ie.slice(0, 7), [2, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Rio Grande do Norte
    RN: {
      len: 10,
      mask: '##.###.###-#',
      validate: (ie: string) => {
        if (ie.length === 9 && ie.startsWith('20')) {
          return (
            parseInt(ie[8]) ===
            ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
          )
        }
        if (ie.length === 10 && ie.startsWith('20')) {
          return (
            parseInt(ie[9]) ===
            ieUtils.mod11(ie.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
          )
        }
        return false
      },
    },

    // Rio Grande do Sul
    RS: {
      len: 10,
      mask: '###/#######',
      validate: (ie: string) => {
        if (ie.length !== 10) return false
        return (
          parseInt(ie[9]) ===
          ieUtils.mod11(ie.slice(0, 9), [2, 9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Rondônia
    RO: {
      len: 14,
      mask: '###.#####-#',
      validate: (ie: string) => {
        if (ie.length === 9) {
          return (
            parseInt(ie[8]) ===
            ieUtils.mod11(ie.slice(0, 8), [6, 5, 4, 3, 2, 9, 8, 7])
          )
        }
        if (ie.length === 14) {
          return (
            parseInt(ie[13]) ===
            ieUtils.mod11(
              ie.slice(0, 13),
              [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
            )
          )
        }
        return false
      },
    },

    // Roraima
    RR: {
      len: 9,
      mask: '#####-##',
      validate: (ie: string) => {
        if (ie.length !== 9 || !ie.startsWith('24')) return false
        const soma = ie
          .slice(0, 8)
          .split('')
          .reduce(
            (acc, digit, i) =>
              acc + parseInt(digit) * [1, 2, 3, 4, 5, 6, 7, 8][i],
            0,
          )
        const dv = soma % 9
        return parseInt(ie[8]) === dv
      },
    },

    // Santa Catarina
    SC: {
      len: 9,
      mask: '###.###.###',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // São Paulo
    SP: {
      len: 12,
      mask: '###.###.###.###',
      validate: (ie: string) => {
        if (ie.length !== 12) return false
        // Primeiro dígito verificador
        const dv1 = ieUtils.mod11(ie.slice(0, 8), [1, 3, 4, 5, 6, 7, 8, 10])
        if (parseInt(ie[8]) !== dv1) return false
        // Segundo dígito verificador
        const dv2 = ieUtils.mod11(
          ie.slice(0, 11),
          [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2],
        )
        return parseInt(ie[11]) === dv2
      },
    },

    // Sergipe
    SE: {
      len: 9,
      mask: '#########',
      validate: (ie: string) => {
        if (ie.length !== 9) return false
        return (
          parseInt(ie[8]) ===
          ieUtils.mod11(ie.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2])
        )
      },
    },

    // Tocantins
    TO: {
      len: 11,
      mask: '###########',
      validate: (ie: string) => {
        if (ie.length === 9 || ie.length === 11) {
          const len = ie.length
          const seq = len === 11 ? ie.slice(2, len - 1) : ie.slice(0, len - 1)
          const dv = ieUtils.mod11(
            seq,
            len === 11 ? [9, 8, 7, 6, 5, 4, 3, 2] : [9, 8, 7, 6, 5, 4, 3, 2],
          )
          return parseInt(ie[len - 1]) === dv
        }
        return false
      },
    },
  } as Record<
    string,
    { len: number; mask: string; validate: (ie: string) => boolean }
  >,

  validar: (ie: string, estado?: string): boolean => {
    if (!ie) return false

    const ieUpper = ie.toUpperCase()
    if (ieUpper === 'ISENTO' || ieUpper === 'ISENTA') return true

    const ieLimpa = ieUtils.limpar(ie)
    if (!/^\d+$/.test(ieLimpa) || /^(\d)\1+$/.test(ieLimpa)) return false

    if (!estado) return ieLimpa.length >= 8 && ieLimpa.length <= 14

    const config = ieUtils.estados[estado.toUpperCase()]
    if (!config) return ieLimpa.length >= 8 && ieLimpa.length <= 14

    return config.validate(ieLimpa)
  },

  aplicarMascara: (value: string, estado?: string): string => {
    const ieLimpa = ieUtils.limpar(value)

    if (!estado || !ieUtils.estados[estado.toUpperCase()]) {
      // Máscara padrão
      return ieLimpa.length <= 9
        ? ieLimpa.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3')
        : ieLimpa.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3.$4')
    }

    const { mask } = ieUtils.estados[estado.toUpperCase()]
    let pos = 0
    return mask.replace(/#/g, () =>
      pos < ieLimpa.length ? ieLimpa[pos++] : '',
    )
  },
}

/**
 * Utilitários para validação e formatação de Inscrição Municipal
 */
export const imUtils = {
  /**
   * Remove todos os caracteres não numéricos da IM
   */
  limpar: (im: string): string => {
    return im.replace(/\D/g, '')
  },

  /**
   * Configurações conhecidas por cidade (principais capitais)
   */
  cidadesConfig: {
    SAO_PAULO: {
      nome: 'São Paulo',
      mascara: '#.###.###-#',
      tamanho: 8,
      validador: (im: string): boolean => {
        const imNumeros = imUtils.limpar(im)
        if (imNumeros.length !== 8) return false
        if (/^(\d)\1+$/.test(imNumeros)) return false

        // Validação básica para São Paulo
        return parseInt(imNumeros[0]) > 0
      },
    },
    RIO_DE_JANEIRO: {
      nome: 'Rio de Janeiro',
      mascara: '##.###.##-#',
      tamanho: 8,
      validador: (im: string): boolean => {
        const imNumeros = imUtils.limpar(im)
        if (imNumeros.length !== 8) return false
        if (/^(\d)\1+$/.test(imNumeros)) return false
        return true
      },
    },
    BELO_HORIZONTE: {
      nome: 'Belo Horizonte',
      mascara: '###.###.###-##',
      tamanho: 11,
      validador: (im: string): boolean => {
        const imNumeros = imUtils.limpar(im)
        if (imNumeros.length !== 11) return false
        if (/^(\d)\1+$/.test(imNumeros)) return false
        return true
      },
    },
  } as Record<
    string,
    {
      nome: string
      mascara: string
      tamanho: number
      validador: (im: string) => boolean
    }
  >,

  /**
   * Valida formato da IM baseado no estado
   */
  validar: (im: string, estado?: string): boolean => {
    if (!im) return false

    const imUpperCase = im.toUpperCase()
    if (imUpperCase === 'ISENTO' || imUpperCase === 'ISENTA') return true

    const imLimpa = imUtils.limpar(im)

    // Validação básica genérica: IM deve ter entre 5 e 15 dígitos
    if (imLimpa.length < 5 || imLimpa.length > 15) {
      return false
    }

    // Verifica se não são todos dígitos iguais
    if (/^(\d)\1+$/.test(imLimpa)) {
      return false
    }

    // Validações específicas por estado
    if (estado) {
      switch (estado.toUpperCase()) {
        case 'RJ':
          return imUtils.validarRJ(imLimpa)
        default:
          // Para outros estados, usa validação genérica
          return true
      }
    }

    return true
  },

  /**
   * Validação específica do Rio de Janeiro
   * Formato: 8 dígitos com cálculo de DV
   */
  validarRJ: (im: string): boolean => {
    if (im.length !== 8) return false

    try {
      // Calcula primeiro dígito verificador
      const pesos1 = [2, 7, 6, 5, 4, 3, 2]
      let soma = 0

      for (let i = 0; i < 7; i++) {
        soma += parseInt(im[i]) * pesos1[i]
      }

      let dv = soma % 11
      if (dv < 2) {
        dv = 0
      } else {
        dv = 11 - dv
      }

      return parseInt(im[7]) === dv
    } catch {
      return false
    }
  },

  /**
   * Aplica máscara da IM baseado no estado
   */
  aplicarMascara: (value: string, estado?: string): string => {
    const imLimpa = imUtils.limpar(value)

    // Limita a 15 dígitos no máximo
    const imLimitada = imLimpa.slice(0, 15)

    // Máscaras específicas por estado
    if (estado) {
      switch (estado.toUpperCase()) {
        case 'RJ':
          // Rio de Janeiro: 8 dígitos no formato ##.###.##-#
          if (imLimitada.length <= 8) {
            if (imLimitada.length <= 2) return imLimitada
            if (imLimitada.length <= 5)
              return imLimitada.replace(/(\d{2})(\d+)/, '$1.$2')
            if (imLimitada.length <= 7)
              return imLimitada.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3')
            return imLimitada.replace(
              /(\d{2})(\d{3})(\d{2})(\d+)/,
              '$1.$2.$3-$4',
            )
          }
          break
        default:
          // Máscara genérica para outros estados
          break
      }
    }

    // Máscara genérica baseada no tamanho
    if (imLimitada.length <= 6) {
      return imLimitada.replace(/(\d{3})(\d+)/, '$1-$2')
    } else if (imLimitada.length <= 8) {
      return imLimitada.replace(/(\d{4})(\d+)/, '$1-$2')
    } else if (imLimitada.length <= 10) {
      return imLimitada.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2-$3')
    } else {
      return imLimitada.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4')
    }
  },
}

/**
 * Utilitários para formatação e validação monetária
 */
/**
 * Utilitários para formatação segura de datas
 */
export const dateUtils = {
  /**
   * Formata uma data string da API para o formato brasileiro, tratando timezone de forma segura
   * @param dateString - Data no formato ISO da API (ex: "2031-09-01T00:00:00")
   * @returns Data formatada no padrão brasileiro (ex: "01/09/2031")
   */
  formatarDataUTC: (dateString: string): string => {
    if (!dateString) return ''
    
    try {
      // Parse a data como UTC para evitar problemas de timezone
      // Se já tem timezone (Z ou +/-), usa como está
      // Se não tem, adiciona 'Z' para forçar UTC
      const isoString = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 10) 
        ? dateString 
        : dateString + 'Z'
      
      const date = new Date(isoString)
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        return ''
      }
      
      // Formata usando UTC para evitar conversão de timezone
      return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    } catch (error) {
      return ''
    }
  },

  /**
   * Formata uma data string da API para formato brasileiro com opções customizadas
   * @param dateString - Data no formato ISO da API
   * @param options - Opções de formatação (opcional)
   * @returns Data formatada
   */
  formatarDataUTCCustom: (
    dateString: string, 
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    if (!dateString) return ''
    
    try {
      const isoString = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 10)
        ? dateString 
        : dateString + 'Z'
      
      const date = new Date(isoString)
      
      if (isNaN(date.getTime())) {
        return ''
      }
      
      const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
      
      return date.toLocaleDateString('pt-BR', { ...defaultOptions, ...options })
    } catch (error) {
      return ''
    }
  }
}

export const currencyUtils = {
  /**
   * Remove todos os caracteres não numéricos de um valor monetário
   * @param value - Valor com ou sem formatação
   * @returns Valor apenas com números, ponto decimal e sinal negativo
   */
  limpar: (value: string): string => {
    return value.replace(/[^\d,-]/g, '').replace(',', '.')
  },

  /**
   * Formata um valor numérico para o padrão monetário brasileiro (R$)
   * @param value - Valor numérico ou string
   * @returns Valor formatado como R$ 1.234,56
   */
  formatar: (value: string | number): string => {
    const numericValue =
      typeof value === 'string'
        ? parseFloat(currencyUtils.limpar(value))
        : value

    if (isNaN(numericValue) || numericValue === 0) {
      return 'R$ 0,00'
    }

    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue)
    // Substitui NBSP por espaço regular para facilitar matching em testes e consistência visual
    return formatted.replace(/\u00a0/g, ' ')
  },

  /**
   * Aplica máscara monetária durante a digitação
   * @param value - Valor atual do input
   * @returns Valor com máscara aplicada
   */
  aplicarMascara: (value: string): string => {
    // Detectar se há sinal negativo
    const isNegative = value.startsWith('-')
    
    // Remove tudo exceto números
    const apenasNumeros = value.replace(/\D/g, '')

    // Se vazio, retorna vazio
    if (!apenasNumeros) return isNegative ? '-' : ''

    // Converte para número (centavos)
    const numeroEmCentavos = parseInt(apenasNumeros)
    let numeroEmReais = numeroEmCentavos / 100

    // Aplicar sinal negativo se necessário
    if (isNegative) {
      numeroEmReais = -numeroEmReais
    }

    // Formata como moeda
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeroEmReais)
    return formatted.replace(/\u00a0/g, ' ')
  },

  /**
   * Valida se um valor monetário é válido
   * @param value - Valor com ou sem formatação
   * @returns true se o valor for válido e diferente de zero
   */
  validar: (value: string): boolean => {
    if (!value || value.trim() === '') return false

    const valorLimpo = currencyUtils.limpar(value)
    const numeroValue = parseFloat(valorLimpo)

    return !isNaN(numeroValue) && numeroValue !== 0
  },

  /**
   * Converte valor formatado para número
   * @param value - Valor formatado (R$ 1.234,56)
   * @returns Número decimal
   */
  paraNumero: (value: string): number => {
    const valorLimpo = currencyUtils.limpar(value)
    return parseFloat(valorLimpo) || 0
  },

  /**
   * Converte número para string no formato para APIs
   * @param value - Valor numérico
   * @returns String no formato "1234.56"
   */
  paraAPI: (value: number): string => {
    return value.toFixed(2)
  },
}

export const cepUtils = {
  /**
   * Remove todos os caracteres não numéricos de um CEP
   * @param cep - CEP com ou sem formatação
   * @returns CEP apenas com números
   */
  limpar: (cep: string): string => {
    if (!cep) return ''
    return cep.replace(/\D/g, '')
  },

  /**
   * Formata CEP no padrão brasileiro (XXXXX-XXX)
   * @param cep - CEP com ou sem formatação
   * @returns CEP formatado como 12345-678
   */
  formatar: (cep: string): string => {
    if (!cep) return ''
    
    const cepLimpo = cepUtils.limpar(cep)
    
    if (cepLimpo.length !== 8) {
      return cep // Retorna original se não tiver 8 dígitos
    }
    
    return cepLimpo.replace(/^(\d{5})(\d{3})/, '$1-$2')
  },

  /**
   * Valida se um CEP é válido (8 dígitos)
   * @param cep - CEP para validar
   * @returns true se válido
   */
  validar: (cep: string): boolean => {
    const cepLimpo = cepUtils.limpar(cep)
    return cepLimpo.length === 8
  },

  /**
   * Aplica máscara de CEP durante a digitação
   * @param value - Valor atual do input
   * @returns Valor com máscara aplicada
   */
  aplicarMascara: (value: string): string => {
    const cepLimpo = cepUtils.limpar(value)
    
    // Limita a 8 dígitos
    const cepLimitado = cepLimpo.slice(0, 8)
    
    if (cepLimitado.length <= 5) {
      return cepLimitado
    } else {
      return cepLimitado.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
    }
  }
}

export const phoneUtils = {
  /**
   * Remove todos os caracteres não numéricos de um telefone
   * @param phone - Telefone com ou sem formatação
   * @returns Telefone apenas com números
   */
  limpar: (phone: string): string => {
    if (!phone) return ''
    return phone.replace(/\D/g, '')
  },

  /**
   * Formata telefone brasileiro (celular ou fixo)
   * @param phone - Telefone com ou sem formatação
   * @returns Telefone formatado
   */
  formatar: (phone: string): string => {
    if (!phone) return ''
    
    const phoneLimpo = phoneUtils.limpar(phone)
    
    // Celular: (XX) 9XXXX-XXXX
    if (phoneLimpo.length === 11) {
      return phoneLimpo.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    
    // Fixo: (XX) XXXX-XXXX
    if (phoneLimpo.length === 10) {
      return phoneLimpo.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    // Retorna original se não seguir padrão
    return phone
  },

  /**
   * Valida se um telefone brasileiro é válido
   * @param phone - Telefone para validar
   * @returns true se válido (10 ou 11 dígitos)
   */
  validar: (phone: string): boolean => {
    const phoneLimpo = phoneUtils.limpar(phone)
    return phoneLimpo.length === 10 || phoneLimpo.length === 11
  },

  /**
   * Aplica máscara de telefone durante a digitação
   * @param value - Valor atual do input
   * @returns Valor com máscara aplicada
   */
  aplicarMascara: (value: string): string => {
    const phoneLimpo = phoneUtils.limpar(value)
    
    // Limita a 11 dígitos
    const phoneLimitado = phoneLimpo.slice(0, 11)
    
    if (phoneLimitado.length <= 2) {
      return phoneLimitado.length > 0 ? `(${phoneLimitado}` : phoneLimitado
    } else if (phoneLimitado.length <= 6) {
      return phoneLimitado.replace(/^(\d{2})(\d+)/, '($1) $2')
    } else if (phoneLimitado.length <= 10) {
      return phoneLimitado.replace(/^(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
    } else {
      return phoneLimitado.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }
}

/**
 * Utilitários para formatação e validação de percentuais
 */
export const percentualUtils = {
  /**
   * Formata um percentual removendo zeros à esquerda desnecessários
   * @param valor - Valor numérico do percentual
   * @returns Percentual formatado como string
   */
  formatar: (valor: number): string => {
    if (isNaN(valor) || valor === null || valor === undefined) {
      return '0'
    }
    
    // Converte para número e formata com até 2 casas decimais
    const numeroFormatado = Number(valor.toFixed(2))
    
    // Remove zeros desnecessários e retorna como string
    return numeroFormatado.toString()
  },

  /**
   * Valida se um valor de percentual é válido (0-100 com até 2 casas decimais)
   * @param valor - Valor a ser validado (string ou number)
   * @returns true se válido, false caso contrário
   */
  validar: (valor: string | number): boolean => {
    const valorStr = valor.toString().replace(',', '.')
    const numero = parseFloat(valorStr)
    
    if (isNaN(numero)) return false
    if (numero < 0 || numero > 100) return false
    
    // Verifica se tem no máximo 2 casas decimais
    const partesDecimais = valorStr.split('.')[1]
    if (partesDecimais && partesDecimais.length > 2) {
      return false
    }
    
    return true
  },

  /**
   * Valida percentual com mensagem de erro
   * @param valor - Valor a ser validado
   * @returns string vazia se válido, mensagem de erro se inválido
   */
  validarComMensagem: (valor: string | number): string => {
    if (valor === '' || valor === null || valor === undefined) {
      return 'Percentual é obrigatório'
    }
    
    const valorStr = valor.toString().replace(',', '.')
    const numero = parseFloat(valorStr)
    
    if (isNaN(numero)) {
      return 'Percentual deve ser um número válido'
    }
    
    if (numero < 0) {
      return 'Percentual não pode ser negativo'
    }
    
    if (numero > 100) {
      return 'Percentual não pode ser maior que 100%'
    }
    
    // Verifica se tem no máximo 2 casas decimais
    const partesDecimais = valorStr.split('.')[1]
    if (partesDecimais && partesDecimais.length > 2) {
      return 'Percentual pode ter no máximo 2 casas decimais'
    }
    
    return ''
  },

  /**
   * Normaliza valor de percentual para formato brasileiro durante digitação
   * @param valor - Valor digitado
   * @returns Valor normalizado
   */
  normalizarEntrada: (valor: string): string => {
    if (!valor) return ''
    
    // Remove caracteres não numéricos exceto vírgula e ponto
    let valorLimpo = valor.replace(/[^0-9.,]/g, '')
    
    // Substitui vírgula por ponto
    valorLimpo = valorLimpo.replace(',', '.')
    
    // Evita múltiplos pontos
    const pontos = valorLimpo.split('.')
    if (pontos.length > 2) {
      valorLimpo = pontos[0] + '.' + pontos.slice(1).join('')
    }
    
    // Limita a 2 casas decimais
    if (valorLimpo.includes('.')) {
      const [inteira, decimal] = valorLimpo.split('.')
      const decimalLimitado = decimal ? decimal.slice(0, 2) : ''
      valorLimpo = inteira + (decimalLimitado ? '.' + decimalLimitado : '')
    }
    
    // Limita valor máximo a 100
    const numero = parseFloat(valorLimpo)
    if (!isNaN(numero) && numero > 100) {
      return '100'
    }
    
    return valorLimpo
  },

  /**
   * Converte string para número percentual
   * @param valor - Valor em string
   * @returns Número do percentual ou 0 se inválido
   */
  paraNumero: (valor: string): number => {
    if (!valor) return 0
    
    const valorNormalizado = valor.replace(',', '.')
    const numero = parseFloat(valorNormalizado)
    
    return isNaN(numero) ? 0 : numero
  }
}
