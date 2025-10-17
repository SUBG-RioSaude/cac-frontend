/**
 * Tipos para o módulo de Empresas baseados na API OpenAPI
 * Preserva interfaces existentes e adiciona novas funcionalidades
 */

// ========== INTERFACES EXISTENTES (PRESERVADAS) ==========

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

// ========== NOVAS INTERFACES BASEADAS NA API ==========

/**
 * DTO para atualização de empresa (PUT /api/Empresas/{id})
 */
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

/**
 * DTO para criação de contato (POST /api/empresas/{empresaId}/contatos)
 */
export interface CriarContatoDto {
  nome?: string
  valor?: string
  tipo?: string
}

/**
 * DTO para atualização de contato (PUT /api/empresas/{empresaId}/contatos/{contatoId})
 */
export interface AtualizarContatoDto {
  id?: string
  nome?: string
  valor?: string
  tipo?: string
}

/**
 * Resposta de contato da API
 */
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

/**
 * Parâmetros para listagem de empresas
 */
export interface EmpresaParametros {
  pagina?: number
  tamanhoPagina?: number
  pesquisa?: string
  status?: 'Ativo' | 'Inativo'
  cidade?: string
  estado?: string
}

/**
 * Resposta paginada de empresas
 */
export interface PaginacaoEmpresasResponse {
  dados: EmpresaResponse[]
  paginaAtual: number
  totalPaginas: number
  totalItens: number
  itensPorPagina: number
}

/**
 * Status disponíveis para empresas
 */
export type StatusEmpresa = 'Ativo' | 'Inativo'

/**
 * Tipos de contato disponíveis
 */
export type TipoContato = 'Email' | 'Telefone' | 'Celular'

/**
 * Payload para operações de contato
 */
export interface ContatoOperationData {
  empresaId: string
  contatoId?: string
  contato: CriarContatoDto | AtualizarContatoDto
}

/**
 * Filtros avançados para empresas
 */
export interface FiltrosEmpresa {
  status?: StatusEmpresa
  cidade?: string
  estado?: string
  temContatos?: boolean
  dataCadastroInicio?: string
  dataCadastroFim?: string
}

// ========== TIPOS PARA FORNECEDORES RESUMO API ==========

/**
 * Resposta da API resumo-contratos (GET /api/empresas/resumo-contratos)
 */
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

/**
 * Paginação da API resumo-contratos
 */
export interface PaginacaoFornecedoresApi {
  pagina: number
  tamanhoPagina: number
  totalItens: number
  totalPaginas: number
  itens: FornecedorResumoApi[]
}

/**
 * Parâmetros para filtros de fornecedores
 */
export interface FiltrosFornecedoresApi {
  pesquisa?: string
  status?: string
  cidade?: string
  estado?: string
  valorMinimo?: number
  valorMaximo?: number
  contratosMinimo?: number
  contratosMaximo?: number
}
