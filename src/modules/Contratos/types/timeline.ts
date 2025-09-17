export interface TimelineEntry {
  id: string
  contratoId: string
  tipo: 'manual' | 'alteracao_contratual' | 'marco_sistema' | 'observacao'
  categoria: 'alteracao' | 'observacao' | 'milestone' | 'documento' | 'prazo'
  titulo: string
  descricao: string
  dataEvento: string
  autor: {
    id: string
    nome: string
    avatar?: string
    tipo: 'usuario' | 'fiscal' | 'gestor' | 'fornecedor' | 'sistema'
  }
  status: 'ativo' | 'arquivado'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  
  // Dados específicos para alterações contratuais
  alteracaoContratual?: {
    alteracaoId: string
    tipoAditivo: string
    valorOriginal: number
    valorNovo: number
    diferenca: number
    percentualDiferenca: number
    novaVigencia: string
    statusAlteracao: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada'
  }
  
  // Dados para marcos temporais
  milestone?: {
    etapa: string
    dataLimite?: string
    concluido: boolean
    percentualCompleto?: number
  }
  
  // Metadados adicionais
  metadata?: Record<string, unknown>
  tags?: string[]
  anexos?: TimelineAnexo[]
  
  // Timestamps
  criadoEm: string
  atualizadoEm?: string
  editadoPor?: string
}

export interface TimelineAnexo {
  id: string
  nome: string
  tipo: string
  tamanho: number
  url: string
}

export interface TimelineFiltro {
  tipo?: TimelineEntry['tipo'][]
  categoria?: TimelineEntry['categoria'][]
  autor?: string[]
  dataInicio?: string
  dataFim?: string
  termo?: string
  prioridade?: TimelineEntry['prioridade'][]
  tags?: string[]
}

export interface TimelineState {
  entradas: TimelineEntry[]
  contratoId: string
  isLoading: boolean
  filtroAtivo?: TimelineFiltro
  ordenacao: 'asc' | 'desc'
  exibicaoCompacta: boolean
}

// Tipos para criação de entradas
export interface NovaEntradaManual {
  tipo: 'manual'
  categoria: TimelineEntry['categoria']
  titulo: string
  descricao: string
  prioridade: TimelineEntry['prioridade']
  dataEvento?: string // Se não informado, usa data atual
  tags?: string[]
}

export interface NovaEntradaAlteracao {
  tipo: 'alteracao_contratual'
  alteracaoId: string
  dados: {
    tipoAditivo: string
    valorOriginal: number
    valorNovo: number
    novaVigencia: string
    statusAlteracao: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada'
  }
}

export interface NovaEntradaMilestone {
  tipo: 'marco_sistema'
  categoria: 'milestone'
  titulo: string
  etapa: string
  dataLimite?: string
  percentualCompleto?: number
}

// Estatísticas da timeline
export interface TimelineStats {
  totalEntradas: number
  alteracoesContratuais: number
  observacoes: number
  milestones: number
  entradasRecentes: number // Últimos 30 dias
  proximosPrazos: TimelineEntry[] // Próximos marcos com prazo
}

// Configurações de visualização
export interface TimelineConfig {
  contratoId: string
  exibirAvatares: boolean
  exibirHorarios: boolean
  agruparPorData: boolean
  exibirFiltros: boolean
  entradasPorPagina: number
  notificarNovasEntradas: boolean
}

// Tipos para notificações específicas da timeline
export interface TimelineNotificacao {
  id: string
  contratoId: string
  entradaId: string
  tipo: 'nova_entrada' | 'alteracao_aprovada' | 'prazo_proximo' | 'milestone_concluido'
  titulo: string
  descricao: string
  lida: boolean
  criadaEm: string
  dataExpiracao?: string
}

// ========== CHAT INTEGRADO ==========

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