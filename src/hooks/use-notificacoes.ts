/**
 * Hook facade principal para gerenciamento de notificações
 * Combina TanStack Query + SignalR + Sons + Notificações Nativas
 *
 * Substitui completamente o Zustand store
 */

import { differenceInDays } from 'date-fns'
import { useEffect, useMemo } from 'react'

import {
  mostrarNotificacaoDeAPI,
  solicitarPermissao as solicitarPermissaoNotificacoes,
} from '@/lib/browser-notifications'
import { tocarSomNotificacao } from '@/lib/notification-sound'
import type {
  FiltrosNotificacao,
  NotificacaoUsuario,
  OpcoesNotificacoes,
} from '@/types/notificacao'

import {
  useNotificacoesQueryCombinado,
  useArquivarTodasLidasMutation,
} from './use-notificacoes-query'
import { useNotificacoesSignalR } from './use-notificacoes-signalr'

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook principal para gerenciamento completo de notificações
 *
 * Funcionalidades:
 * - Lista notificações via TanStack Query
 * - Conecta SignalR para tempo real
 * - Toca som ao receber notificação
 * - Mostra notificações nativas do navegador
 * - Auto-arquiva notificações antigas (30+ dias)
 * - Otimistic updates em ações
 *
 * @param filtros - Filtros de notificações (página, tipo, etc.)
 * @param opcoes - Opções de configuração
 * @returns Estado e ações de notificações
 *
 * @example
 * ```tsx
 * function MeuComponente() {
 *   const {
 *     notificacoes,
 *     naoLidas,
 *     conectado,
 *     marcarComoLida,
 *     arquivar,
 *   } = useNotificacoes()
 *
 *   return (
 *     <div>
 *       {conectado && <span>🟢 Online</span>}
 *       <p>{naoLidas} não lidas</p>
 *       {notificacoes.map(n => (
 *         <div key={n.id}>
 *           {n.titulo}
 *           <button onClick={() => marcarComoLida(n.id)}>✓</button>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useNotificacoes = (
  filtros: FiltrosNotificacao = {},
  opcoes: OpcoesNotificacoes = {},
) => {
  const {
    autoConectar = true,
    solicitarPermissaoNativa = true,
    habilitarSom = true,
    intervaloAutoArquivamento = 86400000, // 24 horas
  } = opcoes

  // ============================================================================
  // QUERIES E MUTATIONS
  // ============================================================================

  const {
    notificacoesQuery,
    naoLidasQuery,
    preferenciasQuery,
    marcarLidaMutation,
    arquivarMutation,
    marcarTodasLidasMutation,
    deletarMutation,
    isLoading,
    isError,
  } = useNotificacoesQueryCombinado(filtros)

  const arquivarTodasLidasMutation = useArquivarTodasLidasMutation()

  // ============================================================================
  // SIGNALR
  // ============================================================================

  const signalr = useNotificacoesSignalR({
    autoConectar,
    aoReceberNotificacao: (notificacao: NotificacaoUsuario) => {
      // Toca som (se habilitado)
      if (habilitarSom) {
        tocarSomNotificacao()
      }

      // Mostra notificação nativa (se permitido)
      mostrarNotificacaoDeAPI(notificacao)
    },
  })

  // ============================================================================
  // PERMISSÃO DE NOTIFICAÇÕES NATIVAS
  // ============================================================================

  useEffect(() => {
    if (solicitarPermissaoNativa) {
      // Solicita permissão na primeira montagem
      solicitarPermissaoNotificacoes().catch((erro) => {
        console.warn('[useNotificacoes] Erro ao solicitar permissão:', erro)
      })
    }
  }, [solicitarPermissaoNativa])

  // ============================================================================
  // AUTO-ARQUIVAMENTO (30+ DIAS)
  // ============================================================================

  useEffect(() => {
    const verificarEArquivarAntigas = async () => {
      if (!notificacoesQuery.data) return

      const notificacoesAntigas = notificacoesQuery.data.items.filter((n) => {
        if (n.arquivada) return false

        const diasDesdeCriacao = differenceInDays(
          new Date(),
          new Date(n.criadoEm),
        )
        return diasDesdeCriacao >= 30
      })

      if (notificacoesAntigas.length > 0) {
        console.log(
          `[useNotificacoes] Auto-arquivando ${notificacoesAntigas.length} notificações antigas`,
        )

        // Arquiva todas as lidas (inclui as antigas)
        await arquivarTodasLidasMutation.mutateAsync(undefined)
      }
    }

    // Verifica imediatamente
    verificarEArquivarAntigas()

    // Configura timer para verificação periódica
    const timer = setInterval(
      verificarEArquivarAntigas,
      intervaloAutoArquivamento,
    )

    return () => clearInterval(timer)
  }, [
    notificacoesQuery.data,
    arquivarTodasLidasMutation,
    intervaloAutoArquivamento,
  ])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Notificações não arquivadas (lista principal)
   */
  const notificacoes = useMemo(() => {
    return notificacoesQuery.data?.items ?? []
  }, [notificacoesQuery.data])

  /**
   * Notificações não lidas (não arquivadas)
   */
  const notificacoesNaoLidas = useMemo(() => {
    return notificacoes.filter((n) => !n.lida && !n.arquivada)
  }, [notificacoes])

  /**
   * Notificações lidas (não arquivadas)
   */
  const notificacoesLidas = useMemo(() => {
    return notificacoes.filter((n) => n.lida && !n.arquivada)
  }, [notificacoes])

  /**
   * Limite de 20 notificações para exibição
   */
  const notificacoesVisiveis = useMemo(() => {
    return notificacoes.slice(0, 20)
  }, [notificacoes])

  /**
   * Contagem de não lidas
   */
  const contagemNaoLidas = useMemo(() => {
    return naoLidasQuery.data?.naoLidas ?? notificacoesNaoLidas.length
  }, [naoLidasQuery.data, notificacoesNaoLidas.length])

  // ============================================================================
  // AÇÕES (Wrappers para mutations)
  // ============================================================================

  const marcarComoLida = (id: string) => {
    marcarLidaMutation.mutate(id)
  }

  const arquivar = (id: string) => {
    arquivarMutation.mutate(id)
  }

  const marcarTodasComoLidas = (sistemaId?: string) => {
    marcarTodasLidasMutation.mutate(sistemaId)
  }

  const arquivarTodasLidas = (sistemaId?: string) => {
    arquivarTodasLidasMutation.mutate(sistemaId)
  }

  const deletar = (id: string) => {
    deletarMutation.mutate(id)
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // ========== DADOS ==========
    /**
     * Lista completa de notificações (não arquivadas)
     */
    notificacoes,

    /**
     * Notificações não lidas
     */
    notificacoesNaoLidas,

    /**
     * Notificações lidas
     */
    notificacoesLidas,

    /**
     * Primeiras 20 notificações (para exibição no dropdown)
     */
    notificacoesVisiveis,

    /**
     * Contagem total de não lidas
     */
    contagemNaoLidas,

    /**
     * Total de notificações não arquivadas
     */
    total: notificacoesQuery.data?.naoLidas ?? 0,

    /**
     * Preferências do usuário
     */
    preferencias: preferenciasQuery.data ?? [],

    /**
     * Informações de paginação
     */
    paginacao: {
      page: notificacoesQuery.data?.page ?? 1,
      pageSize: notificacoesQuery.data?.pageSize ?? 20,
    },

    // ========== ESTADOS ==========
    /**
     * Se está carregando dados
     */
    isLoading,

    /**
     * Se houve erro ao carregar
     */
    isError,

    /**
     * Status da conexão SignalR
     */
    statusConexao: signalr.status,

    /**
     * Se está conectado ao SignalR
     */
    conectado: signalr.conectado,

    /**
     * Se está reconectando ao SignalR
     */
    reconectando: signalr.reconectando,

    // ========== AÇÕES ==========
    /**
     * Marca notificação como lida
     */
    marcarComoLida,

    /**
     * Arquiva notificação
     */
    arquivar,

    /**
     * Marca todas as notificações como lidas
     */
    marcarTodasComoLidas,

    /**
     * Arquiva todas as notificações lidas
     */
    arquivarTodasLidas,

    /**
     * Deleta notificação permanentemente
     */
    deletar,

    // ========== QUERIES/MUTATIONS BRUTAS ==========
    /**
     * Query de notificações (para uso avançado)
     */
    notificacoesQuery,

    /**
     * Query de não lidas (para uso avançado)
     */
    naoLidasQuery,

    /**
     * Query de preferências (para uso avançado)
     */
    preferenciasQuery,

    /**
     * Mutation de marcar como lida (para uso avançado)
     */
    marcarLidaMutation,

    /**
     * Mutation de arquivar (para uso avançado)
     */
    arquivarMutation,

    /**
     * Mutation de deletar (para uso avançado)
     */
    deletarMutation,

    // ========== SIGNALR CONTROLES ==========
    /**
     * Conecta ao SignalR manualmente
     */
    conectarSignalR: signalr.conectar,

    /**
     * Desconecta do SignalR manualmente
     */
    desconectarSignalR: signalr.desconectar,

    /**
     * Connection ID do SignalR (se conectado)
     */
    connectionId: signalr.connectionId,
  }
}

/**
 * Tipo do retorno do hook useNotificacoes
 * Útil para tipar componentes que recebem o resultado
 */
export type UseNotificacoesReturn = ReturnType<typeof useNotificacoes>
