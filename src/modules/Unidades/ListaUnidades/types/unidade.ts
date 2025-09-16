export interface ContratoVinculado {
  id: string | number
  numero: string
  objeto: string
  fornecedor: string
  valor: number
  vigenciaInicio: string
  vigenciaFim: string
  status: 'ativo' | 'vencido' | 'suspenso'
}

export interface Unidade {
  id: string | number
  nome: string
  sigla: string
  UO: string
  UG: string
  endereco: string
  status?: 'ativo' | 'inativo'
  contratosAtivos?: number
  valorTotalContratado?: number
  contratos?: ContratoVinculado[]
}

export interface PaginacaoParamsUnidade {
  pagina: number
  itensPorPagina: number
  total: number
  
}

export interface FiltrosUnidade {
  status?: string
  sigla?: string
  UO?: string
  UG?: string
}

export type ColunaOrdenacao = 'nome' | 'sigla' | 'UO' | 'UG' | 'status' | 'contratosAtivos' | 'valorTotalContratado'

export interface OrdenacaoParams {
  coluna: ColunaOrdenacao
  direcao: 'asc' | 'desc'
}

export interface UnidadeStoreState {
  // Dados
  unidades: Unidade[]
  unidadesFiltradas: Unidade[]
  
  // Filtros e pesquisa
  termoPesquisa: string
  filtros: FiltrosUnidade
  
  // Seleção
  unidadesSelecionadas: (string | number)[]
  
  // Paginação
  paginacao: PaginacaoParamsUnidade
  
  // Ações
  setTermoPesquisa: (termo: string) => void
  setFiltros: (filtros: FiltrosUnidade) => void
  selecionarUnidade: (id: string | number, selecionado: boolean) => void
  selecionarTodasUnidades: (selecionadas: boolean) => void
  setPaginacao: (paginacao: PaginacaoParamsUnidade) => void
  aplicarFiltros: () => void
  limparFiltros: () => void
  carregarUnidades: () => void
}