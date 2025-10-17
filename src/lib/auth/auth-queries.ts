import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  ConfirmarCodigo2FARequest,
  EsqueciSenhaRequest,
  LoginRequest,
  TrocarSenhaRequest,
  Usuario,
} from '@/types/auth'

import { createServiceLogger } from '../logger'

import { getTokenInfo } from './auth'
import { authService } from './auth-service'
import { cookieUtils, authCookieConfig } from './cookie-utils'

const authLogger = createServiceLogger('auth-queries')

/**
 * Query para buscar dados do usuário atual
 * Extrai informações diretamente do token JWT
 * Apenas executa se enabled=true (quando há cookies válidos)
 */
export const useMeQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<Usuario> => {
      authLogger.info(
        { action: 'fetch-user', status: 'decoding-token' },
        'Extraindo dados do usuário do token JWT',
      )

      try {
        // Obtém token dos cookies
        const token = cookieUtils.getCookie('auth_token')

        if (!token) {
          authLogger.warn(
            { action: 'fetch-user', status: 'no-token' },
            'Token não encontrado nos cookies',
          )
          throw new Error('Token não encontrado')
        }

        // Decodifica token
        const payload = getTokenInfo(token)

        if (!payload) {
          authLogger.error(
            { action: 'fetch-user', status: 'invalid-token' },
            'Não foi possível decodificar o token',
          )
          throw new Error('Token inválido')
        }

        authLogger.debug(
          {
            action: 'fetch-user',
            status: 'token-decoded',
            usuarioId: payload.usuarioId,
            nomePermissao: payload.nomePermissao,
          },
          'Token decodificado com sucesso',
        )

        // Mapeia payload do token para interface Usuario
        const usuario: Usuario = {
          id: payload.usuarioId,
          email: payload.sub,
          nomeCompleto: payload.nomeCompleto,
          tipoUsuario: payload.nomePermissao,
          precisaTrocarSenha: false,
          emailConfirmado: true,
          ativo: true,
        }

        authLogger.info(
          {
            action: 'fetch-user',
            status: 'success',
            usuarioId: usuario.id,
            tipoUsuario: usuario.tipoUsuario,
          },
          'Dados do usuário extraídos do token com sucesso',
        )

        return usuario
      } catch (error) {
        authLogger.error(
          {
            action: 'fetch-user',
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          'Erro ao extrair dados do usuário do token',
        )
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: false, // Não tenta novamente em caso de erro
    ...options,
  })
}

/**
 * Mutation para login (primeira etapa - envia código 2FA)
 */
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async ({ email, senha }: LoginRequest) => {
      authLogger.info(
        { action: 'login', status: 'requesting' },
        'Iniciando login',
      )

      const resultado = await authService.login(email, senha)

      if (!resultado.sucesso) {
        authLogger.error(
          { action: 'login', status: 'failed' },
          resultado.mensagem ?? 'Erro no login',
        )
        throw new Error(resultado.mensagem ?? 'Erro no login')
      }

      authLogger.info(
        { action: 'login', status: 'success' },
        'Código 2FA enviado com sucesso',
      )

      return resultado
    },
  })
}

/**
 * Mutation para confirmar código 2FA (segunda etapa)
 */
export const useConfirm2FAMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, codigo }: ConfirmarCodigo2FARequest) => {
      authLogger.info(
        { action: 'confirm-2fa', status: 'requesting' },
        'Confirmando código 2FA',
      )

      const resultado = await authService.confirmarCodigo2FA(email, codigo)

      // Verifica se precisa trocar senha
      if (resultado.precisaTrocarSenha || resultado.senhaExpirada) {
        authLogger.info(
          { action: 'confirm-2fa', status: 'password-change-required' },
          'Troca de senha obrigatória detectada',
        )

        // Salva tokens se fornecidos
        if (resultado.dados) {
          cookieUtils.setCookie(
            'auth_token',
            resultado.dados.token,
            authCookieConfig.token,
          )
          cookieUtils.setCookie(
            'auth_refresh_token',
            resultado.dados.refreshToken,
            authCookieConfig.refreshToken,
          )

          // Invalida cache para buscar usuário
          await queryClient.invalidateQueries({ queryKey: ['me'] })
        }

        return { ...resultado, requiresPasswordChange: true }
      }

      if (!resultado.sucesso) {
        authLogger.error(
          { action: 'confirm-2fa', status: 'failed' },
          resultado.mensagem ?? 'Erro ao confirmar código 2FA',
        )
        throw new Error(resultado.mensagem ?? 'Erro ao confirmar código 2FA')
      }

      // Salva tokens nos cookies
      if (resultado.dados) {
        cookieUtils.setCookie(
          'auth_token',
          resultado.dados.token,
          authCookieConfig.token,
        )
        cookieUtils.setCookie(
          'auth_refresh_token',
          resultado.dados.refreshToken,
          authCookieConfig.refreshToken,
        )

        authLogger.info(
          { action: 'confirm-2fa', status: 'success' },
          'Autenticação 2FA concluída com sucesso',
        )

        // Invalida cache para buscar usuário atualizado
        await queryClient.invalidateQueries({ queryKey: ['me'] })
      }

      return resultado
    },
  })
}

