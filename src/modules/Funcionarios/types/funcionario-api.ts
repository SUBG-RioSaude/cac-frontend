/**
 * ==========================================
 * TIPAGEM DA API DE FUNCIONÁRIOS - OpenAPI
 * ==========================================
 * Interfaces baseadas na documentação OpenAPI
 * da API de funcionários/fiscais
 */

// ========== ENUMS ==========

export const SituacaoFuncional = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  AFASTADO: 'Afastado',
  LICENCA: 'Licença',
  CEDIDO: 'Cedido',
  REQUISITADO: 'Requisitado',
} as const

export type SituacaoFuncional =
  (typeof SituacaoFuncional)[keyof typeof SituacaoFuncional]

export const TipoVinculo = {
  EFETIVO: 'Efetivo',
  COMISSIONADO: 'Comissionado',
  TERCEIRIZADO: 'Terceirizado',
  ESTAGIARIO: 'Estagiário',
  TEMPORARIO: 'Temporário',
} as const

export type TipoVinculo = (typeof TipoVinculo)[keyof typeof TipoVinculo]

// ========== INTERFACES PRINCIPAIS ==========

export interface FuncionarioApi {
  id: string
  matricula: string
  cpf: string
  nomeCompleto: string // Campo real da API
  emailInstitucional?: string | null // Campo real da API
  telefone?: string | null
  cargo: string
  funcao: string // Campo adicional da API
  situacao: number // Campo real da API (1 = ativo)
  vinculo: number // Campo real da API
  dataAdmissao: string // ISO date
  dataExoneracao?: string | null // Campo real da API
  ativo: boolean
  lotacaoId: string // Campo real da API
  lotacaoNome: string // Campo real da API
  lotacaoSigla?: string // Campo real da API
  dataCadastro: string // ISO date-time
  // Campos de compatibilidade para mapeamento
  nome?: string // Para compatibilidade
  email?: string | null // Para compatibilidade
  lotacao?: string // Para compatibilidade
  situacaoFuncional?: SituacaoFuncional // Para compatibilidade
  tipoVinculo?: TipoVinculo // Para compatibilidade
}

export interface LotacaoApi {
  id: string
  codigo: string
  nome: string
  sigla?: string | null
  descricao?: string | null
  ativo: boolean
  dataCadastro: string // ISO date-time
  dataAtualizacao?: string | null // ISO date-time
}

// ========== PARÂMETROS DE BUSCA ==========

export interface FuncionarioParametros {
  pagina?: number
  tamanhoPagina?: number
  matricula?: string
  cpf?: string
  nome?: string // busca parcial por nome
  email?: string
  cargo?: string
  lotacao?: string // código ou nome da lotação
  situacaoFuncional?: SituacaoFuncional[]
  tipoVinculo?: TipoVinculo[]
  ativo?: boolean
  dataAdmissaoDe?: string // ISO date
  dataAdmissaoAte?: string // ISO date
  [key: string]: unknown // Index signature para compatibilidade
}

export interface LotacaoParametros {
  pagina?: number
  tamanhoPagina?: number
  codigo?: string
  nome?: string // busca parcial por nome
  sigla?: string
  ativo?: boolean
  [key: string]: unknown // Index signature para compatibilidade
}

// ========== RESPONSES PAGINADAS ==========

export interface FuncionariosPaginacaoResponse {
  dados: FuncionarioApi[]
  paginaAtual: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
  temProximaPagina: boolean
  temPaginaAnterior: boolean
}

export interface LotacoesPaginacaoResponse {
  dados: LotacaoApi[]
  paginaAtual: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
  temProximaPagina: boolean
  temPaginaAnterior: boolean
}

// ========== INTERFACES DE COMPATIBILIDADE ==========

// Interface para manter compatibilidade com o formulário atual
export interface Usuario {
  id: string
  matricula: string
  nome: string
  email: string
  cargo: string
  departamento: string // mapeado de lotacao
  telefone: string
  status: 'ativo' | 'inativo' // mapeado de ativo
}

// Interface para usuário atribuído com tipo fiscal/gestor
export interface UsuarioAtribuido extends Usuario {
  tipo: 'fiscal' | 'gestor' | null
  observacoes?: string
  urlNomeacao?: string // URL da nomeação do fiscal (obrigatório apenas para fiscais)
}

// ========== UTILITÁRIOS DE MAPEAMENTO ==========

// Função para converter SituacaoFuncional para status simples
export const mapSituacaoToStatus = (
  situacao: SituacaoFuncional,
  ativo: boolean,
): 'ativo' | 'inativo' => {
  if (!ativo || situacao === SituacaoFuncional.INATIVO) {
    return 'inativo'
  }
  return 'ativo'
}

// Função para converter FuncionarioApi para Usuario (compatibilidade)
export const mapFuncionarioToUsuario = (
  funcionario: FuncionarioApi,
): Usuario => {
  return {
    id: funcionario.id,
    matricula: funcionario.matricula,
    nome: funcionario.nomeCompleto, // Usar nomeCompleto da API
    email: funcionario.emailInstitucional || '', // Usar emailInstitucional da API
    cargo: funcionario.cargo,
    departamento: funcionario.lotacaoNome, // Usar lotacaoNome da API
    telefone: funcionario.telefone || '',
    status: mapSituacaoToStatus(
      funcionario.situacaoFuncional ||
        (funcionario.situacao as unknown as SituacaoFuncional),
      funcionario.ativo,
    ),
  }
}

// ========== TIPOS DE BUSCA ESPECÍFICA ==========

export interface BuscaFuncionarioResponse {
  encontrado: boolean
  funcionario?: FuncionarioApi
  erro?: string
}

export interface BuscaLotacaoResponse {
  encontrada: boolean
  lotacao?: LotacaoApi
  erro?: string
}

// ========== FILTROS PARA UI ==========

export interface FiltrosFuncionarios {
  nome?: string
  lotacao?: string
  situacao?: SituacaoFuncional[]
  tipoVinculo?: TipoVinculo[]
  apenasAtivos?: boolean
}

export interface FiltrosLotacoes {
  nome?: string
  sigla?: string
  apenasAtivas?: boolean
}

// ========== TIPOS DE CRIAÇÃO/ATUALIZAÇÃO ==========

export interface FuncionarioCreateApi {
  nomeCompleto: string
  cpf: string
  matricula: string
  cargo: string
  funcao: string
  situacao: number
  vinculo: number
  dataAdmissao: string // ISO date
  dataExoneracao?: string | null
  emailInstitucional: string
  telefone: string
  lotacaoId: string
}

export interface FuncionarioUpdateApi extends Partial<FuncionarioCreateApi> {
  id: string
}
