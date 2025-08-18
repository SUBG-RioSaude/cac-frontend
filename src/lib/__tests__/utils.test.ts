import { describe, it, expect } from 'vitest'
import { cn, cnpjUtils } from '../utils'

describe('cn', () => {
  it('deve combinar classes TailwindCSS corretamente', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('deve fazer merge de classes conflitantes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('deve lidar com condicionais', () => {
    const condicional = false
    const resultado = cn('text-red-500', condicional ? 'bg-blue-500' : 'bg-red-500')
    expect(resultado).toBe('text-red-500 bg-red-500')
  })
})

describe('cnpjUtils', () => {
  const cnpjValido = '11.222.333/0001-81'
  const cnpjValidoSemMascara = '11222333000181'
  const cnpjInvalido = '11.222.333/0001-82'
  const cnpjComDigitosIguais = '11.111.111/1111-11'

  describe('limpar', () => {
    it('deve remover todos os caracteres não numéricos', () => {
      expect(cnpjUtils.limpar('11.222.333/0001-81')).toBe('11222333000181')
      expect(cnpjUtils.limpar('11 222 333 0001 81')).toBe('11222333000181')
      expect(cnpjUtils.limpar('11-222-333-0001-81')).toBe('11222333000181')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      expect(cnpjUtils.limpar('')).toBe('')
    })
  })

  describe('formatar', () => {
    it('deve formatar CNPJ válido corretamente', () => {
      expect(cnpjUtils.formatar('11222333000181')).toBe('11.222.333/0001-81')
      expect(cnpjUtils.formatar('11.222.333/0001-81')).toBe(
        '11.222.333/0001-81',
      )
    })

    it('deve retornar valor original se não tiver 14 dígitos', () => {
      expect(cnpjUtils.formatar('1122233300018')).toBe('1122233300018')
      expect(cnpjUtils.formatar('112223330001812')).toBe('112223330001812')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      expect(cnpjUtils.formatar('')).toBe('')
    })
  })

  describe('validar', () => {
    it('deve validar CNPJ válido', () => {
      expect(cnpjUtils.validar(cnpjValido)).toBe(true)
      expect(cnpjUtils.validar(cnpjValidoSemMascara)).toBe(true)
    })

    it('deve invalidar CNPJ com dígito verificador incorreto', () => {
      expect(cnpjUtils.validar(cnpjInvalido)).toBe(false)
    })

    it('deve invalidar CNPJ com todos os dígitos iguais', () => {
      expect(cnpjUtils.validar(cnpjComDigitosIguais)).toBe(false)
      expect(cnpjUtils.validar('00000000000000')).toBe(false)
    })

    it('deve invalidar CNPJ com número incorreto de dígitos', () => {
      expect(cnpjUtils.validar('1122233300018')).toBe(false) // 13 dígitos
      expect(cnpjUtils.validar('112223330001812')).toBe(false) // 15 dígitos
    })

    it('deve invalidar string vazia', () => {
      expect(cnpjUtils.validar('')).toBe(false)
    })
  })

  describe('validarComMensagem', () => {
    it('deve retornar string vazia para CNPJ válido', () => {
      expect(cnpjUtils.validarComMensagem(cnpjValido)).toBe('')
      expect(cnpjUtils.validarComMensagem(cnpjValidoSemMascara)).toBe('')
    })

    it('deve retornar mensagem de obrigatório para string vazia', () => {
      expect(cnpjUtils.validarComMensagem('')).toBe('CNPJ é obrigatório')
    })

    it('deve retornar mensagem de dígitos insuficientes', () => {
      expect(cnpjUtils.validarComMensagem('1122233300018')).toBe(
        'CNPJ deve ter 14 dígitos',
      )
    })

    it('deve retornar mensagem de CNPJ inválido', () => {
      expect(cnpjUtils.validarComMensagem(cnpjInvalido)).toBe('CNPJ inválido')
      expect(cnpjUtils.validarComMensagem(cnpjComDigitosIguais)).toBe(
        'CNPJ inválido',
      )
    })
  })

  describe('aplicarMascara', () => {
    it('deve aplicar máscara progressivamente', () => {
      expect(cnpjUtils.aplicarMascara('11')).toBe('11')
      expect(cnpjUtils.aplicarMascara('112')).toBe('11.2')
      expect(cnpjUtils.aplicarMascara('11222')).toBe('11.222')
      expect(cnpjUtils.aplicarMascara('112223')).toBe('11.222.3')
      expect(cnpjUtils.aplicarMascara('11222333')).toBe('11.222.333')
      expect(cnpjUtils.aplicarMascara('112223330')).toBe('11.222.333/0')
      expect(cnpjUtils.aplicarMascara('1122233300')).toBe('11.222.333/00')
      expect(cnpjUtils.aplicarMascara('11222333000')).toBe('11.222.333/000')
      expect(cnpjUtils.aplicarMascara('112223330001')).toBe('11.222.333/0001')
      expect(cnpjUtils.aplicarMascara('1122233300018')).toBe(
        '11.222.333/0001-8',
      )
      expect(cnpjUtils.aplicarMascara('11222333000181')).toBe(
        '11.222.333/0001-81',
      )
    })

    it('deve limitar a 14 dígitos', () => {
      expect(cnpjUtils.aplicarMascara('112223330001812345')).toBe(
        '11.222.333/0001-81',
      )
    })

    it('deve remover caracteres não numéricos antes de aplicar máscara', () => {
      expect(cnpjUtils.aplicarMascara('11.222.333abc')).toBe('11.222.333')
      expect(cnpjUtils.aplicarMascara('11abc222def333')).toBe('11.222.333')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      expect(cnpjUtils.aplicarMascara('')).toBe('')
    })
  })
})
