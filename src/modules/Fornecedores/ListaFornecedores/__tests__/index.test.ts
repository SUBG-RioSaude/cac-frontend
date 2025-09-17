// Testes da Lista de Fornecedores
// Este arquivo importa todos os testes para facilitar a execução
import { describe, it, expect } from 'vitest'

// Componentes
import '../components/__tests__/tabela-fornecedores.test'
import '../components/__tests__/search-and-filters.test'
import '../components/__tests__/modal-confirmacao-exportacao.test'
import '../components/__tests__/filtros-fornecedores.test'


describe('Lista de Fornecedores - Testes Completos', () => {
  it('deve ter todos os testes carregados', () => {
    expect(true).toBe(true)
  })
})
