/**
 * Tipos consolidados para o módulo de Fornecedores
 * Combina tipos de empresa e fornecedor em uma estrutura organizada
 */

// ========== TIPOS DE EMPRESA (PRESERVADOS) ==========

export interface ContatoEmpresa {
  id: string
  nome: string
  valor: string
  tipo: 'Email' | 'Telefone' | 'Celular'
  ativo: boolean
}

export interface ContatoEmpresaRequest {
  nome: string
  valor: string
  tipo: 'Email' | 'Telefone' | 'Celular'
}

export interface EmpresaRequest {
  cnpj: string
  razaoSocial: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  usuarioCadastroId: string
  contatos: ContatoEmpresaRequest[]
}

export interface EmpresaResponse {
  id: string
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string | null
  inscricaoEstadual?: string | null
  inscricaoMunicipal?: string | null
  endereco: string
  numero?: string | null
  complemento?: string | null
  bairro: string
  cidade: string
  estado: string
  cep: string
  usuarioCadastroId?: string
  contatos: ContatoEmpresa[]
  ativo: boolean
}

export interface EmpresaConsultaCNPJ {
  cnpj: string
}

export interface AtualizarEmpresaDto {
  razaoSocial?: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  endereco?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  usuarioAtualizacaoId: string
}

export interface CriarContatoDto {
  nome?: string
  valor?: string
  tipo?: string
}

export interface AtualizarContatoDto {
  id?: string
  nome?: string
  valor?: string
  tipo?: string
}

export interface ContatoResponse {
  id: string
  nome: string
  valor: string
  tipo: string
  empresaId: string
  dataCadastro: string
  dataAtualizacao: string
  ativo: boolean
}

export interface EmpresaParametros {
  pagina?: number
  tamanhoPagina?: number
  pesquisa?: string
  status?: 'Ativo' | 'Inativo'
  cidade?: string
  estado?: string
}

export interface PaginacaoEmpresasResponse {
  dados: EmpresaResponse[]
  paginaAtual: number
  totalPaginas: number
  totalItens: number
  itensPorPagina: number
}

export type StatusEmpresa = 'Ativo' | 'Inativo'
export type TipoContato = 'Email' | 'Telefone' | 'Celular'

export interface ContatoOperationData {
  empresaId: string
  contatoId?: string
  contato: CriarContatoDto | AtualizarContatoDto
}

export interface FiltrosEmpresa {
  status?: StatusEmpresa
  cidade?: string
  estado?: string
  temContatos?: boolean
  dataCadastroInicio?: string
  dataCadastroFim?: string
}

// ========== TIPOS DE FORNECEDOR ==========

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

// Resposta da API resumo-contratos (GET /api/empresas/resumo-contratos)
export interface FornecedorResumoApi {
  id: string
  razaoSocial: string
  cnpj: string
  status: 'Ativo' | 'Suspenso' | 'Inativo'
  contratosAtivos: number
  valorTotal: number
  cidade: string
  estado: string
}

export interface PaginacaoFornecedoresApi {
  pagina: number
  tamanhoPagina: number
  totalItens: number
  totalPaginas: number
  itens: FornecedorResumoApi[]
}

export interface FiltrosFornecedor {
  status?: string[]
  valorMinimo?: number
  valorMaximo?: number
  contratosAtivosMinimo?: number
  contratosAtivosMaximo?: number
}

// Filtros para usar com a API (server-side)
export interface FiltrosFornecedorApi {
  pesquisa?: string
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

export interface PaginacaoParamsFornecedor {
  pagina: number
  itensPorPagina: number
  total: number
}

// ========== FUNÇÕES UTILITÁRIAS ==========

// Função para mapear dados da API para interface Fornecedor
export function mapearFornecedorApi(apiData: FornecedorApi): Fornecedor {
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
      cep: ''
    },
    dataUltimaAtualizacao: new Date().toISOString().split('T')[0]
  }
}