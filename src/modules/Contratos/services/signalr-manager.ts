import * as signalR from '@microsoft/signalr'

import { getToken } from '@/lib/auth/auth'
import { createServiceLogger } from '@/lib/logger'
import {
  CHAT_SISTEMA_ID,
  mapMensagemResponseToChatMessage,
} from '@/modules/Contratos/types/chat-api'
import type { MensagemResponseDto } from '@/modules/Contratos/types/chat-api'
import type { ChatMessage } from '@/modules/Contratos/types/timeline'

const logger = createServiceLogger('chat-signalr')

const createRoomKey = (sistemaId: string, contratoId: string) =>
  [sistemaId, contratoId].join(':')

const resolveHubUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL as string | undefined

  if (!baseUrl) {
    throw new Error('VITE_API_URL não configurada para SignalR')
  }

  return `${baseUrl.replace(/\/$/, '')}/chathub`
}

export interface TypingEvent {
  sistemaId: string
  entidadeOrigemId: string
  autorId: string
  autorNome?: string | null
}

export interface PresenceEvent {
  sistemaId: string
  entidadeOrigemId: string
  usuarioId: string
  tipo: 'joined' | 'left'
  timestamp?: string
}

type MessageHandler = (mensagem: ChatMessage) => void

type TypingHandler = (event: TypingEvent) => void

class SignalRChatManager {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private activeRooms = new Set<string>()
  private messageHandlers = new Map<string, Set<MessageHandler>>()
  private typingHandlers = new Map<string, Set<TypingHandler>>()
  private presenceHandlers = new Set<(event: PresenceEvent) => void>()

