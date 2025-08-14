import { create } from 'zustand'
import type { Fornecedor, FiltrosFornecedor, PaginacaoParamsFornecedor } from '../types/fornecedor'
import { fornecedoresMock } from '../data/fornecedores-mock'

interface FornecedoresState {
  fornecedores: Fornecedor[]
  fornecedoresFiltrados: Fornecedor[]
  termoPesquisa: string
  filtros: FiltrosFornecedor
  paginacao: PaginacaoParamsFornecedor
  fornecedoresSelecionados: string[]
  
  // Actions
  setTermoPesquisa: (termo: string) => void
  setFiltros: (filtros: FiltrosFornecedor) => void
  limparFiltros: () => void
  setPaginacao: (paginacao: PaginacaoParamsFornecedor) => void
  selecionarFornecedor: (fornecedorId: string, selecionado: boolean) => void
  selecionarTodosFornecedores: (selecionado: boolean) => void
  filtrarFornecedores: () => void
}

export const useFornecedoresStore = create<FornecedoresState>((set, get) => ({
  fornecedores: fornecedoresMock,
  fornecedoresFiltrados: fornecedoresMock,
  termoPesquisa: '',
  filtros: {},
  paginacao: {
    pagina: 1,
    itensPorPagina: 10,
    total: fornecedoresMock.length
  },
  fornecedoresSelecionados: [],

  setTermoPesquisa: (termo) => {
    set({ termoPesquisa: termo })
    get().filtrarFornecedores()
  },

  setFiltros: (filtros) => {
    set({ filtros })
    get().filtrarFornecedores()
  },

  limparFiltros: () => {
    set({ 
      filtros: {}, 
      termoPesquisa: '',
      paginacao: { ...get().paginacao, pagina: 1 }
    })
    get().filtrarFornecedores()
  },

  setPaginacao: (paginacao) => {
    set({ paginacao })
  },

  selecionarFornecedor: (fornecedorId, selecionado) => {
    const { fornecedoresSelecionados } = get()
    if (selecionado) {
      set({ fornecedoresSelecionados: [...fornecedoresSelecionados, fornecedorId] })
    } else {
      set({ 
        fornecedoresSelecionados: fornecedoresSelecionados.filter(id => id !== fornecedorId) 
      })
    }
  },

  selecionarTodosFornecedores: (selecionado) => {
    const { fornecedoresFiltrados } = get()
    if (selecionado) {
      set({ fornecedoresSelecionados: fornecedoresFiltrados.map(f => f.id) })
    } else {
      set({ fornecedoresSelecionados: [] })
    }
  },

  filtrarFornecedores: () => {
    const { fornecedores, termoPesquisa, filtros } = get()
    let resultado = fornecedores

    // Filtro por termo de pesquisa
    if (termoPesquisa) {
      const termo = termoPesquisa.toLowerCase()
      resultado = resultado.filter(fornecedor =>
        fornecedor.razaoSocial.toLowerCase().includes(termo) ||
        fornecedor.nomeFantasia.toLowerCase().includes(termo) ||
        fornecedor.cnpj.includes(termo.replace(/\D/g, ""))
      )
    }

    // Filtros avançados
    if (filtros.status && filtros.status.length > 0) {
      resultado = resultado.filter(fornecedor => 
        filtros.status!.includes(fornecedor.status)
      )
    }

    if (filtros.valorMinimo) {
      resultado = resultado.filter(fornecedor => 
        fornecedor.valorTotalContratos >= filtros.valorMinimo!
      )
    }

    if (filtros.valorMaximo) {
      resultado = resultado.filter(fornecedor => 
        fornecedor.valorTotalContratos <= filtros.valorMaximo!
      )
    }

    if (filtros.contratosAtivosMinimo) {
      resultado = resultado.filter(fornecedor => 
        fornecedor.contratosAtivos >= filtros.contratosAtivosMinimo!
      )
    }

    if (filtros.contratosAtivosMaximo) {
      resultado = resultado.filter(fornecedor => 
        fornecedor.contratosAtivos <= filtros.contratosAtivosMaximo!
      )
    }

    set({ 
      fornecedoresFiltrados: resultado,
      paginacao: { ...get().paginacao, total: resultado.length, pagina: 1 }
    })
  },
}))
