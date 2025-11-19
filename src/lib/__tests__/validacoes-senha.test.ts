import { describe, it, expect } from 'vitest'

import {
  calcularForcaSenha,
  senhaEValida,
  validarRequisitosSenha,
  type RequisitoSenha,
} from '../validacoes-senha'

describe('validacoes-senha utilitário', () => {
  describe('validarRequisitosSenha', () => {
    it('deve identificar todos os requisitos atendidos incluindo confirmação', () => {
      const requisitos = validarRequisitosSenha('SenhaForte!1', 'SenhaForte!1')

      expect(requisitos).toEqual([
        { text: 'Mínimo de 10 caracteres', met: true },
        { text: 'Pelo menos uma letra maiúscula', met: true },
        { text: 'Pelo menos uma letra minúscula', met: true },
        { text: 'Pelo menos um número', met: true },
        { text: 'Pelo menos um caractere especial', met: true },
        { text: 'Senhas coincidem', met: true },
      ])
      expect(senhaEValida(requisitos)).toBe(true)
    })

    it('deve apontar requisitos não atendidos e falha na confirmação', () => {
      const requisitos = validarRequisitosSenha('curta', 'diferente')

      const mapaRequisitos = requisitos.reduce<Record<string, boolean>>(
        (acc, req) => {
          acc[req.text] = req.met
          return acc
        },
        {},
      )

      expect(mapaRequisitos['Mínimo de 10 caracteres']).toBe(false)
      expect(mapaRequisitos['Pelo menos uma letra maiúscula']).toBe(false)
      expect(mapaRequisitos['Pelo menos um número']).toBe(false)
      expect(mapaRequisitos['Pelo menos um caractere especial']).toBe(false)
      expect(mapaRequisitos['Senhas coincidem']).toBe(false)
      expect(senhaEValida(requisitos)).toBe(false)
    })
  })

  describe('calcularForcaSenha', () => {
    const criarRequisitos = (total: number, atendidos: number): RequisitoSenha[] =>
      Array.from({ length: total }, (_, index) => ({
        text: `Regra ${index + 1}`,
        met: index < atendidos,
      }))

    it('deve classificar senha forte quando 100% das regras são atendidas', () => {
      const resultado = calcularForcaSenha(criarRequisitos(5, 5))
      expect(resultado).toMatchObject({
        porcentagem: 100,
        cor: '#10b981',
        nivel: 'Forte',
      })
    })

    it('deve identificar senha média quando ~60% das regras são atendidas', () => {
      const resultado = calcularForcaSenha(criarRequisitos(5, 3))
      expect(resultado).toMatchObject({
        porcentagem: 60,
        cor: '#f59e0b',
        nivel: 'Média',
      })
    })

    it('deve retornar nível fraco quando 40% das regras são atendidas', () => {
      const resultado = calcularForcaSenha(criarRequisitos(5, 2))
      expect(resultado).toMatchObject({
        porcentagem: 40,
        cor: '#f97316',
        nivel: 'Fraca',
      })
    })

    it('deve indicar senha muito fraca abaixo de 40%', () => {
      const resultado = calcularForcaSenha(criarRequisitos(5, 1))
      expect(resultado).toMatchObject({
        porcentagem: 20,
        cor: '#ef4444',
        nivel: 'Muito fraca',
      })
    })
  })
})

