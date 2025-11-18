/**
 * Tipos para a API de Usuários
 */

export interface PermissaoApi {
  id: number
  nome: string
}

export interface UsuarioApi {
  usuarioId: string
  nomeCompleto: string
  email?: string
  permissoes?: PermissaoApi[]
  permissaoAtribuida?: string // Mantido para compatibilidade
  ultimoLogin?: string | null
  ativo?: boolean
  sistemaId?: string
}

export interface UsuariosApiResponse {
  dados: {
    sistemaId: string
    quantidadeUsuarios: number
    usuarios: UsuarioApi[]
  }
  quantidadeUsuarios: number
  sistemaId: string
  usuarios: UsuarioApi[]
}

export interface UsuariosPaginacaoResponse {
  dados: UsuarioApi[]
  pagina: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
}

export interface FiltrosUsuariosApi {
  pagina?: number
  tamanhoPagina?: number
  busca?: string
  permissaoId?: string
  ordenarPor?: 'nome' | 'email' | 'ultimoLogin' | 'ativo'
  direcaoOrdenacao?: 'asc' | 'desc'
  ativo?: boolean | null
  loginRecente?: boolean | null // true = mais recentes, false = menos recentes
}

export interface Usuario {
  id: string
  nome: string
  email: string
  permissaoAtribuida?: string
  ultimoLogin?: Date | null
  ativo: boolean
}

