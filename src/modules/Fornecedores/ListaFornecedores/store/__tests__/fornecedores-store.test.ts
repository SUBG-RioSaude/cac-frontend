import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFornecedoresStore } from '../fornecedores-store'

// Mock dos dados
vi.mock('../../data/fornecedores-mock', () => ({
  fornecedoresMock: [
    {
      id: '1',
      razaoSocial: 'Empresa Teste LTDA',
      cnpj: '11222333000181',
      contratosAtivos: 5,
      status: 'ativo',
      valorTotalContratos: 150000.00,
      endereco: {
        logradouro: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234-567',
      },
      contato: {
        telefone: '(11) 3333-4444',
        email: 'contato@empresa.com',
        responsavel: 'João Silva',
      },
      dataUltimaAtualizacao: '2024-01-15',
    },
    {
      id: '2',
      razaoSocial: 'Outra Empresa SA',
      cnpj: '22333444000192',
      contratosAtivos: 3,
      status: 'inativo',
      valorTotalContratos: 75000.00,
      endereco: {
        logradouro: 'Av. Outra',
        numero: '456',
        bairro: 'Vila Nova',
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20000-000',
      },
      contato: {
        telefone: '(21) 4444-5555',
        email: 'contato@outra.com',
        responsavel: 'Maria Santos',
      },
      dataUltimaAtualizacao: '2024-01-10',
    },
    {
      id: '3',
      razaoSocial: 'Terceira Empresa LTDA',
      cnpj: '33444555000203',
      contratosAtivos: 8,
      status: 'suspenso',
      valorTotalContratos: 300000.00,
      endereco: {
        logradouro: 'Rua Terceira',
        numero: '789',
        bairro: 'Bairro Novo',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        cep: '30000-000',
      },
      contato: {
        telefone: '(31) 5555-6666',
        email: 'contato@terceira.com',
        responsavel: 'Pedro Costa',
      },
      dataUltimaAtualizacao: '2024-01-20',
    },
  ],
}))

