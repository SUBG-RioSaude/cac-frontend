import { describe, it, expect } from 'vitest'
import { TipoAlteracao, StatusAlteracao, getBlocosObrigatorios } from '../alteracoes-contratuais'

describe('Alteracoes Contratuais Types', () => {
  it('deve ter os tipos de alteração definidos', () => {
    expect(TipoAlteracao.AditivoPrazo).toBe(1)
    expect(TipoAlteracao.AditivoQuantidade).toBe(4)
    expect(TipoAlteracao.Reajuste).toBe(7)
  })

  it('deve ter os status definidos', () => {
    expect(StatusAlteracao.Rascunho).toBe(1)
    expect(StatusAlteracao.AguardandoAprovacao).toBe(2)
    expect(StatusAlteracao.Vigente).toBe(3)
  })

  it('deve retornar blocos obrigatórios', () => {
    const blocos = getBlocosObrigatorios([TipoAlteracao.AditivoPrazo])
    expect(blocos).toBeInstanceOf(Set)
  })
})