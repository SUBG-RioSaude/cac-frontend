export interface ChatMessage {
  id: string
  contratoId: string
  remetente: {
    id: string
    nome: string
    avatar?: string
    tipo: 'usuario' | 'fiscal' | 'gestor' | 'fornecedor' | 'sistema'
  }
  conteudo: string
  tipo: 'texto' | 'sistema' | 'alteracao_contratual'
  dataEnvio: string
  lida: boolean
  editada?: boolean
  editadaEm?: string
  metadata?: Record<string, unknown>
}


export interface ChatState {
  mensagens: ChatMessage[]
  participantes: ChatParticipante[]
  contratoId: string
  isLoading: boolean
  isTyping: string[] // IDs dos usuários digitando
  mensagensNaoLidas: number
  filtroAtivo?: ChatFiltro
}

export interface ChatParticipante {
  id: string
  nome: string
  email: string
  avatar?: string
  tipo: 'usuario' | 'fiscal' | 'gestor' | 'fornecedor'
  status: 'online' | 'offline' | 'ausente'
  ultimoAcesso?: string
}

export interface ChatFiltro {
  tipo?: ChatMessage['tipo']
  remetente?: string
  dataInicio?: string
  dataFim?: string
  termo?: string
}


export interface NotificacaoChat {
  id: string
  contratoId: string
  mensagemId: string
  tipo: 'nova_mensagem' | 'mencao' | 'alteracao_contratual'
  titulo: string
  descricao: string
  lida: boolean
  criadaEm: string
}

// Tipos para sistema de typing/digitando
export interface TypingStatus {
  userId: string
  userName: string
  timestamp: number
}

// Configurações de chat por contrato
export interface ChatConfig {
  contratoId: string
  participantesPermitidos: string[]
  historicoVisivel: boolean
  notificacoesHabilitadas: boolean
}