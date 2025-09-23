import { describe, it, expect } from 'vitest'
import { currencyUtils, cepUtils, phoneUtils } from '@/lib/utils'

describe('currencyUtils', () => {
  it('formata valores positivos corretamente (number)', () => {
    const out = currencyUtils.formatar(1234.56)
    expect(out).toContain('R$')
    expect(out).toContain('1.234,56')
  })

  it('formata valores negativos corretamente', () => {
    const out = currencyUtils.formatar(-9876.54)
    expect(out).toContain('R$')
    expect(out).toContain('9.876,54')
    expect(out).toMatch(/^-|\s-|-|\(R\$\)/) // deve indicar negativo
  })

  it('formata zero como "R$ 0,00"', () => {
    expect(currencyUtils.formatar(0)).toBe('R$ 0,00')
  })

  it('aceita entrada como string com símbolo e separadores', () => {
    const out = currencyUtils.formatar('R$ 1.234,56')
    expect(out).toContain('R$')
    expect(out).toContain('1.234,56')
  })

  it('lida com valores inválidos (string não numérica e NaN)', () => {
    expect(currencyUtils.formatar('abc')).toBe('R$ 0,00')
    // @ts-expect-error testando entrada inválida de propósito
    expect(currencyUtils.formatar(NaN)).toBe('R$ 0,00')
  })

  it('lida com valores extremos (muito grandes e muito pequenos)', () => {
    const grande = currencyUtils.formatar(1_000_000_000_000.99)
    expect(grande).toContain('R$')
    expect(grande).toContain('1.000.000.000.000,99')

    const pequeno = currencyUtils.formatar(0.01)
    expect(pequeno).toContain('R$')
    expect(pequeno).toContain('0,01')
  })

  it('paraAPI retorna string com 2 casas decimais', () => {
    expect(currencyUtils.paraAPI(1234.5)).toBe('1234.50')
    expect(currencyUtils.paraAPI(0)).toBe('0.00')
  })
})

describe('cepUtils', () => {
  it('formata CEP padrão (12345678 → 12345-678)', () => {
    expect(cepUtils.formatar('12345678')).toBe('12345-678')
  })

  it('limpa caracteres especiais do CEP', () => {
    expect(cepUtils.limpar('12.345-678')).toBe('12345678')
  })

  it('valida CEPs válidos/inválidos', () => {
    expect(cepUtils.validar('12345678')).toBe(true)
    expect(cepUtils.validar('1234567')).toBe(false)
    expect(cepUtils.validar('')).toBe(false)
  })

  it('aplica máscara durante a digitação', () => {
    expect(cepUtils.aplicarMascara('1')).toBe('1')
    expect(cepUtils.aplicarMascara('12345')).toBe('12345')
    expect(cepUtils.aplicarMascara('123456')).toBe('12345-6')
    expect(cepUtils.aplicarMascara('12345678')).toBe('12345-678')
  })

  it('casos edge (strings vazias, valores inválidos)', () => {
    expect(cepUtils.limpar('')).toBe('')
    expect(cepUtils.formatar('')).toBe('')
    expect(cepUtils.formatar('1234')).toBe('1234') // retorna original quando incompleto
  })
})

describe('phoneUtils', () => {
  it('formata celular com 11 dígitos', () => {
    expect(phoneUtils.formatar('11987654321')).toBe('(11) 98765-4321')
  })

  it('formata telefone fixo com 10 dígitos', () => {
    expect(phoneUtils.formatar('1132654321')).toBe('(11) 3265-4321')
  })

  it('valida números válidos/inválidos', () => {
    expect(phoneUtils.validar('11987654321')).toBe(true)
    expect(phoneUtils.validar('1132654321')).toBe(true)
    expect(phoneUtils.validar('123')).toBe(false)
  })

  it('aplica máscara durante digitação', () => {
    expect(phoneUtils.aplicarMascara('1')).toBe('(1')
    expect(phoneUtils.aplicarMascara('11')).toBe('(11')
    expect(phoneUtils.aplicarMascara('119')).toBe('(11) 9')
    expect(phoneUtils.aplicarMascara('1132')).toBe('(11) 32')
    expect(phoneUtils.aplicarMascara('113265')).toBe('(11) 3265')
    expect(phoneUtils.aplicarMascara('1132654321')).toBe('(11) 3265-4321')
    expect(phoneUtils.aplicarMascara('11987654321')).toBe('(11) 98765-4321')
  })

  it('casos edge (números incompletos)', () => {
    expect(phoneUtils.formatar('')).toBe('')
    expect(phoneUtils.formatar('12')).toBe('12') // retorna original quando incompleto
  })
})
