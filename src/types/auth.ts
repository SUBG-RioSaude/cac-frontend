// Tipos para autenticação baseados na documentação da API

export interface Usuario {
  id: string
  email: string
  nomeCompleto: string
  tipoUsuario: string
  precisaTrocarSenha: boolean
  emailConfirmado: boolean
  ativo: boolean
}

export interface Sistema {
  id: string
  nome: string
  descricao: string
}

export interface Permissao {
  id: string
  nome: string
  descricao: string
}

export interface LoginRequest {
  email: string
  senha: string
  sistemaId?: string
}

export interface LoginResponse {
  sucesso: boolean
  dados: {
    mensagem: string
    sistema?: Sistema
    permissao: string
  }
  mensagem?: string
}

export interface ConfirmarCodigo2FARequest {
  email: string
  codigo: string
  sistemaId?: string
}

export interface ConfirmarCodigo2FAResponse {
  sucesso: boolean
  dados?: {
    token: string
    refreshToken: string
    usuario: Usuario
    // Campos adicionais para fluxo de recuperação de senha e senha expirada
    mensagem?: string
    precisaTrocarSenha?: boolean
    senhaExpirada?: boolean
    tokenTrocaSenha?: string
  }
  mensagem?: string | null
}

export interface TrocarSenhaRequest {
  email: string
  novaSenha: string
  tokenTrocaSenha?: string
  sistemaId?: string
}

export interface TrocarSenhaResponse {
  sucesso: boolean
  dados: {
    token: string
    refreshToken: string
    usuario: Usuario
  }
  mensagem: string
}

export interface EsqueciSenhaRequest {
  email: string
}

export interface EsqueciSenhaResponse {
  sucesso: boolean
  dados: string
  mensagem: string
}

export interface RefreshTokenRequest {
  refreshToken: string
  sistemaId?: string
}

export interface RefreshTokenResponse {
  sucesso: boolean
  dados: {
    token: string
    refreshToken: string
    expiresIn: number
    refreshTokenExpiresIn: number
    usuario: Usuario
  }
  mensagem?: string
}

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutResponse {
  sucesso: boolean
  dados: string
  mensagem: string
}

export interface VerificarAcessoResponse {
  sucesso: boolean
  dados: {
    temAcesso: boolean
    permissao: string
    permissaoId: string
    sistema: Sistema
    dataVinculo: string
    mensagem: string
  }
}

export interface SessaoAtiva {
  id: string
  criadoEm: string
  expiracao: string
  doisFatoresConfirmado: boolean
  ehSessaoAtual: boolean
}

export interface SessoesAtivasResponse {
  sucesso: boolean
  dados: {
    quantidadeSessoes: number
    sessoes: SessaoAtiva[]
  }
}

export interface JWTPayload {
  sub: string // email
  usuarioId: string
  nomeCompleto: string
  cpf: string // CPF do usuário
  sistemaId: string // ID do sistema atual
  sistemaNome: string // Nome do sistema atual
  permissao: string[] // IDs das permissões como string
  permissaoNome: string[] // Array de nomes de permissões
  exp: number
  iss: string
  aud: string
  // Legado (manter para compatibilidade)
  tipoUsuario?: string
}

export interface RegisterRequest {
  email: string
  nomeCompleto: string
  cpf: string
  senhaExpiraEm: string // Formato: "YYYY-MM-DD"
}

export interface RegisterResponse {
  sucesso: boolean
  mensagem: string
  dados: {
    usuarioId?: string
    // Campos adicionais para 409 Conflict (usuário já existe)
    existe?: boolean
    usuario?: {
      id: string
      email: string
      nomeCompleto: string
      ativo: boolean
      emailConfirmado: boolean
      criadoEm: string
    }
    permissoes?: {
      sistemaId: string
      sistemaNome: string
      permissoes: {
        id: number
        nome: string
      }[]
    }[]
    // Campo adicional para erro 400 "E-mail já cadastrado"
    emailJaCadastrado?: boolean
  }
}

/**
 * Resposta do endpoint GET /Auth/verificar-usuario-por-cpf/{cpf}
 * Novo endpoint da API v1.1 para verificar se usuário já existe
 */
export interface VerificarUsuarioCpfResponse {
  sucesso: boolean
  mensagem?: string
  dados: {
    existe: boolean
    usuario?: {
      id: string
      email: string
      nomeCompleto: string
      ativo: boolean
      emailConfirmado: boolean
      criadoEm: string
    }
    permissoes?: {
      sistemaId: string
      sistemaNome: string
      permissoes: {
        id: number
        nome: string
      }[]
    }[]
  }
}

/**
 * Request para alterar senha do usuário autenticado
 * Endpoint: POST /api/auth/alterar-senha
 * Requer autenticação: Bearer Token no header
 */
export interface AlterarSenhaRequest {
  senhaAtual: string
  novaSenha: string
  confirmarNovaSenha: string
}

/**
 * Response do endpoint de alterar senha
 */
export interface AlterarSenhaResponse {
  sucesso: boolean
  mensagem: string
  dados?: {
    mensagem?: string
  }
}