describe('useFornecedoresStore', () => {
  beforeEach(() => {
    // Limpa o store antes de cada teste
    const { result } = renderHook(() => useFornecedoresStore())
    act(() => {
      result.current.limparFiltros()
    })
  })

  it('deve inicializar com dados padrão', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    expect(result.current.fornecedores).toHaveLength(3)
    expect(result.current.fornecedoresFiltrados).toHaveLength(3)
    expect(result.current.termoPesquisa).toBe('')
    expect(result.current.filtros).toEqual({})
    expect(result.current.paginacao).toEqual({
      pagina: 1,
      itensPorPagina: 10,
      total: 3,
    })
    expect(result.current.fornecedoresSelecionados).toHaveLength(0)
  })

  it('deve definir termo de pesquisa', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setTermoPesquisa('Empresa Teste')
    })

    expect(result.current.termoPesquisa).toBe('Empresa Teste')
  })

  it('deve filtrar fornecedores por termo de pesquisa', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setTermoPesquisa('Empresa Teste')
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(1)
    expect(result.current.fornecedoresFiltrados[0].razaoSocial).toBe('Empresa Teste LTDA')
  })

  it('deve filtrar fornecedores por CNPJ', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setTermoPesquisa('11222333000181')
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(1)
    expect(result.current.fornecedoresFiltrados[0].cnpj).toBe('11222333000181')
  })

  it('deve filtrar fornecedores por status', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setFiltros({ status: ['ativo'] })
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(1)
    expect(result.current.fornecedoresFiltrados[0].status).toBe('ativo')
  })

  it('deve filtrar fornecedores por valor mínimo', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setFiltros({ valorMinimo: 100000 })
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(2)
    expect(result.current.fornecedoresFiltrados.every(f => f.valorTotalContratos >= 100000)).toBe(true)
  })

  it('deve filtrar fornecedores por valor máximo', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setFiltros({ valorMaximo: 100000 })
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(1)
    expect(result.current.fornecedoresFiltrados[0].valorTotalContratos).toBe(75000.00)
  })

  it('deve filtrar fornecedores por contratos ativos mínimo', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setFiltros({ contratosAtivosMinimo: 5 })
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(2)
    expect(result.current.fornecedoresFiltrados.every(f => f.contratosAtivos >= 5)).toBe(true)
  })

  it('deve filtrar fornecedores por contratos ativos máximo', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setFiltros({ contratosAtivosMaximo: 5 })
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(2)
    expect(result.current.fornecedoresFiltrados.every(f => f.contratosAtivos <= 5)).toBe(true)
  })

  it('deve aplicar múltiplos filtros simultaneamente', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setFiltros({
        status: ['ativo'],
        valorMinimo: 100000,
        contratosAtivosMinimo: 5,
      })
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(1)
    expect(result.current.fornecedoresFiltrados[0].status).toBe('ativo')
    expect(result.current.fornecedoresFiltrados[0].valorTotalContratos).toBeGreaterThanOrEqual(100000)
    expect(result.current.fornecedoresFiltrados[0].contratosAtivos).toBeGreaterThanOrEqual(5)
  })

  it('deve limpar todos os filtros', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    // Aplica filtros
    act(() => {
      result.current.setTermoPesquisa('Empresa Teste')
      result.current.setFiltros({ status: ['ativo'] })
    })

    // Limpa filtros
    act(() => {
      result.current.limparFiltros()
    })

    expect(result.current.termoPesquisa).toBe('')
    expect(result.current.filtros).toEqual({})
    expect(result.current.fornecedoresFiltrados).toHaveLength(3)
    expect(result.current.paginacao.pagina).toBe(1)
  })

  it('deve definir paginação', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    const novaPaginacao = {
      pagina: 2,
      itensPorPagina: 20,
      total: 3,
    }

    act(() => {
      result.current.setPaginacao(novaPaginacao)
    })

    expect(result.current.paginacao).toEqual(novaPaginacao)
  })

  it('deve selecionar fornecedor individual', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.selecionarFornecedor('1', true)
    })

    expect(result.current.fornecedoresSelecionados).toContain('1')
    expect(result.current.fornecedoresSelecionados).toHaveLength(1)
  })

  it('deve desselecionar fornecedor individual', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    // Seleciona primeiro
    act(() => {
      result.current.selecionarFornecedor('1', true)
    })

    // Desseleciona
    act(() => {
      result.current.selecionarFornecedor('1', false)
    })

    expect(result.current.fornecedoresSelecionados).not.toContain('1')
    expect(result.current.fornecedoresSelecionados).toHaveLength(0)
  })

  it('deve selecionar todos os fornecedores filtrados', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.selecionarTodosFornecedores(true)
    })

    expect(result.current.fornecedoresSelecionados).toHaveLength(3)
    expect(result.current.fornecedoresSelecionados).toContain('1')
    expect(result.current.fornecedoresSelecionados).toContain('2')
    expect(result.current.fornecedoresSelecionados).toContain('3')
  })

  it('deve desselecionar todos os fornecedores', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    // Seleciona todos primeiro
    act(() => {
      result.current.selecionarTodosFornecedores(true)
    })

    // Desseleciona todos
    act(() => {
      result.current.selecionarTodosFornecedores(false)
    })

    expect(result.current.fornecedoresSelecionados).toHaveLength(0)
  })

  it('deve atualizar paginação ao filtrar', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setTermoPesquisa('Empresa Teste')
    })

    expect(result.current.paginacao.pagina).toBe(1)
    expect(result.current.paginacao.total).toBe(1)
  })

  it('deve manter seleções ao filtrar', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    // Seleciona fornecedor
    act(() => {
      result.current.selecionarFornecedor('1', true)
    })

    // Aplica filtro
    act(() => {
      result.current.setTermoPesquisa('Empresa Teste')
    })

    expect(result.current.fornecedoresSelecionados).toContain('1')
  })

  it('deve filtrar por termo de pesquisa case-insensitive', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setTermoPesquisa('empresa teste')
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(1)
    expect(result.current.fornecedoresFiltrados[0].razaoSocial).toBe('Empresa Teste LTDA')
  })

  it('deve filtrar por CNPJ removendo caracteres não numéricos', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setTermoPesquisa('11.222.333/0001-81')
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(1)
    expect(result.current.fornecedoresFiltrados[0].cnpj).toBe('11222333000181')
  })

  it('deve retornar array vazio quando não há resultados', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    act(() => {
      result.current.setTermoPesquisa('Empresa Inexistente')
    })

    expect(result.current.fornecedoresFiltrados).toHaveLength(0)
    expect(result.current.paginacao.total).toBe(0)
  })

  it('deve manter estado consistente entre operações', () => {
    const { result } = renderHook(() => useFornecedoresStore())

    // Aplica filtros
    act(() => {
      result.current.setTermoPesquisa('Empresa')
      result.current.setFiltros({ status: ['ativo'] })
    })

    // Verifica consistência
    expect(result.current.fornecedoresFiltrados.length).toBeLessThanOrEqual(result.current.fornecedores.length)
    expect(result.current.paginacao.total).toBe(result.current.fornecedoresFiltrados.length)
    expect(result.current.paginacao.pagina).toBe(1)
  })
})
