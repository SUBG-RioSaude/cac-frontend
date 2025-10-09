import { useEffect, useRef } from 'react'

import { getToken, isTokenNearExpiry } from '@/lib/auth/auth'
import { useAuthStore } from '@/lib/auth/auth-store'
import { createServiceLogger } from '@/lib/logger'

const logger = createServiceLogger('use-token-renewal')

/**
 * Hook para renovação proativa de tokens antes de expirarem
 *
 * Verifica periodicamente (a cada 1 minuto) se o token está próximo de expirar.
 * Se faltar menos de 5 minutos para expirar, renova automaticamente.
 *
 * @param checkInterval - Intervalo de verificação em milissegundos (padrão: 60000 = 1 minuto)
 */
export const useTokenRenewal = (checkInterval = 60000) => {
  const { renovarToken, estaAutenticado, logout } = useAuthStore()
  const renovacaoEmAndamentoRef = useRef(false)

  useEffect(() => {
    // Só executa se o usuário estiver autenticado
    if (!estaAutenticado) {
      return
    }

    // Função para verificar e renovar token se necessário
    const verificarERenovar = async () => {
      // Evita múltiplas renovações simultâneas
      if (renovacaoEmAndamentoRef.current) {
        logger.info(
          { action: 'token-check', status: 'skipped' },
          'Renovação já em andamento, pulando verificação',
        )
        return
      }

      const token = getToken()

      // Se não tem token, aguarda sincronização (middleware já valida inconsistências)
      if (!token) {
        logger.warn(
          { action: 'token-check', status: 'no-token' },
          'Token não encontrado - aguardando sincronização de cookies',
        )
        // Não faz logout aqui - deixa o middleware validar
        // Isso evita logout falso positivo durante login quando cookies ainda não sincronizaram
        return
      }

      // Verifica se o token está próximo de expirar
      if (isTokenNearExpiry(token)) {
        logger.info(
          { action: 'token-renewal', status: 'starting' },
          'Token próximo de expirar, iniciando renovação proativa',
        )

        renovacaoEmAndamentoRef.current = true

        try {
          const sucesso = await renovarToken()

          if (sucesso) {
            logger.info(
              { action: 'token-renewal', status: 'success' },
              'Token renovado com sucesso',
            )
          } else {
            logger.error(
              { action: 'token-renewal', status: 'failed' },
              'Falha na renovação proativa do token',
            )
            // Se a renovação falhar, faz logout
            logout()
          }
        } catch (erro) {
          logger.error(
            { action: 'token-renewal', status: 'error' },
            erro instanceof Error ? erro.message : 'Erro desconhecido na renovação',
          )
          // Em caso de erro, faz logout por segurança
          logout()
        } finally {
          renovacaoEmAndamentoRef.current = false
        }
      } else {
        logger.debug(
          { action: 'token-check', status: 'valid' },
          'Token ainda válido, não precisa renovar',
        )
      }
    }

    // Aguarda 500ms antes da primeira verificação para permitir sincronização de cookies
    // Isso evita logout falso positivo logo após login/2FA quando cookies ainda não foram sincronizados
    const initialCheckTimeout = setTimeout(() => {
      logger.info(
        { action: 'token-check', status: 'initial-check' },
        'Iniciando verificação inicial de token',
      )
      void verificarERenovar()
    }, 500)

    // Configura intervalo de verificação periódica
    const intervalo = setInterval(() => {
      void verificarERenovar()
    }, checkInterval)

    // Cleanup ao desmontar
    return () => {
      clearTimeout(initialCheckTimeout)
      clearInterval(intervalo)
    }
  }, [estaAutenticado, renovarToken, logout, checkInterval])
}
