/**
 * Hook React para gerenciamento de conexão SignalR
 * Integra com TanStack Query para invalidação de cache
 */

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getToken } from '@/lib/auth/auth'
import { notificacaoSignalR } from '@/services/notificacao-signalr'
import type {
  Broadcast,
  NotificacaoUsuario,
  StatusConexao,
} from '@/types/notificacao'

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
   * Callback chamado ao receber broadcast (alerta global)
   */
  aoReceberBroadcast?: (broadcast: Broadcast) => void

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
    aoReceberBroadcast,
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
        return
      }

      await notificacaoSignalR.conectar(token)
      setStatus('conectado')
    } catch {
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
    } catch {
      // Ignora erro ao desconectar
    }
  }

  /**
   * Effect: Conectar/desconectar ao montar/desmontar
   */
  useEffect(() => {
    let montado = true

    const iniciarConexao = async () => {
      if (autoConectar && montado) {
        // Só conecta se já não estiver conectado/conectando
        if (notificacaoSignalR.estaConectado) {
          setStatus('conectado')
          return
        }

        await conectar()
      }
    }

    void iniciarConexao()

    return () => {
      montado = false
      // Só desconecta se estiver realmente conectado
      if (notificacaoSignalR.estaConectado) {
        void desconectar()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Effect: Configurar event listeners
   */
  useEffect(() => {
    // Handler: Nova notificação recebida
    const handleNovaNotificacao = (notificacao: NotificacaoUsuario) => {
      // Invalida queries para refetch automático
      void queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.naoLidas(),
      })

      // Callback customizado
      if (aoReceberNotificacao) {
        aoReceberNotificacao(notificacao)
      }
    }

    // Handler: Notificação marcada como lida
    const handleNotificacaoLida = () => {
      // Invalida queries
      void queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.naoLidas(),
      })
    }

    // Handler: Broadcast recebido (alerta global temporário)
    const handleBroadcast = (broadcast: Broadcast) => {
      // Callback customizado
      if (aoReceberBroadcast) {
        aoReceberBroadcast(broadcast)
      }
    }

    // Handler: Reconectado
    const handleReconectado = () => {
      setStatus('conectado')

      // Recarrega todas as queries após reconexão
      void queryClient.invalidateQueries({
        queryKey: notificacoesQueryKeys.all,
      })

      // Callback customizado
      if (aoReconectar) {
        aoReconectar()
      }
    }

    // Handler: Reconectando
    const handleReconectando = () => {
      setStatus('reconectando')
    }

    // Handler: Desconectado
    const handleDesconectado = () => {
      setStatus('desconectado')

      // Callback customizado
      if (aoDesconectar) {
        aoDesconectar()
      }
    }

    // Registrar listeners
    notificacaoSignalR.on('ReceberNotificacao', handleNovaNotificacao)
    notificacaoSignalR.on('NotificacaoLida', handleNotificacaoLida)
    notificacaoSignalR.on('ReceiveBroadcast', handleBroadcast)
    notificacaoSignalR.on('reconectado', handleReconectado)
    notificacaoSignalR.on('reconectando', handleReconectando)
    notificacaoSignalR.on('desconectado', handleDesconectado)

    // Cleanup: remover listeners ao desmontar
    return () => {
      notificacaoSignalR.off('ReceberNotificacao', handleNovaNotificacao)
      notificacaoSignalR.off('NotificacaoLida', handleNotificacaoLida)
      notificacaoSignalR.off('ReceiveBroadcast', handleBroadcast)
      notificacaoSignalR.off('reconectado', handleReconectado)
      notificacaoSignalR.off('reconectando', handleReconectando)
      notificacaoSignalR.off('desconectado', handleDesconectado)
    }
  }, [
    queryClient,
    aoReceberNotificacao,
    aoReceberBroadcast,
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
