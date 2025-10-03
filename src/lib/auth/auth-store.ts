import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      usuario: null,
      estaAutenticado: false,
      carregando: false,
      erro: null,

      // Login - Primeira etapa (envia código 2FA)
      login: async (email: string, senha: string) => {
        try {
          set({ carregando: true, erro: null })

          const resultado = await authService.login(email, senha)

          if (resultado.sucesso) {
            // Salva email para próxima etapa
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
            erro:
              erro instanceof Error ? erro.message : 'Erro inesperado no login',
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
          if (resultado.precisaTrocarSenha) {
            sessionStorage.setItem(
              'tokenTrocaSenha',
              resultado.tokenTrocaSenha ?? '',
            )
            sessionStorage.setItem('auth_email', email)
            sessionStorage.setItem('auth_context', 'password_reset') // Define contexto correto para troca de senha
            set({ carregando: false, erro: null }) // Limpa qualquer erro
            window.location.href = '/auth/trocar-senha' // Redireciona
            return false // Indica que o fluxo de autenticação não foi concluído (ainda precisa trocar senha)
          }

          // Se não precisa trocar senha, verifica o sucesso normal
          if (resultado.sucesso) {
            // Login bem-sucedido - salva tokens nos cookies
            if (resultado.dados) {
              const { token, refreshToken, usuario } = resultado.dados

              // Valida tokens antes de salvar
              if (validarTokenJWT(token) && validarTokenJWT(refreshToken)) {
                // Salva tokens nos cookies com configurações de segurança
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

                set({
                  usuario,
                  estaAutenticado: true,
                  carregando: false,
                  erro: null,
                })
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

            // Valida tokens antes de salvar
            const tokenValido = validarTokenJWT(token)
            const refreshTokenValido = validarTokenJWT(refreshToken)

            if (tokenValido && refreshTokenValido) {
              // Salva tokens nos cookies com configurações de segurança
              cookieUtils.setCookie('auth_token', token, authCookieConfig.token)
              cookieUtils.setCookie(
                'auth_refresh_token',
                refreshToken,
                authCookieConfig.refreshToken,
              )

              set({
                usuario,
                estaAutenticado: true,
                carregando: false,
                erro: null,
              })

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
        const refreshToken = cookieUtils.getCookie('auth_refresh_token')

        // Invalida token no servidor (não bloqueia UI)
        if (refreshToken && validarTokenJWT(refreshToken)) {
          authService.logout(refreshToken).catch((erro) => {
            authLogger.warn(
              { action: 'logout', scope: 'single-session' },
              erro instanceof Error
                ? erro.message
                : 'Erro desconhecido ao encerrar sessão',
            )
          })
        }

        // Remove tokens dos cookies
        cookieUtils.removeCookie('auth_token', authCookieConfig.token)
        cookieUtils.removeCookie(
          'auth_refresh_token',
          authCookieConfig.refreshToken,
        )

        set({
          usuario: null,
          estaAutenticado: false,
          carregando: false,
          erro: null,
        })

        // Limpa dados da sessão
        sessionStorage.clear()
      },

      // Logout de todas as sessões
      logoutTodasSessoes: async () => {
        try {
          const refreshToken = cookieUtils.getCookie('auth_refresh_token')

          if (refreshToken && validarTokenJWT(refreshToken)) {
            await authService.logoutTodasSessoes(refreshToken)
          }

          // Remove tokens dos cookies
          cookieUtils.removeCookie('auth_token', authCookieConfig.token)
          cookieUtils.removeCookie(
            'auth_refresh_token',
            authCookieConfig.refreshToken,
          )

          set({
            usuario: null,
            estaAutenticado: false,
            carregando: false,
            erro: null,
          })

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
          const refreshToken = cookieUtils.getCookie('auth_refresh_token')

          if (!refreshToken || !validarTokenJWT(refreshToken)) {
            return false
          }

          const resultado = await authService.renovarToken(refreshToken)

          if (resultado.sucesso) {
            const {
              token,
              refreshToken: newRefreshToken,
              usuario,
            } = resultado.dados

            // Valida novos tokens antes de salvar
            if (validarTokenJWT(token) && validarTokenJWT(newRefreshToken)) {
              // Atualiza tokens nos cookies
              cookieUtils.setCookie('auth_token', token, authCookieConfig.token)
              cookieUtils.setCookie(
                'auth_refresh_token',
                newRefreshToken,
                authCookieConfig.refreshToken,
              )

              set({
                usuario,
                estaAutenticado: true,
              })
              return true
            } else {
              return false
            }
          } else {
            // Token inválido, faz logout
            get().logout()
            return false
          }
        } catch {
          get().logout()
          return false
        }
      },

      // Verificação inicial de autenticação
      verificarAutenticacao: async () => {
        try {
          const token = cookieUtils.getCookie('auth_token')
          const refreshToken = cookieUtils.getCookie('auth_refresh_token')

          if (
            !token ||
            !refreshToken ||
            !validarTokenJWT(token) ||
            !validarTokenJWT(refreshToken)
          ) {
            set({ carregando: false, estaAutenticado: false })
            return
          }

          // Verifica se o token ainda é válido
          const resultado = await authService.verificarAcesso()

          if (resultado.sucesso) {
            set({ estaAutenticado: true, carregando: false })
          } else {
            // Tenta renovar o token
            const renovado = await get().renovarToken()
            if (!renovado) {
              set({ estaAutenticado: false, carregando: false })
            }
          }
        } catch {
          set({ estaAutenticado: false, carregando: false })
        }
      },

      // Limpar erro
      limparErro: () => set({ erro: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        estaAutenticado: state.estaAutenticado,
      }),
    },
  ),
)
