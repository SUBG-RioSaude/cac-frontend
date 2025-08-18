import { create } from 'zustand'
import type {
  Contrato,
  FiltrosContrato,
  PaginacaoParams,
} from '@/modules/Contratos/types/contrato'
import { contratosMock } from '@/modules/Contratos/data/contratos-mock'

interface ContratosState {
  contratos: Contrato[]
  contratosFiltrados: Contrato[]
  termoPesquisa: string
  filtros: FiltrosContrato
  paginacao: PaginacaoParams
  contratosSelecionados: string[]

  // Actions
  setTermoPesquisa: (termo: string) => void
  setFiltros: (filtros: FiltrosContrato) => void
  limparFiltros: () => void
  setPaginacao: (paginacao: PaginacaoParams) => void
  selecionarContrato: (contratoId: string, selecionado: boolean) => void
  selecionarTodosContratos: (selecionado: boolean) => void
  filtrarContratos: () => void
}

export const useContratosStore = create<ContratosState>((set, get) => ({
  contratos: contratosMock,
  contratosFiltrados: contratosMock,
  termoPesquisa: '',
  filtros: {},
  paginacao: {
    pagina: 1,
    itensPorPagina: 10,
    total: contratosMock.length,
  },
  contratosSelecionados: [],

  setTermoPesquisa: (termo) => {
    set({ termoPesquisa: termo })
    get().filtrarContratos()
  },

  setFiltros: (filtros) => {
    set({ filtros })
    get().filtrarContratos()
  },

  limparFiltros: () => {
    set({
      filtros: {},
      termoPesquisa: '',
      paginacao: { ...get().paginacao, pagina: 1 },
    })
    get().filtrarContratos()
  },

  setPaginacao: (paginacao) => {
    set({ paginacao })
  },

  selecionarContrato: (contratoId, selecionado) => {
    const { contratosSelecionados } = get()
    if (selecionado) {
      set({ contratosSelecionados: [...contratosSelecionados, contratoId] })
    } else {
      set({
        contratosSelecionados: contratosSelecionados.filter(
          (id) => id !== contratoId,
        ),
      })
    }
  },

  selecionarTodosContratos: (selecionado) => {
    const { contratosFiltrados } = get()
    if (selecionado) {
      set({ contratosSelecionados: contratosFiltrados.map((c) => c.id) })
    } else {
      set({ contratosSelecionados: [] })
    }
  },

  filtrarContratos: () => {
    const { contratos, termoPesquisa, filtros } = get()
    let resultado = contratos

    // Filtro por termo de pesquisa
    if (termoPesquisa) {
      const termo = termoPesquisa.toLowerCase()
      resultado = resultado.filter(
        (contrato) =>
          contrato.numeroContrato.toLowerCase().includes(termo) ||
          contrato.numeroCCon?.toLowerCase().includes(termo) ||
          contrato.contratada.razaoSocial.toLowerCase().includes(termo) ||
          contrato.contratada.cnpj.includes(termo) ||
          contrato.unidade.toLowerCase().includes(termo),
      )
    }

    // Filtros avançados
    if (filtros.status && filtros.status.length > 0) {
      resultado = resultado.filter((contrato) =>
        filtros.status!.includes(contrato.status),
      )
    }

    if (filtros.unidade && filtros.unidade.length > 0) {
      resultado = resultado.filter((contrato) =>
        filtros.unidade!.includes(contrato.unidade),
      )
    }

    if (filtros.dataInicialDe) {
      resultado = resultado.filter(
        (contrato) => contrato.dataInicial >= filtros.dataInicialDe!,
      )
    }

    if (filtros.dataInicialAte) {
      resultado = resultado.filter(
        (contrato) => contrato.dataInicial <= filtros.dataInicialAte!,
      )
    }

    if (filtros.dataFinalDe) {
      resultado = resultado.filter(
        (contrato) => contrato.dataFinal >= filtros.dataFinalDe!,
      )
    }

    if (filtros.dataFinalAte) {
      resultado = resultado.filter(
        (contrato) => contrato.dataFinal <= filtros.dataFinalAte!,
      )
    }

    if (filtros.valorMinimo) {
      resultado = resultado.filter(
        (contrato) => contrato.valor >= filtros.valorMinimo!,
      )
    }

    if (filtros.valorMaximo) {
      resultado = resultado.filter(
        (contrato) => contrato.valor <= filtros.valorMaximo!,
      )
    }

    set({
      contratosFiltrados: resultado,
      paginacao: { ...get().paginacao, total: resultado.length, pagina: 1 },
    })
  },
}))
