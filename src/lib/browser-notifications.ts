/**
 * Utilitários para notificações nativas do navegador
 * Gerencia permissões e exibição de notificações
 */

import type { NotificacaoUsuario, TipoNotificacao } from '@/types/notificacao'

import {
  obterPreferenciasLocais,
  salvarPreferenciasLocais,
} from './notification-sound'

// ============================================================================
// VERIFICAÇÕES
// ============================================================================

/**
 * Verifica se o navegador suporta notificações
 *
 * @returns true se suportado
 */
export const navegadorSuportaNotificacoes = (): boolean => {
  return 'Notification' in window
}

/**
 * Verifica se as notificações estão habilitadas
 * Considera tanto a permissão do navegador quanto as preferências do usuário
 *
 * @returns true se habilitadas
 */
export const notificacoesEstaoHabilitadas = (): boolean => {
  if (!navegadorSuportaNotificacoes()) {
    return false
  }

  const preferencias = obterPreferenciasLocais()
  return (
    Notification.permission === 'granted' &&
    preferencias.notificacoesNativasHabilitadas
  )
}

// ============================================================================
// PERMISSÕES
// ============================================================================

/**
 * Obtém o status atual de permissão
 *
 * @returns Status de permissão: 'granted', 'denied' ou 'default'
 */
export const obterStatusPermissao = (): NotificationPermission => {
  if (!navegadorSuportaNotificacoes()) {
    return 'denied'
  }

  return Notification.permission
}

/**
 * Solicita permissão para mostrar notificações nativas
 * Deve ser chamada em resposta a uma ação do usuário (ex: clique em botão)
 *
 * @returns Promise com true se permissão concedida
 *
 * @example
 * ```tsx
 * <Button onClick={async () => {
 *   const permitido = await solicitarPermissao()
 *   if (permitido) {
 *     alert('Notificações habilitadas!')
 *   }
 * }}>
 *   Habilitar Notificações
 * </Button>
 * ```
 */
export const solicitarPermissao = async (): Promise<boolean> => {
  if (!navegadorSuportaNotificacoes()) {
    console.warn('[Notificações] Navegador não suporta notificações')
    return false
  }

  if (Notification.permission === 'granted') {
    console.log('[Notificações] Permissão já concedida')
    return true
  }

  if (Notification.permission === 'denied') {
    console.warn('[Notificações] Permissão negada pelo usuário')
    return false
  }

  try {
    const permissao = await Notification.requestPermission()

    if (permissao === 'granted') {
      console.log('[Notificações] Permissão concedida')
      salvarPreferenciasLocais({ notificacoesNativasHabilitadas: true })
      return true
    }

    console.warn('[Notificações] Permissão negada')
    salvarPreferenciasLocais({ notificacoesNativasHabilitadas: false })
    return false
  } catch (erro) {
    console.error('[Notificações] Erro ao solicitar permissão:', erro)
    return false
  }
}

// ============================================================================
// EXIBIÇÃO DE NOTIFICAÇÕES
// ============================================================================

/**
 * Opções para exibir notificação nativa
 */
export interface OpcoesNotificacaoNativa {
  /**
   * Título da notificação
   */
  titulo: string

  /**
   * Corpo da mensagem
   */
  mensagem: string

  /**
   * URL do ícone (opcional)
   * @default '/favicon.ico'
   */
  icone?: string

  /**
   * Tag única (notificações com mesma tag substituem as anteriores)
   */
  tag?: string

  /**
   * URL de ação (ao clicar na notificação)
   */
  urlAcao?: string

  /**
   * Tipo da notificação (para definir ícone)
   */
  tipo?: TipoNotificacao
}

/**
 * Obtém ícone padrão baseado no tipo da notificação
 *
 * @param _tipo - Tipo da notificação (não utilizado, reservado para uso futuro)
 * @returns URL do ícone
 */
const obterIconePorTipo = (_tipo?: TipoNotificacao): string => {
  // Por ora, usa favicon padrão
  // Futuramente, pode ter ícones diferentes por tipo
  return '/favicon.ico'
}