/**
 * Mutation para trocar senha
 */
export const usePasswordChangeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      email,
      novaSenha,
      tokenTrocaSenha,
    }: TrocarSenhaRequest) => {
      authLogger.info(
        { action: 'change-password', status: 'requesting' },
        'Solicitando troca de senha',
      )

      const resultado = await authService.trocarSenha(
        email,
        novaSenha,
        tokenTrocaSenha,
      )

      if (!resultado.sucesso) {
        authLogger.error(
          { action: 'change-password', status: 'failed' },
          resultado.mensagem ?? 'Erro ao trocar senha',
        )
        throw new Error(resultado.mensagem ?? 'Erro ao trocar senha')
      }

      // Salva tokens nos cookies
      cookieUtils.setCookie(
        'auth_token',
        resultado.dados.token,
        authCookieConfig.token,
      )
      cookieUtils.setCookie(
        'auth_refresh_token',
        resultado.dados.refreshToken,
        authCookieConfig.refreshToken,
      )

      authLogger.info(
        { action: 'change-password', status: 'success' },
        'Senha alterada com sucesso',
      )

      // Invalida cache para buscar usuário atualizado
      await queryClient.invalidateQueries({ queryKey: ['me'] })

      return resultado
    },
  })
}

/**
 * Mutation para recuperar senha (esqueci senha)
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async ({ email }: EsqueciSenhaRequest) => {
      authLogger.info(
        { action: 'forgot-password', status: 'requesting' },
        'Solicitando recuperação de senha',
      )

      const resultado = await authService.esqueciSenha(email)

      if (!resultado.sucesso) {
        authLogger.error(
          { action: 'forgot-password', status: 'failed' },
          resultado.mensagem ?? 'Erro ao solicitar recuperação',
        )
        throw new Error(resultado.mensagem ?? 'Erro ao solicitar recuperação')
      }

      authLogger.info(
        { action: 'forgot-password', status: 'success' },
        'Email de recuperação enviado',
      )

      return resultado
    },
  })
}

/**
 * Mutation para logout
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = cookieUtils.getCookie('auth_refresh_token')

      authLogger.info(
        { action: 'logout', status: 'requesting' },
        'Realizando logout',
      )

      if (refreshToken) {
        try {
          await authService.logout(refreshToken)
          authLogger.info(
            { action: 'logout', status: 'success' },
            'Sessão encerrada no servidor',
          )
        } catch (erro) {
          authLogger.warn(
            { action: 'logout', status: 'server-error' },
            erro instanceof Error
              ? erro.message
              : 'Erro ao encerrar sessão no servidor',
          )
          // Continua o logout local mesmo se falhar no servidor
        }
      }
    },
    onSettled: () => {
      // Remove cookies
      cookieUtils.removeCookie('auth_token', authCookieConfig.token)
      cookieUtils.removeCookie(
        'auth_refresh_token',
        authCookieConfig.refreshToken,
      )

      // Limpa todo cache do React Query
      queryClient.removeQueries()

      // Limpa sessionStorage
      sessionStorage.clear()

      toast.success("Logout concluído")

      authLogger.info(
        { action: 'logout', status: 'completed' },
        'Logout local concluído',
      )
    },
  })
}

/**
 * Mutation para logout de todas as sessões
 */
export const useLogoutAllSessionsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = cookieUtils.getCookie('auth_refresh_token')

      authLogger.info(
        { action: 'logout-all', status: 'requesting' },
        'Encerrando todas as sessões',
      )

      if (refreshToken) {
        await authService.logoutTodasSessoes(refreshToken)
        authLogger.info(
          { action: 'logout-all', status: 'success' },
          'Todas as sessões encerradas no servidor',
        )
      }
    },
    onSettled: () => {
      // Remove cookies
      cookieUtils.removeCookie('auth_token', authCookieConfig.token)
      cookieUtils.removeCookie(
        'auth_refresh_token',
        authCookieConfig.refreshToken,
      )

      // Limpa todo cache
      queryClient.removeQueries()

      authLogger.info(
        { action: 'logout-all', status: 'completed' },
        'Logout de todas as sessões concluído, redirecionando...',
      )

      // Salva flag para mostrar toast após reload
      // Precisa ser feito ANTES de limpar sessionStorage
      sessionStorage.setItem('show_logout_success_toast', 'true')

      // Limpa sessionStorage (exceto a flag do toast)
      const logoutToastFlag = sessionStorage.getItem('show_logout_success_toast')
      sessionStorage.clear()
      if (logoutToastFlag) {
        sessionStorage.setItem('show_logout_success_toast', logoutToastFlag)
      }

      // Força reload completo da página para garantir estado limpo
      // Não usa navigate() para evitar race conditions com React Query e Context
      // Toast será mostrado após o reload na página de login
      window.location.href = '/login'
    },
  })
}
