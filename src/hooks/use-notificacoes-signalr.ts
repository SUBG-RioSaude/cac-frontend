/**
 * Hook React para gerenciamento de conexão SignalR
 * Integra com TanStack Query para invalidação de cache
 */

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getToken } from '@/lib/auth/auth'
import { notificacaoSignalR } from '@/services/notificacao-signalr'
import type { NotificacaoUsuario, StatusConexao } from '@/types/notificacao'

import { notificacoesQueryKeys } from './use-notificacoes-query'

// ============================================================================
// HOOK
// ============================================================================

/**
 * Opções do hook SignalR
 */
interface OpcoesSignalR {
  /**
   * Se deve conectar automaticamente ao montar
   * @default true
   */
  autoConectar?: boolean

  /**
   * Callback chamado ao receber nova notificação
   */
  aoReceberNotificacao?: (notificacao: NotificacaoUsuario) => void

  /**
   * Callback chamado quando reconectar
   */
  aoReconectar?: () => void

  /**
   * Callback chamado quando desconectar
   */
  aoDesconectar?: () => void
}

/**
 * Hook para gerenciar conexão SignalR de notificações
 * Automaticamente invalida queries do TanStack Query quando recebe eventos
 *
 * @param opcoes - Opções de configuração
 * @returns Estado e controles da conexão SignalR
 *
 * @example
 * ```tsx
 * const { conectado, status } = useNotificacoesSignalR({
 *   aoReceberNotificacao: (notificacao) => {
 *     console.log('Nova notificação:', notificacao)
 *   }
 * })
 * ```
 */
export const useNotificacoesSignalR = (opcoes: OpcoesSignalR = {}) => {
  const {
    autoConectar = true,
    aoReceberNotificacao,
    aoReconectar,
    aoDesconectar,
  } = opcoes

  const queryClient = useQueryClient()
  const [status, setStatus] = useState<StatusConexao>('desconectado')

  /**
   * Conecta ao SignalR
   */
  const conectar = async () => {
    try {
      const token = getToken()
      if (!token) {
        console.warn('[SignalR Hook] Token JWT não encontrado')
        return
      }

      await notificacaoSignalR.conectar(token)
      setStatus('conectado')
    } catch (erro) {
      console.error('[SignalR Hook] Erro ao conectar:', erro)
      setStatus('desconectado')
    }
  }

  /**
   * Desconecta do SignalR
   */
  const desconectar = async () => {
    try {
      await notificacaoSignalR.desconectar()
      setStatus('desconectado')
    } catch (erro) {
      console.error('[SignalR Hook] Erro ao desconectar:', erro)
    }
  }

  /**
   * Effect: Conectar/desconectar ao montar/desmontar
   */
  useEffect(() => {
    if (autoConectar) {
      conectar()
    }

    return () => {
      desconectar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Effect: Configurar event listeners
   */
  useEffect(() => {
    // Handler: Nova notificação recebida
    const handleNovaNotificacao = (notificacao: NotificacaoUsuario) => {
      console.log('[SignalR Hook] Nova notificação recebida')

      // Invalida queries para refetch automático
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.naoLidas(),
      })

      // Callback customizado
      if (aoReceberNotificacao) {
        aoReceberNotificacao(notificacao)
      }
    }

    // Handler: Notificação marcada como lida
    const handleNotificacaoLida = (notificacaoId: string) => {
      console.log('[SignalR Hook] Notificação marcada como lida:', notificacaoId)

      // Invalida queries
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.naoLidas(),
      })
    }

    // Handler: Reconectado
    const handleReconectado = () => {
      console.log('[SignalR Hook] Reconectado ao Hub')
      setStatus('conectado')

      // Recarrega todas as queries após reconexão
      queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })

      // Callback customizado
      if (aoReconectar) {
        aoReconectar()
      }
    }

    // Handler: Reconectando
    const handleReconectando = () => {
      console.log('[SignalR Hook] Tentando reconectar...')
      setStatus('reconectando')
    }

    // Handler: Desconectado
    const handleDesconectado = () => {
      console.log('[SignalR Hook] Desconectado do Hub')
      setStatus('desconectado')

      // Callback customizado
      if (aoDesconectar) {
        aoDesconectar()
      }
    }

    // Registrar listeners
    notificacaoSignalR.on('ReceberNotificacao', handleNovaNotificacao)
    notificacaoSignalR.on('NotificacaoLida', handleNotificacaoLida)
    notificacaoSignalR.on('reconectado', handleReconectado)
    notificacaoSignalR.on('reconectando', handleReconectando)
    notificacaoSignalR.on('desconectado', handleDesconectado)

    // Cleanup: remover listeners ao desmontar
    return () => {
      notificacaoSignalR.off('ReceberNotificacao', handleNovaNotificacao)
      notificacaoSignalR.off('NotificacaoLida', handleNotificacaoLida)
      notificacaoSignalR.off('reconectado', handleReconectado)
      notificacaoSignalR.off('reconectando', handleReconectando)
      notificacaoSignalR.off('desconectado', handleDesconectado)
    }
  }, [
    queryClient,
    aoReceberNotificacao,
    aoReconectar,
    aoDesconectar,
  ])

  return {
    /**
     * Status da conexão
     */
    status,

    /**
     * Se está conectado
     */
    conectado: status === 'conectado',

    /**
     * Se está reconectando
     */
    reconectando: status === 'reconectando',

    /**
     * Se está desconectado
     */
    desconectado: status === 'desconectado',

    /**
     * Connection ID (se conectado)
     */
    connectionId: notificacaoSignalR.connectionId,

    /**
     * Conectar manualmente
     */
    conectar,

    /**
     * Desconectar manualmente
     */
    desconectar,
  }
}
