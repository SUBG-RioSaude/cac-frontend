export interface Fornecedor {
  id: string
  razaoSocial: string
  cnpj: string
  contratosAtivos: number
  status: 'ativo' | 'inativo' | 'suspenso'
  valorTotalContratos: number
  endereco?: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  }
  contato?: {
    telefone: string
    email: string
    responsavel: string
  }
  dataUltimaAtualizacao: string
}

export interface FiltrosFornecedor {
  status?: string[]
  valorMinimo?: number
  valorMaximo?: number
  contratosAtivosMinimo?: number
  contratosAtivosMaximo?: number
}

export interface PaginacaoParamsFornecedor {
  pagina: number
  itensPorPagina: number
  total: number
}
