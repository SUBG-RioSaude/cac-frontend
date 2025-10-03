// Interface original para manter compatibilidade com componentes existentes
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

// Interface baseada na API real - campos disponíveis
export interface FornecedorApi {
  id: string
  razaoSocial: string
  cnpj: string
  contratosAtivos: number
  status: 'Ativo' | 'Suspenso' | 'Inativo'
  valorTotal: number
  cidade: string
  estado: string
}

// Interface para dados resumidos da API que podem ter estrutura similar
export type FornecedorResumoApi = Pick<
  FornecedorApi,
  | 'id'
  | 'razaoSocial'
  | 'cnpj'
  | 'contratosAtivos'
  | 'status'
  | 'valorTotal'
  | 'cidade'
  | 'estado'
> &
  // Permite propriedades adicionais que podem vir da API
  Record<string, unknown>

export interface FiltrosFornecedor {
  status?: string[]
  valorMinimo?: number
  valorMaximo?: number
  contratosAtivosMinimo?: number
  contratosAtivosMaximo?: number
}

// Filtros para usar com a API (server-side)
export interface FiltrosFornecedorApi {
  cnpj?: string
  razaoSocial?: string
  status?: string
  cidade?: string
  estado?: string
  valorMinimo?: number
  valorMaximo?: number
  contratosMinimo?: number
  contratosMaximo?: number
  pagina?: number
  tamanhoPagina?: number
}

// Função para mapear dados da API para interface Fornecedor
// NOTA: Aceita tanto FornecedorApi quanto FornecedorResumoApi (tipos compatíveis)
export function mapearFornecedorApi(
  apiData: FornecedorApi | FornecedorResumoApi,
): Fornecedor {
  return {
    id: apiData.id,
    razaoSocial: apiData.razaoSocial,
    cnpj: apiData.cnpj,
    contratosAtivos: apiData.contratosAtivos,
    status: apiData.status.toLowerCase() as 'ativo' | 'inativo' | 'suspenso',
    valorTotalContratos: apiData.valorTotal,
    endereco: {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: apiData.cidade,
      uf: apiData.estado,
      cep: '',
    },
    dataUltimaAtualizacao: new Date().toISOString().split('T')[0],
  }
}

export interface PaginacaoParamsFornecedor {
  pagina: number
  itensPorPagina: number
  total: number
}