/**
 * Mostra uma notificação nativa do navegador
 * Verifica permissões e preferências antes de exibir
 *
 * @param opcoes - Opções da notificação
 * @returns Notification ou null se não mostrou
 *
 * @example
 * ```ts
 * mostrarNotificacao({
 *   titulo: 'Nova Mensagem',
 *   mensagem: 'Você tem uma nova mensagem de João',
 *   tipo: 'info',
 *   urlAcao: '/mensagens/123'
 * })
 * ```
 */
export const mostrarNotificacao = (
  opcoes: OpcoesNotificacaoNativa,
): Notification | null => {
  // Verifica se está habilitado
  if (!notificacoesEstaoHabilitadas()) {
    console.log('[Notificações] Notificações desabilitadas ou sem permissão')
    return null
  }

  const { titulo, mensagem, icone, tag, urlAcao, tipo } = opcoes

  try {
    const notification = new Notification(titulo, {
      body: mensagem,
      icon: icone ?? obterIconePorTipo(tipo),
      tag: tag ?? `notificacao-${Date.now()}`,
      requireInteraction: false, // Fecha automaticamente
      silent: false, // Som do sistema
    })

    // Handler: ao clicar na notificação
    if (urlAcao) {
      notification.onclick = () => {
        window.focus()
        window.location.href = urlAcao
        notification.close()
      }
    }

    console.log('[Notificações] Notificação exibida:', titulo)

    return notification
  } catch (erro) {
    console.error('[Notificações] Erro ao exibir notificação:', erro)
    return null
  }
}

/**
 * Mostra notificação a partir de um objeto NotificacaoUsuario
 * Helper para integração com a API
 *
 * @param notificacao - Notificação da API
 * @returns Notification ou null
 *
 * @example
 * ```ts
 * signalR.on('ReceberNotificacao', (notificacao) => {
 *   mostrarNotificacaoDeAPI(notificacao)
 * })
 * ```
 */
export const mostrarNotificacaoDeAPI = (
  notificacao: NotificacaoUsuario,
): Notification | null => {
  return mostrarNotificacao({
    titulo: notificacao.titulo,
    mensagem: notificacao.mensagem,
    tipo: notificacao.tipo,
    tag: notificacao.id,
    urlAcao: notificacao.urlAcao,
  })
}

// ============================================================================
// GERENCIAMENTO DE PREFERÊNCIAS
// ============================================================================

/**
 * Habilita notificações nativas
 * Não solicita permissão - apenas atualiza preferências
 */
export const habilitarNotificacoesNativas = (): void => {
  salvarPreferenciasLocais({ notificacoesNativasHabilitadas: true })
  console.log('[Notificações] Notificações nativas habilitadas')
}

/**
 * Desabilita notificações nativas
 */
export const desabilitarNotificacoesNativas = (): void => {
  salvarPreferenciasLocais({ notificacoesNativasHabilitadas: false })
  console.log('[Notificações] Notificações nativas desabilitadas')
}

/**
 * Alterna o estado de notificações nativas
 *
 * @returns Novo estado (true = habilitado)
 */
export const alternarNotificacoesNativas = (): boolean => {
  const preferencias = obterPreferenciasLocais()
  const novoEstado = !preferencias.notificacoesNativasHabilitadas

  salvarPreferenciasLocais({ notificacoesNativasHabilitadas: novoEstado })
  console.log(
    `[Notificações] Notificações nativas ${novoEstado ? 'habilitadas' : 'desabilitadas'}`,
  )

  return novoEstado
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Mostra notificação de teste
 * Útil para testar se as notificações estão funcionando
 *
 * @returns Notification ou null
 */
export const mostrarNotificacaoTeste = (): Notification | null => {
  return mostrarNotificacao({
    titulo: 'Teste de Notificação',
    mensagem: 'Se você está vendo isso, as notificações estão funcionando!',
    tipo: 'info',
    tag: 'teste',
  })
}

/**
 * Fecha todas as notificações ativas com a tag especificada
 *
 * @param tag - Tag das notificações a fechar
 */
export const fecharNotificacoesPorTag = (tag: string): void => {
  // Nota: A API Notification não fornece método para listar notificações ativas
  // Esta função é um placeholder para futuras implementações
  console.log('[Notificações] Solicitado fechamento de tag:', tag)
}
