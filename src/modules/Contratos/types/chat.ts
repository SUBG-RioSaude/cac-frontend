export interface ChatMensagem {
  id: string
  conteudo: string
  timestamp: string
  autorId: string
  autorNome: string
  tipo: 'texto' | 'arquivo' | 'sistema'
}

export interface ChatParticipante {
  id: string
  nome: string
  email: string
  avatar?: string
  online: boolean
  status?: 'online' | 'offline' | 'away'
}

export interface Chat {
  id: string
  contratoId: string
  titulo: string
  mensagens: ChatMensagem[]
  participantes: ChatParticipante[]
  criadoEm: string
  atualizadoEm: string
}

// Alias for compatibility
export type ChatMessage = ChatMensagem

// Chat state interface for individual chat
export interface ChatState {
  mensagens: ChatMensagem[]
  participantes: ChatParticipante[]
  contratoId: string
  isLoading: boolean
  isTyping: TypingStatus[]
  mensagensNaoLidas: number
}

// Global chat state interface
export interface GlobalChatState {
  chats: Chat[]
  chatAtivo: string | null
  participantesOnline: string[]
  mensagensNaoLidas: Record<string, number>
}

// Typing status interface
export interface TypingStatus {
  participanteId: string
  userId: string
  userName: string
  isTyping: boolean
  timestamp: number
}
