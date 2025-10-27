/**
 * Cliente SignalR para notificações em tempo real
 * Implementa conexão WebSocket com auto-reconnect
 */

import * as signalR from '@microsoft/signalr'

import type {
  Broadcast,
  EventoSignalR,
  NotificacaoUsuario,
  SignalRCallback,
  SignalRListeners,
  StatusConexao,
} from '@/types/notificacao'

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

/**
 * URL do SignalR Hub
 * Constrói a partir da base URL de notificações
 */
const BASE_URL = import.meta.env.VITE_NOTIFICACOES_API_URL as string

if (!BASE_URL) {
  console.error(
    '[SignalR] VITE_NOTIFICACOES_API_URL não configurado no .env',
  )
}

const HUB_URL = BASE_URL ? `${BASE_URL}/api/notificacaohub` : ''

// ============================================================================
// SERVIÇO SIGNALR
// ============================================================================

/**
 * Serviço Singleton para gerenciamento de conexão SignalR
 * Implementa event emitter pattern para callbacks
 */
class NotificacaoSignalRService {
  private static instancia: NotificacaoSignalRService

  private conexao: signalR.HubConnection | null = null

  private listeners: SignalRListeners = new Map()

  private statusConexao: StatusConexao = 'desconectado'

  private conectando: boolean = false

  /**
   * Construtor privado (Singleton)
   */
  private constructor() {
    // Singleton pattern
  }

  /**
   * Obtém instância única do serviço
   */
  public static obterInstancia(): NotificacaoSignalRService {
    if (!NotificacaoSignalRService.instancia) {
      NotificacaoSignalRService.instancia = new NotificacaoSignalRService()
    }
    return NotificacaoSignalRService.instancia
  }

  /**
   * Conecta ao SignalR Hub
   *
   * @param jwtToken - Token JWT para autenticação
   * @returns Promise que resolve quando conectado
   */
  public async conectar(jwtToken: string): Promise<void> {
    // Se já está conectado ou conectando, não faz nada
    if (
      this.conexao?.state === signalR.HubConnectionState.Connected ||
      this.conexao?.state === signalR.HubConnectionState.Connecting ||
      this.conectando
    ) {
      console.log('[SignalR] Já conectado ou conectando')
      return
    }

    this.conectando = true

    try {
      // Criar nova conexão
      this.conexao = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => jwtToken,
          skipNegotiation: true, // Força WebSockets
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Backoff exponencial: 0s, 2s, 10s, 30s, então sempre 30s
            if (retryContext.previousRetryCount === 0) return 0
            if (retryContext.previousRetryCount === 1) return 2000
            if (retryContext.previousRetryCount === 2) return 10000
            return 30000
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Configurar event listeners
      this.configurarEventListeners()

      // Iniciar conexão
      await this.conexao.start()

      this.statusConexao = 'conectado'
      console.log('✅ [SignalR] Conectado ao Hub de Notificações')

      // Auto-join ao sistema para receber broadcasts
      // Aguarda um pouco para garantir que o estado esteja Connected
      const sistemaId = import.meta.env.VITE_SYSTEM_ID
      if (sistemaId && this.conexao.state === signalR.HubConnectionState.Connected) {
        await this.joinSistema(sistemaId)
      }

      this.conectando = false
    } catch (erro) {
      this.statusConexao = 'desconectado'
      this.conectando = false
      console.error('❌ [SignalR] Erro ao conectar:', erro)
      throw erro
    }
  }

  /**
   * Desconecta do SignalR Hub
   *
   * @returns Promise que resolve quando desconectado
   */
  public async desconectar(): Promise<void> {
    if (this.conexao) {
      try {
        // Sair do grupo do sistema antes de desconectar
        const sistemaId = import.meta.env.VITE_SYSTEM_ID
        if (sistemaId) {
          await this.leaveSistema(sistemaId)
        }

        await this.conexao.stop()
        this.statusConexao = 'desconectado'
        console.log('[SignalR] Desconectado do Hub')
      } catch (erro) {
        console.error('[SignalR] Erro ao desconectar:', erro)
      } finally {
        this.conexao = null
        this.conectando = false
      }
    }
  }