  private async waitForConnectionInProgress() {
    while (this.isConnecting) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
    }
  }

  private setupEventHandlers(connection: signalR.HubConnection) {
    connection.onclose((error) => {
      if (error) {
        logger.error('Conexão SignalR encerrada com erro', error.message)
      }
      this.activeRooms.clear()
    })

    connection.onreconnecting((error) => {
      if (error) {
        logger.warn('Reconectando SignalR após erro', error.message)
      }
    })

    connection.onreconnected(() => {
      logger.info('SignalR reconectado, readicionando salas')
      void this.rejoinAllRooms()
    })

    connection.on('ReceiveMessage', (dto: MensagemResponseDto) => {
      try {
        const mensagem = mapMensagemResponseToChatMessage(dto)
        const roomKey = createRoomKey(dto.sistemaId, dto.entidadeOrigemId)
        const handlers = this.messageHandlers.get(roomKey)
        if (!handlers) return
        handlers.forEach((handler) => handler(mensagem))
      } catch (error) {
        logger.error('Falha ao processar mensagem do SignalR', error as string)
      }
    })

    connection.on('UserTyping', (event: TypingEvent) => {
      const roomKey = createRoomKey(event.sistemaId, event.entidadeOrigemId)
      const handlers = this.typingHandlers.get(roomKey)
      if (!handlers) return
      handlers.forEach((handler) => handler(event))
    })

    const handlePresence = (tipo: PresenceEvent['tipo']) =>
      (event: PresenceEvent) => {
        const payload: PresenceEvent = { ...event, tipo }
        this.presenceHandlers.forEach((handler) => handler(payload))
      }

    connection.on('UserJoined', handlePresence('joined'))
    connection.on('UserLeft', handlePresence('left'))

    connection.on('Error', (error: unknown) => {
      logger.error('Erro propagado pelo hub do chat', error as string)
    })
  }

  async initialize(authToken?: string) {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return this.connection
    }

    if (this.isConnecting) {
      await this.waitForConnectionInProgress()
      return this.connection
    }

    this.isConnecting = true

    try {
      const token = authToken ?? getToken() ?? ''
      const hubUrl = resolveHubUrl()

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(
          import.meta.env.DEV
            ? signalR.LogLevel.Information
            : signalR.LogLevel.Error,
        )
        .build()

      this.setupEventHandlers(this.connection)

      await this.connection.start()
      logger.info('Conexão SignalR estabelecida')
      return this.connection
    } catch (error) {
      logger.error('Falha ao iniciar conexão SignalR', error as string)
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  async joinRoom(sistemaId: string, contratoId: string) {
    const activeConnection = await this.ensureConnection()
    const roomKey = createRoomKey(sistemaId, contratoId)

    if (this.activeRooms.has(roomKey)) {
      return
    }

    try {
      if (activeConnection) {
        await activeConnection.invoke('JoinContractRoom', sistemaId, contratoId)
        this.activeRooms.add(roomKey)
        logger.info('Joined sala do contrato', roomKey)
      }
    } catch (error) {
      logger.error('Erro ao entrar na sala do contrato', error as string)
      throw error
    }
  }

  async leaveRoom(sistemaId: string, contratoId: string) {
    const {connection} = this
    const roomKey = createRoomKey(sistemaId, contratoId)

    if (!connection || !this.activeRooms.has(roomKey)) {
      this.messageHandlers.delete(roomKey)
      this.typingHandlers.delete(roomKey)
      return
    }

    try {
      await connection.invoke('LeaveContractRoom', sistemaId, contratoId)
    } catch (error) {
      logger.warn('Erro ao sair da sala do contrato', error as string)
    } finally {
      this.activeRooms.delete(roomKey)
      this.messageHandlers.delete(roomKey)
      this.typingHandlers.delete(roomKey)
    }
  }

  async rejoinAllRooms() {
    const rooms = Array.from(this.activeRooms)
    for (const roomKey of rooms) {
      const [sistemaId, contratoId] = roomKey.split(':')
      try {
        await this.joinRoom(sistemaId, contratoId)
      } catch (error) {
        logger.error('Falha ao reentrar na sala', error as string)
        this.activeRooms.delete(roomKey)
      }
    }
  }

  private async ensureConnection() {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return this.connection
    }

    return await this.initialize()
  }

  onMessage(
    sistemaId: string,
    contratoId: string,
    handler: MessageHandler,
  ) {
    const roomKey = createRoomKey(sistemaId, contratoId)
    const handlers = this.messageHandlers.get(roomKey) ?? new Set<MessageHandler>()
    handlers.add(handler)
    this.messageHandlers.set(roomKey, handlers)

    return () => {
      const roomHandlers = this.messageHandlers.get(roomKey)
      roomHandlers?.delete(handler)
      if (roomHandlers && roomHandlers.size === 0) {
        this.messageHandlers.delete(roomKey)
      }
    }
  }

  onTyping(
    sistemaId: string,
    contratoId: string,
    handler: TypingHandler,
  ) {
    const roomKey = createRoomKey(sistemaId, contratoId)
    const handlers = this.typingHandlers.get(roomKey) ?? new Set<TypingHandler>()
    handlers.add(handler)
    this.typingHandlers.set(roomKey, handlers)

    return () => {
      const roomHandlers = this.typingHandlers.get(roomKey)
      roomHandlers?.delete(handler)
      if (roomHandlers && roomHandlers.size === 0) {
        this.typingHandlers.delete(roomKey)
      }
    }
  }

  onPresence(handler: (event: PresenceEvent) => void) {
    this.presenceHandlers.add(handler)
    return () => {
      this.presenceHandlers.delete(handler)
    }
  }

  async sendMessage(params: {
    sistemaId?: string
    contratoId: string
    texto: string
    autorId: string
    autorNome?: string
  }) {
    const connection = await this.ensureConnection()
    const sistemaId = params.sistemaId ?? CHAT_SISTEMA_ID

    if (connection) {
      await connection.invoke('SendMessage', {
        sistemaId,
        entidadeOrigemId: params.contratoId,
        texto: params.texto,
        autorId: params.autorId,
        autorNome: params.autorNome ?? null,
      })
    }
  }

  async startTyping(sistemaId: string, contratoId: string) {
    try {
      const connection = await this.ensureConnection()
      if (connection) {
        await connection.invoke('StartTyping', sistemaId, contratoId)
      }
    } catch (error) {
      logger.debug('Falha ao enviar evento de typing', error as string)
    }
  }

  async stopTyping(sistemaId: string, contratoId: string) {
    try {
      const connection = await this.ensureConnection()
      if (connection) {
        await connection.invoke('StopTyping', sistemaId, contratoId)
      }
    } catch (error) {
      logger.debug('Falha ao encerrar evento de typing', error as string)
    }
  }

  isConnected() {
    return (
      this.connection?.state === signalR.HubConnectionState.Connected || false
    )
  }
}

export const signalRChatManager = new SignalRChatManager()
