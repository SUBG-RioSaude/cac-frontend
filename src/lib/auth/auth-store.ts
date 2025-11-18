import { toast } from 'sonner'
import { create } from 'zustand'

import { createServiceLogger } from '@/lib/logger'
import type { Usuario } from '@/types/auth'

import { authService } from './auth-service'
import { cookieUtils, authCookieConfig } from './cookie-utils'

export interface AuthState {
  // Estado
  usuario: Usuario | null
  estaAutenticado: boolean
  carregando: boolean
  erro: string | null
  // TOKENS EM MEMÓRIA (fonte da verdade)
  token: string | null
  refreshToken: string | null

  // Ações
  login: (email: string, senha: string) => Promise<boolean>
  confirmarCodigo2FA: (email: string, codigo: string) => Promise<boolean>
  trocarSenha: (
    email: string,
    novaSenha: string,
    tokenTrocaSenha?: string,
  ) => Promise<boolean>
  esqueciSenha: (email: string) => Promise<boolean>
  logout: () => void
  logoutTodasSessoes: () => Promise<void>
  renovarToken: () => Promise<boolean>
  verificarAutenticacao: () => Promise<void>
  limparErro: () => void
  // Getters para tokens
  getToken: () => string | null
  getRefreshToken: () => string | null
}

// Função para validar formato de token JWT ou token criptografado
const validarTokenJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false

  // Verifica se é um JWT padrão (3 partes separadas por ponto)
  const partes = token.split('.')
  if (partes.length === 3 && partes.every((part) => part.length > 0)) {
    return true
  }

  // Verifica se é um token criptografado (base64 válido)
  if (token.length > 20 && /^[A-Za-z0-9+/=]+$/.test(token)) {
    return true
  }

  return false
}

const authLogger = createServiceLogger('auth-store')

const sanitizeMensagem = (
  mensagem: string | null | undefined,
  fallback: string,
): string => {
  if (typeof mensagem !== 'string') {
    return fallback
  }

  const mensagemNormalizada = mensagem.trim()
  return mensagemNormalizada.length > 0 ? mensagemNormalizada : fallback
}

