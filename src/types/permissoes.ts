// Tipos para permissões baseados na documentação da API

/**
 * Representa uma permissão do sistema
 */
export interface Permissao {
  id: number
  nome: string
  descricao: string
}

/**
 * Request para validar uma permissão específica
 */
export interface ValidarPermissaoRequest {
  sistemaId: string
  permissaoNome: string
}

/**
 * Response da validação de permissão
 */
export interface ValidarPermissaoResponse {
  sucesso: boolean
  dados: boolean
  mensagem: string
}

/**
 * Response para buscar permissões do usuário em um sistema
 */
export interface MinhasPermissoesResponse {
  sucesso: boolean
  dados: {
    sistemaId: string
    sistemaNome: string
    permissoes: string[]
    permissoesIds: number[]
  }
  mensagem?: string
}

/**
 * Response para listar todas as permissões disponíveis
 */
export interface ListarPermissoesResponse {
  sucesso: boolean
  dados: {
    items: Permissao[]
    totalCount?: number
    pageSize?: number
    currentPage?: number
  }
  mensagem?: string
}

/**
 * Tipo para permissão atribuída ao usuário
 */
export interface PermissaoAtribuida {
  permissaoId: number
  permissaoNome: string
  sistemaId: string
  sistemaNome: string
  atribuidoEm: string
}

/**
 * Representa um sistema no qual o usuário pode ter permissões
 * NOTA: API /api/sistemas/{id} retorna diretamente sem wrapper
 */
export interface Sistema {
  id: string
  nome: string
  descricao?: string | null
  ativo?: boolean // Opcional: API não sempre retorna
  dataCadastro?: string
  dataAtualizacao?: string | null
}

/**
 * Response da busca de sistema por ID
 */
export interface SistemaResponse {
  sucesso: boolean
  dados?: Sistema
  mensagem?: string
}

/**
 * Request para atribuir permissão a um usuário em um sistema
 */
export interface UsuarioPermissaoSistemaRequest {
  usuarioId: string
  sistemaId: string
  permissaoId: number
}

/**
 * Response da atribuição de permissão
 */
export interface UsuarioPermissaoSistemaResponse {
  sucesso: boolean
  dados: {
    id: string
    usuarioId: string
    sistemaId: string
    permissaoId: number
    atribuidoEm: string
  }
  mensagem?: string
}

/**
 * Request para atualizar permissões de um usuário (múltiplas permissões)
 * Novo endpoint da API v1.1: PUT /api/usuarios/{usuarioId}/permissoes
 */
export interface AtualizarPermissoesRequest {
  permissoes: Array<{
    sistemaId: string
    permissaoId: number
  }>
}

/**
 * Response da atualização de permissões em lote
 * API v1.1: PUT /api/usuarios/{usuarioId}/permissoes
 */
export interface AtualizarPermissoesResponse {
  sucesso: boolean
  mensagem?: string
  dados: {
    usuarioId: string
    quantidadePermissoes: number
    permissoes: Array<{
      sistemaId: string
      sistemaNome: string
      permissoes: Array<{
        id: number
        nome: string
      }>
    }>
  }
}