  /**
   * Configura listeners para eventos do SignalR
   * @private
   */
  private configurarEventListeners(): void {
    if (!this.conexao) return

    // Evento: Nova notificação recebida
    this.conexao.on(
      'ReceberNotificacao',
      (notificacao: NotificacaoUsuario) => {
        console.log('📬 [SignalR] Nova notificação:', notificacao.titulo)
        this.disparar('ReceberNotificacao', notificacao)
      },
    )

    // Evento: Notificação marcada como lida
    this.conexao.on('NotificacaoLida', (notificacaoId: string) => {
      console.log('✅ [SignalR] Notificação marcada como lida:', notificacaoId)
      this.disparar('NotificacaoLida', notificacaoId)
    })

    // Evento: Broadcast recebido (alerta global temporário)
    this.conexao.on('ReceiveBroadcast', (broadcast: Broadcast) => {
      console.log('📢 [SignalR] Broadcast recebido:', broadcast.titulo)
      this.disparar('ReceiveBroadcast', broadcast)
    })

    // Evento: Reconexão bem-sucedida
    this.conexao.onreconnected(async (connectionId) => {
      this.statusConexao = 'conectado'
      console.log('🔄 [SignalR] Reconectado. ConnectionId:', connectionId)

      // Re-join ao sistema após reconexão
      const sistemaId = import.meta.env.VITE_SYSTEM_ID
      if (sistemaId) {
        try {
          await this.joinSistema(sistemaId)
        } catch (erro) {
          console.error('[SignalR] Erro ao re-join após reconexão:', erro)
        }
      }

      this.disparar('reconectado', connectionId)
    })

    // Evento: Tentando reconectar
    this.conexao.onreconnecting((erro) => {
      this.statusConexao = 'reconectando'
      console.log('🔄 [SignalR] Tentando reconectar...', erro?.message)
      this.disparar('reconectando', erro)
    })

    // Evento: Conexão fechada
    this.conexao.onclose((erro) => {
      this.statusConexao = 'desconectado'
      console.log('❌ [SignalR] Conexão fechada', erro?.message)
      this.disparar('desconectado', erro)
    })
  }

  /**
   * Adiciona listener para um evento
   *
   * @param evento - Nome do evento
   * @param callback - Função callback
   */
  public on<T = unknown>(evento: EventoSignalR, callback: SignalRCallback<T>): void {
    if (!this.listeners.has(evento)) {
      this.listeners.set(evento, [])
    }

    const callbacks = this.listeners.get(evento)
    if (callbacks) {
      callbacks.push(callback as SignalRCallback)
    }
  }

  /**
   * Remove listener de um evento
   *
   * @param evento - Nome do evento
   * @param callback - Função callback a remover
   */
  public off<T = unknown>(evento: EventoSignalR, callback: SignalRCallback<T>): void {
    const callbacks = this.listeners.get(evento)
    if (callbacks) {
      const index = callbacks.indexOf(callback as SignalRCallback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Dispara um evento para todos os listeners
   *
   * @param evento - Nome do evento
   * @param dados - Dados a passar para os callbacks
   * @private
   */
  private disparar<T = unknown>(evento: EventoSignalR, dados?: T): void {
    const callbacks = this.listeners.get(evento)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(dados)
        } catch (erro) {
          console.error(`[SignalR] Erro ao executar callback de ${evento}:`, erro)
        }
      })
    }
  }

  /**
   * Obtém o status atual da conexão
   *
   * @returns Status da conexão
   */
  public obterStatus(): StatusConexao {
    return this.statusConexao
  }

  /**
   * Verifica se está conectado
   *
   * @returns true se conectado
   */
  public get estaConectado(): boolean {
    return this.conexao?.state === signalR.HubConnectionState.Connected
  }

  /**
   * Obtém o connection ID atual (se conectado)
   *
   * @returns Connection ID ou null
   */
  public get connectionId(): string | null {
    return this.conexao?.connectionId ?? null
  }

  /**
   * Limpa todos os listeners de eventos
   * Útil para cleanup em testes
   */
  public limparListeners(): void {
    this.listeners.clear()
  }

  /**
   * Entra no grupo de broadcast de um sistema
   * Necessário para receber broadcasts via SignalR
   *
   * @param sistemaId - ID do sistema (GUID)
   * @returns Promise que resolve quando entrou no grupo
   */
  public async joinSistema(sistemaId: string): Promise<void> {
    if (!this.conexao || this.conexao.state !== signalR.HubConnectionState.Connected) {
      throw new Error('[SignalR] Não conectado ao Hub')
    }

    try {
      await this.conexao.invoke('JoinSistema', sistemaId)
      console.log(`📢 [SignalR] Inscrito para broadcasts do sistema: ${sistemaId}`)
    } catch (erro) {
      console.error('[SignalR] Erro ao entrar no grupo do sistema:', erro)
      throw erro
    }
  }

  /**
   * Sai do grupo de broadcast de um sistema
   *
   * @param sistemaId - ID do sistema (GUID)
   * @returns Promise que resolve quando saiu do grupo
   */
  public async leaveSistema(sistemaId: string): Promise<void> {
    if (!this.conexao || this.conexao.state !== signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Conexão não está no estado Connected, pulando LeaveSistema')
      return // Não joga erro, apenas retorna (conexão já foi fechada)
    }

    try {
      await this.conexao.invoke('LeaveSistema', sistemaId)
      console.log(`📢 [SignalR] Desinscrito dos broadcasts do sistema: ${sistemaId}`)
    } catch (erro) {
      console.error('[SignalR] Erro ao sair do grupo do sistema:', erro)
      // Não joga erro no leaveSistema pois pode estar desconectando
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Instância singleton do serviço SignalR
 * Usar esta instância em toda a aplicação
 */
export const notificacaoSignalR =
  NotificacaoSignalRService.obterInstancia()

/**
 * Exporta a classe para testes
 */
export { NotificacaoSignalRService }