export const useAuthStore = create<AuthState>()((set, get) => ({
      // Estado inicial
      usuario: null,
      estaAutenticado: false,
      carregando: false,
      erro: null,
      // Tokens em MEMÓRIA (fonte da verdade principal)
      token: null,
      refreshToken: null,

      // Getters para tokens (lê memória primeiro, cookies como fallback)
      getToken: () => {
        const state = get()
        if (state.token) return state.token
        // Fallback para cookies
        return cookieUtils.getCookie('auth_token')
      },

      getRefreshToken: () => {
        const state = get()
        if (state.refreshToken) return state.refreshToken
        // Fallback para cookies
        return cookieUtils.getCookie('auth_refresh_token')
      },

  // Login - Primeira etapa (envia código 2FA)
  login: async (email: string, senha: string) => {
    try {
      set({ carregando: true, erro: null })

      const resultado = await authService.login(email, senha)

      if (resultado.sucesso) {
        // Salva email para próxima etapa - SEMPRE vai para 2FA
        sessionStorage.setItem('auth_email', email)
        set({ carregando: false })
        return true
      } else {
        set({
          carregando: false,
          erro: resultado.mensagem ?? 'Erro no login',
        })
        return false
      }
    } catch (erro) {
      set({
        carregando: false,
        erro: erro instanceof Error ? erro.message : 'Erro inesperado no login',
      })
      return false
    }
  },

  // Confirmação do código 2FA - Segunda etapa
  confirmarCodigo2FA: async (email: string, codigo: string) => {
    try {
      set({ carregando: true, erro: null })

      const resultado = await authService.confirmarCodigo2FA(email, codigo)

      // Se a API indica que precisa trocar senha, mesmo com 200 OK, trata como sucesso para redirecionamento
      if (resultado.dados?.precisaTrocarSenha) {
        sessionStorage.setItem('auth_email', email)
        sessionStorage.setItem(
          'tokenTrocaSenha',
          resultado.dados.tokenTrocaSenha ?? '',
        )
        sessionStorage.setItem('auth_context', 'password_reset')
        set({ carregando: false, erro: null })
        window.location.href = '/auth/trocar-senha'
        return false
      }

      // Se a API indica que senha expirou (dados.senhaExpirada: true)
      if (resultado.dados?.senhaExpirada) {
        sessionStorage.setItem('auth_email', email)
        sessionStorage.setItem(
          'tokenTrocaSenha',
          resultado.dados.tokenTrocaSenha ?? '',
        )
        sessionStorage.setItem('auth_context', 'password_expired')
        set({ carregando: false, erro: null })
        window.location.href = '/auth/trocar-senha'
        return false
      }

      // Se não precisa trocar senha, verifica o sucesso normal
      if (resultado.sucesso) {
        // Login bem-sucedido - salva tokens nos cookies
        if (resultado.dados) {
          const { token, refreshToken, usuario } = resultado.dados

              // Valida token JWT (refresh token pode ser opaco, não precisa validar)
              if (validarTokenJWT(token)) {
                // PRIORIDADE 1: Salva tokens em MEMÓRIA (fonte da verdade)
                set({
                  usuario,
                  estaAutenticado: true,
                  carregando: false,
                  erro: null,
                  token, // ⭐ Token em memória
                  refreshToken, // ⭐ Refresh token em memória
                })

                // PRIORIDADE 2: Salva tokens nos cookies (backup para persistência)
                cookieUtils.setCookie(
                  'auth_token',
                  token,
                  authCookieConfig.token,
                )
                cookieUtils.setCookie(
                  'auth_refresh_token',
                  refreshToken,
                  authCookieConfig.refreshToken,
                )
              } else {
                set({
                  carregando: false,
                  erro: 'Tokens inválidos recebidos do servidor',
                })
                return false
              }
            }

        // Limpa dados temporários
        sessionStorage.removeItem('auth_email')
        sessionStorage.removeItem('tokenTrocaSenha')

        return true
      } else {
        // Se não foi sucesso e não precisa trocar senha, define o erro
        set({
          carregando: false,
          erro: resultado.mensagem ?? 'Erro ao confirmar código 2FA.',
        })
        return false
      }
    } catch (erro) {
      set({
        carregando: false,
        erro: erro instanceof Error ? erro.message : 'Erro na verificação',
      })
      return false
    }
  },

  // Troca de senha
  trocarSenha: async (
    email: string,
    novaSenha: string,
    tokenTrocaSenha?: string,
  ) => {
    try {
      set({ carregando: true, erro: null })

      const resultado = await authService.trocarSenha(
        email,
        novaSenha,
        tokenTrocaSenha,
      )

      if (resultado.sucesso) {
        const { token, refreshToken, usuario } = resultado.dados

            // Valida token JWT (refresh token pode ser opaco, não precisa validar)
            const tokenValido = validarTokenJWT(token)

            if (tokenValido) {
              // PRIORIDADE 1: Salva tokens em MEMÓRIA (fonte da verdade)
              set({
                usuario,
                estaAutenticado: true,
                carregando: false,
                erro: null,
                token, // ⭐ Token em memória
                refreshToken, // ⭐ Refresh token em memória
              })

              // PRIORIDADE 2: Salva tokens nos cookies (backup para persistência)
              cookieUtils.setCookie('auth_token', token, authCookieConfig.token)
              cookieUtils.setCookie(
                'auth_refresh_token',
                refreshToken,
                authCookieConfig.refreshToken,
              )

          // Limpa dados temporários
          sessionStorage.removeItem('auth_email')
          sessionStorage.removeItem('tokenTrocaSenha')

          return true
        } else {
          set({
            carregando: false,
            erro: 'Formato de tokens inválido recebido do servidor',
          })
          return false
        }
      } else {
        const mensagemErro = sanitizeMensagem(
          resultado.mensagem,
          'Erro ao trocar senha',
        )
        set({
          carregando: false,
          erro: mensagemErro,
        })
        return false
      }
    } catch (erro) {
      set({
        carregando: false,
        erro: erro instanceof Error ? erro.message : 'Erro ao trocar senha',
      })
      return false
    }
  },

  // Esqueci a senha
  esqueciSenha: async (email: string) => {
    try {
      set({ carregando: true, erro: null })

      const resultado = await authService.esqueciSenha(email)

      if (resultado.sucesso) {
        sessionStorage.setItem('auth_email', email)
        set({ carregando: false })
        return true
      } else {
        const mensagemErro = sanitizeMensagem(
          resultado.mensagem,
          'Erro ao solicitar recuperação',
        )
        set({
          carregando: false,
          erro: mensagemErro,
        })
        return false
      }
    } catch (erro) {
      set({
        carregando: false,
        erro:
          erro instanceof Error
            ? erro.message
            : 'Erro ao solicitar recuperação',
      })
      return false
    }
  },

      // Logout
      logout: () => {
        // ⭐ USA GETTER PARA LER DA MEMÓRIA PRIMEIRO, COOKIES COMO FALLBACK
        const refreshToken = get().getRefreshToken()

        // Invalida token no servidor (não bloqueia UI)
        // Refresh token pode ser opaco (não JWT), apenas verifica existência
        if (refreshToken) {
          authService.logout(refreshToken).catch((erro) => {
            authLogger.warn(
              { action: 'logout', scope: 'single-session' },
              erro instanceof Error
                ? erro.message
                : 'Erro desconhecido ao encerrar sessão',
            )
          })
        }

        // PRIORIDADE 1: Limpa tokens da MEMÓRIA
        set({
          usuario: null,
          estaAutenticado: false,
          carregando: false,
          erro: null,
          token: null, // ⭐ Limpa token da memória
          refreshToken: null, // ⭐ Limpa refresh token da memória
        })

        // PRIORIDADE 2: Remove tokens dos cookies
        cookieUtils.removeCookie('auth_token', authCookieConfig.token)
        cookieUtils.removeCookie(
          'auth_refresh_token',
          authCookieConfig.refreshToken,
        )

    // Limpa dados da sessão
    sessionStorage.clear()
  },

      // Logout de todas as sessões
      logoutTodasSessoes: async () => {
        try {
          // ⭐ USA GETTER PARA LER DA MEMÓRIA PRIMEIRO, COOKIES COMO FALLBACK
          const refreshToken = get().getRefreshToken()

          // Refresh token pode ser opaco (não JWT), apenas verifica existência
          if (refreshToken) {
            await authService.logoutTodasSessoes(refreshToken)
          }

          // PRIORIDADE 1: Limpa tokens da MEMÓRIA
          set({
            usuario: null,
            estaAutenticado: false,
            carregando: false,
            erro: null,
            token: null, // ⭐ Limpa token da memória
            refreshToken: null, // ⭐ Limpa refresh token da memória
          })

          // PRIORIDADE 2: Remove tokens dos cookies
          cookieUtils.removeCookie('auth_token', authCookieConfig.token)
          cookieUtils.removeCookie(
            'auth_refresh_token',
            authCookieConfig.refreshToken,
          )

      sessionStorage.clear()
    } catch (erro) {
      authLogger.warn(
        { action: 'logout', scope: 'all-sessions' },
        erro instanceof Error
          ? erro.message
          : 'Erro desconhecido ao encerrar todas as sessões',
      )
    }
  },

      // Renovação de token
      renovarToken: async () => {
        try {
          // ⭐ USA GETTER PARA LER DA MEMÓRIA PRIMEIRO, COOKIES COMO FALLBACK
          const refreshToken = get().getRefreshToken()
          const currentToken = get().getToken()

          authLogger.info(
            {
              action: 'renovar-token',
              status: 'checking',
              hasRefreshToken: !!refreshToken,
              hasCurrentToken: !!currentToken
            },
            '🔍 Verificando tokens antes de renovar',
          )

          // Refresh token pode ser opaco (não JWT), apenas verifica existência
          if (!refreshToken) {
            authLogger.warn(
              { action: 'renovar-token', status: 'no-refresh-token' },
              '❌ Refresh token ausente - renovação impossível',
            )
            return false
          }

          authLogger.info(
            { action: 'renovar-token', status: 'requesting' },
            '🔄 Solicitando renovação de token ao servidor...',
          )

      const resultado = await authService.renovarToken(refreshToken)

      if (resultado.sucesso) {
        const {
          token,
          refreshToken: newRefreshToken,
          usuario,
        } = resultado.dados

            // Valida token JWT (refresh token pode ser opaco, não precisa validar)
            if (validarTokenJWT(token)) {
              // PRIORIDADE 1: Salva tokens em MEMÓRIA (fonte da verdade)
              set({
                usuario,
                estaAutenticado: true,
                token, // ⭐ Token renovado em memória
                refreshToken: newRefreshToken, // ⭐ Novo refresh token em memória
              })

              // PRIORIDADE 2: Atualiza cookies (backup para persistência)
              cookieUtils.setCookie('auth_token', token, authCookieConfig.token)
              cookieUtils.setCookie(
                'auth_refresh_token',
                newRefreshToken,
                authCookieConfig.refreshToken,
              )

              authLogger.info(
                { action: 'renovar-token', status: 'success' },
                '✅ Token renovado com sucesso e salvo em memória + cookies',
              )
              return true
            } else {
              authLogger.error(
                { action: 'renovar-token', status: 'invalid-tokens' },
                'Tokens recebidos são inválidos',
              )
              return false
            }
          } else {
            // Token inválido ou expirado
            const mensagemErro = sanitizeMensagem(
              resultado.mensagem,
              'Falha na renovação do token',
            )
            authLogger.warn(
              { action: 'renovar-token', status: 'failed', mensagem: mensagemErro },
              mensagemErro,
            )

            // ⭐ DETECÇÃO ESPECÍFICA: Senha expirada
            const senhaExpiradaMensagem = 'Sua senha expirou. Por favor, faça login novamente para redefini-la.'
            if (
              resultado.mensagem === senhaExpiradaMensagem ||
              mensagemErro.includes('senha expirou') ||
              mensagemErro.includes('Sua senha expirou')
            ) {
              authLogger.warn(
                { action: 'renovar-token', status: 'password-expired-logout' },
                'Senha expirada detectada, fazendo logout imediato',
              )

              // Mostra toast com a mensagem
              toast.error(senhaExpiradaMensagem, {
                duration: 5000,
              })

              // Faz logout imediato
              get().logout()

              // Redireciona para login
              window.location.href = '/login'

              return false
            }

            // Apenas faz logout se refresh token realmente expirou (erro 401)
            // Evita logout em erros temporários de rede
            if (mensagemErro.includes('expirado') || mensagemErro.includes('inválido')) {
              authLogger.warn(
                { action: 'renovar-token', status: 'logout-triggered' },
                'Refresh token expirado, fazendo logout',
              )
              get().logout()
            }
            return false
          }
        } catch (erro) {
          const erroMensagem = erro instanceof Error ? erro.message : 'Erro desconhecido'
          authLogger.error(
            { action: 'renovar-token', status: 'error', erro: erroMensagem },
            `Erro na renovação: ${erroMensagem}`,
          )

          // NÃO faz logout automático em erros de rede
          // Apenas loga o erro e retorna false
          // Deixa o interceptador ou próxima tentativa resolver
          if (erroMensagem.includes('Network Error') || erroMensagem.includes('conexão')) {
            authLogger.warn(
              { action: 'renovar-token', status: 'network-error-no-logout' },
              'Erro de rede na renovação, não fazendo logout',
            )
            return false
          }

          // Apenas faz logout em erros críticos (não relacionados a rede)
          authLogger.warn(
            { action: 'renovar-token', status: 'critical-error-logout' },
            'Erro crítico na renovação, fazendo logout',
          )
          get().logout()
          return false
        }
      },

      // Verificação inicial de autenticação
      verificarAutenticacao: async () => {
        try {
          // ⭐ USA GETTERS PARA LER DA MEMÓRIA PRIMEIRO, COOKIES COMO FALLBACK
          const token = get().getToken()
          const refreshToken = get().getRefreshToken()

          // Se não há tokens, usuário não está autenticado
          // Valida apenas o auth_token como JWT (refresh_token pode ser opaco)
          if (!token || !refreshToken || !validarTokenJWT(token)) {
            authLogger.info(
              { action: 'verificar-autenticacao', status: 'no-tokens' },
              'Tokens de autenticação ausentes ou inválidos',
            )
            set({ carregando: false, estaAutenticado: false })
            return
          }

      // Verifica se token está próximo de expirar (menos de 5min)
      const { isTokenNearExpiry } = await import('./auth')
      if (isTokenNearExpiry(token)) {
        authLogger.info(
          { action: 'verificar-autenticacao', status: 'near-expiry' },
          'Token próximo de expirar, renovando proativamente',
        )
        const renovado = await get().renovarToken()
        if (renovado) {
          set({ estaAutenticado: true, carregando: false })
        } else {
          set({ estaAutenticado: false, carregando: false })
        }
        return
      }

      authLogger.info(
        { action: 'verificar-autenticacao', status: 'checking' },
        'Verificando token de acesso',
      )

      // Verifica se o token ainda é válido no backend
      const resultado = await authService.verificarAcesso()

      if (resultado.sucesso && resultado.dados.temAcesso) {
        authLogger.info(
          { action: 'verificar-autenticacao', status: 'valid' },
          'Token de acesso válido',
        )
        set({ estaAutenticado: true, carregando: false })
      } else {
        // Token inválido/expirado, tenta renovar
        authLogger.info(
          { action: 'verificar-autenticacao', status: 'expired' },
          'Token expirado, tentando renovar',
        )
        const renovado = await get().renovarToken()
        if (!renovado) {
          authLogger.warn(
            { action: 'verificar-autenticacao', status: 'renewal-failed' },
            'Falha na renovação, usuário será desconectado',
          )
          set({ estaAutenticado: false, carregando: false })
        }
      }
    } catch (erro) {
      authLogger.error(
        { action: 'verificar-autenticacao', status: 'error' },
        erro instanceof Error
          ? erro.message
          : 'Erro desconhecido na verificação',
      )

      // Se erro for de rede, tenta renovar antes de deslogar
      if (erro instanceof Error && erro.message.includes('Network Error')) {
        authLogger.warn(
          { action: 'verificar-autenticacao', status: 'network-error' },
          'Erro de rede, tentando renovar token',
        )
        const renovado = await get().renovarToken()
        if (renovado) {
          set({ estaAutenticado: true, carregando: false })
          return
        }
      }

      set({ estaAutenticado: false, carregando: false })
    }
  },

  // Limpar erro
  limparErro: () => set({ erro: null }),
}))
