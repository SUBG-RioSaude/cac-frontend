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
}

export interface ConfirmarCodigo2FAResponse {
  sucesso: boolean
  dados?: {
    token: string
    refreshToken: string
    usuario: Usuario
    // Campos adicionais para fluxo de recuperação de senha
    message?: string
    precisaTrocarSenha?: boolean
    tokenTrocaSenha?: string
  }
  precisaTrocarSenha?: boolean
  senhaExpirada?: boolean
  message?: string
  tokenTrocaSenha?: string
  mensagem?: string
}

export interface TrocarSenhaRequest {
  email: string
  novaSenha: string
  tokenTrocaSenha?: string
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
  tipoUsuario: string
  nomeCompleto: string
  nomePermissao: string
  exp: number
  iss: string
  aud: string
}
