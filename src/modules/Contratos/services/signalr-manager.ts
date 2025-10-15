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

const isValidGuid = (value: string): boolean => {
  if (!value || value.trim().length === 0) {
    return false
  }
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return guidRegex.test(value)
}

const validateGuidParams = (sistemaId: string, contratoId: string) => {
  if (!isValidGuid(sistemaId)) {
    throw new Error(
      `sistemaId inválido: "${sistemaId}". Deve ser um GUID válido (ex: 550e8400-e29b-41d4-a716-446655440000)`
    )
  }
  if (!isValidGuid(contratoId)) {
    throw new Error(
      `contratoId inválido: "${contratoId}". Deve ser um GUID válido (ex: 550e8400-e29b-41d4-a716-446655440000)`
    )
  }
}

const resolveHubUrl = () => {
  const baseUrl = import.meta.env.VITE_API_CHAT_SOCKET_URL as string | undefined

  if (!baseUrl) {
    throw new Error('VITE_API_CHAT_SOCKET_URL não configurada para SignalR')
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
      // Verificar validade do token antes de conectar
      const tokenToValidate = authToken ?? getToken()
      if (tokenToValidate) {
        try {
          const [, base64Payload] = tokenToValidate.split('.')
          const payload = JSON.parse(atob(base64Payload))
          const expTimestamp = payload.exp * 1000
          const now = Date.now()
          const isExpired = now > expTimestamp // Corrigido: se now > expTimestamp, token expirou
          const timeUntilExpiry = expTimestamp - now

          console.log('🕐 Validação de Token:', {
            expiraEm: new Date(expTimestamp).toLocaleString('pt-BR'),
            agora: new Date(now).toLocaleString('pt-BR'),
            timestampExp: expTimestamp,
            timestampNow: now,
            expirado: isExpired,
            tempoRestante: isExpired
              ? `EXPIRADO há ${Math.abs(Math.floor(timeUntilExpiry / 1000 / 60))} minutos`
              : `${Math.floor(timeUntilExpiry / 1000 / 60)} minutos`,
          })

          if (isExpired) {
            logger.error('❌ Token EXPIRADO! Não pode conectar ao SignalR')
            throw new Error('Token de autenticação expirado. Faça login novamente.')
          }
        } catch (error) {
          logger.error('Erro ao validar token:', error as string)
          throw error // Re-throw para impedir conexão
        }
      }

      const hubUrl = resolveHubUrl()
      const initialToken = authToken ?? getToken()

      if (!initialToken) {
        throw new Error('Token de autenticação não encontrado')
      }

      // Adicionar token na query string para o /negotiate
      // SignalR tradicionalmente aceita token via query string ou accessTokenFactory
      const hubUrlWithToken = `${hubUrl}?access_token=${encodeURIComponent(initialToken)}`

      console.log('🔗 URL do Hub:', {
        urlBase: hubUrl,
        temToken: !!initialToken,
        tamanhoToken: initialToken.length,
      })

      // Usar função dinâmica para sempre pegar token mais recente
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrlWithToken, {
          accessTokenFactory: () => {
            console.log('🔵 SignalR accessTokenFactory CHAMADO')

            const currentToken = authToken ?? getToken() ?? ''

            console.log('🔵 Token obtido:', {
              usandoAuthToken: !!authToken,
              usandoGetToken: !authToken && !!getToken(),
              tokenVazio: !currentToken,
              tamanhoOriginal: currentToken.length,
            })

            // Backend espera "Bearer {token}" em TODOS os requests
            // Adicionar Bearer tanto no accessTokenFactory quanto no header
            const tokenWithBearer = currentToken.startsWith('Bearer ')
              ? currentToken
              : `Bearer ${currentToken}`

            logger.debug('SignalR accessTokenFactory - Token disponível:', {
              temToken: !!currentToken,
              tamanho: tokenWithBearer.length,
              inicio: `${tokenWithBearer.substring(0, 40)  }...`,
            })

            console.log('🔵 Token com Bearer:', {
              jaTemBearer: currentToken.startsWith('Bearer '),
              tamanhoFinal: tokenWithBearer.length,
              inicio: tokenWithBearer.substring(0, 50),
            })

            return tokenWithBearer
          },
          headers: (() => {
            const headerToken = authToken ?? getToken() ?? ''
            const authHeader = `Bearer ${headerToken}`

            console.log('🔵 Header /negotiate - Token:', {
              temToken: !!headerToken,
              tamanhoToken: headerToken.length,
              tamanhoHeader: authHeader.length,
              headerCompleto: authHeader.substring(0, 60),
            })

            console.warn('⚠️ HEADER AUTHORIZATION QUE SERÁ ENVIADO:', authHeader)

            return {
              // Adicionar Bearer token explicitamente no header para /negotiate
              Authorization: authHeader,
            }
          })(),
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
      logger.info('Conexão SignalR estabelecida com sucesso')
      return this.connection
    } catch (error) {
      logger.error('Falha ao iniciar conexão SignalR', error as string)
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  async joinRoom(sistemaId: string, contratoId: string) {
    // Validar GUIDs antes de tentar conectar
    validateGuidParams(sistemaId, contratoId)

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
    // Validar GUIDs antes de tentar desconectar
    validateGuidParams(sistemaId, contratoId)

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
    // Validar token antes de enviar
    const token = getToken()
    if (!token) {
      const errorMsg = 'Token de autenticação não encontrado. Faça login novamente.'
      logger.error('sendMessage - Sem token', {
        autorId: params.autorId,
        contratoId: params.contratoId,
      })
      throw new Error(errorMsg)
    }

    logger.debug('sendMessage - Enviando mensagem', {
      autorId: params.autorId,
      autorNome: params.autorNome,
      contratoId: params.contratoId,
      temToken: !!token,
      tamanhoToken: token.length,
    })

    const connection = await this.ensureConnection()
    const sistemaId = params.sistemaId ?? CHAT_SISTEMA_ID

    if (!connection) {
      throw new Error('Conexão SignalR não estabelecida')
    }

    try {
      await connection.invoke('SendMessage', {
        sistemaId,
        entidadeOrigemId: params.contratoId,
        texto: params.texto,
        autorId: params.autorId,
        autorNome: params.autorNome ?? null,
      })

      logger.info('Mensagem enviada com sucesso via SignalR')
    } catch (error) {
      logger.error('Erro ao invocar SendMessage no hub', error as string)
      throw error
    }
  }

  async startTyping(sistemaId: string, contratoId: string) {
    try {
      // Validar GUIDs antes de enviar evento
      validateGuidParams(sistemaId, contratoId)

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
      // Validar GUIDs antes de enviar evento
      validateGuidParams(sistemaId, contratoId)

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
