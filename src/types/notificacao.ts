/**
 * Tipos e interfaces para o sistema de notificações
 * Baseado na API de Notificações (egestao-micro-notificacao-api)
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Tipos de notificação suportados pela API
 */
export type TipoNotificacao = 'info' | 'success' | 'warning' | 'error'

/**
 * Níveis de prioridade
 */
export type PrioridadeNotificacao = 'Normal' | 'Urgente' | 'Critica'

/**
 * Status de conexão SignalR
 */
export type StatusConexao = 'conectado' | 'desconectado' | 'reconectando'

// ============================================================================
// NOTIFICAÇÕES
// ============================================================================

/**
 * Interface de notificação do usuário (retornada pela API)
 * Endpoint: GET /api/notificacoes/minhas
 */
export interface NotificacaoUsuario {
  /**
   * ID da relação NotificacaoUsuario (usado para ações)
   */
  id: string

  /**
   * ID da notificação original
   */
  notificacaoId: string

  /**
   * Título da notificação
   */
  titulo: string

  /**
   * Mensagem da notificação
   */
  mensagem: string

  /**
   * Tipo da notificação (info, success, warning, error)
   */
  tipo: TipoNotificacao

  /**
   * Prioridade da notificação
   */
  prioridade: PrioridadeNotificacao

  /**
   * Categoria da notificação (Financeiro, Sistema, etc.)
   */
  categoria: string

  /**
   * Se a notificação foi lida
   */
  lida: boolean

  /**
   * Data/hora em que foi marcada como lida
   */
  lidaEm?: string

  /**
   * Se a notificação foi arquivada
   */
  arquivada: boolean

  /**
   * Data/hora em que foi arquivada
   */
  arquivadaEm?: string

  /**
   * URL de ação (link para a entidade relacionada)
   */
  urlAcao?: string

  /**
   * Metadados adicionais (JSON livre)
   */
  metadata?: Record<string, unknown>

  /**
   * Data/hora de criação (ISO 8601)
   */
  criadoEm: string
}

/**
 * Resposta paginada de notificações
 * Endpoint: GET /api/notificacoes/minhas
 */
export interface NotificacoesPaginadas {
  /**
   * Lista de notificações
   */
  items: NotificacaoUsuario[]

  /**
   * Página atual
   */
  page: number

  /**
   * Tamanho da página
   */
  pageSize: number

  /**
   * Total de notificações não lidas
   */
  naoLidas: number
}

/**
 * Resposta paginada de notificações arquivadas
 * Endpoint: GET /api/notificacoes/arquivadas
 */
export interface NotificacoesArquivadas {
  /**
   * Lista de notificações arquivadas
   */
  items: NotificacaoUsuario[]

  /**
   * Página atual
   */
  page: number

  /**
   * Tamanho da página
   */
  pageSize: number

  /**
   * Total de notificações arquivadas
   */
  totalArquivadas: number
}

/**
 * Contagem de notificações não lidas
 * Endpoint: GET /api/notificacoes/nao-lidas
 */
export interface ContagemNaoLidas {
  /**
   * Total de notificações não lidas
   */
  naoLidas: number

  /**
   * Contagem por sistema
   * Key: sistemaId (GUID)
   * Value: quantidade
   */
  porSistema: Record<string, number>
}

// ============================================================================
// PREFERÊNCIAS
// ============================================================================

/**
 * Preferência de notificação
 * Endpoint: GET /api/preferencias/minhas
 */
export interface Preferencia {
  /**
   * ID da preferência
   */
  id: string

  /**
   * ID do sistema relacionado
   */
  sistemaId: string

  /**
   * Tipo de notificação
   */
  tipoNotificacao: string

  /**
   * Se a preferência está habilitada
   */
  habilitada: boolean

  /**
   * Data/hora de criação
   */
  criadoEm: string
}

/**
 * Request para atualizar preferência
 * Endpoint: PUT /api/preferencias/{id}
 */
export type AtualizarPreferenciaRequest = boolean

/**
 * Preferências locais do usuário (armazenadas no navegador)
 */
export interface PreferenciasLocais {
  /**
   * Se deve tocar som ao receber notificação
   */
  somHabilitado: boolean

  /**
   * Se deve mostrar notificações nativas do navegador
   */
  notificacoesNativasHabilitadas: boolean

  /**
   * Volume do som (0.0 a 1.0)
   */
  volumeSom: number
}

// ============================================================================
// SUBSCRIÇÕES (Seguir Entidades)
// ============================================================================

/**
 * Subscrição (seguir entidade)
 * Endpoint: GET /api/subscricoes/minhas
 */
export interface Subscricao {
  /**
   * ID da subscrição
   */
  id: string

  /**
   * ID do sistema
   */
  sistemaId: string

  /**
   * ID da entidade sendo seguida
   */
  entidadeOrigemId: string

  /**
   * Se a subscrição está ativa
   */
  ativa: boolean

  /**
   * Data/hora de criação
   */
  criadoEm: string
}

/**
 * Resposta paginada de subscrições
 * Endpoint: GET /api/subscricoes/minhas
 */
export interface SubscricoesPaginadas {
  /**
   * Lista de subscrições
   */
  items: Subscricao[]

  /**
   * Página atual
   */
  page: number

  /**
   * Tamanho da página
   */
  pageSize: number

  /**
   * Total de subscrições
   */
  total: number
}

/**
 * Request para seguir/deixar de seguir
 * Endpoint: POST /api/subscricoes/seguir
 */
export interface SeguirEntidadeRequest {
  sistemaId: string
  entidadeOrigemId: string
}

/**
 * Resposta de seguir/deixar de seguir
 * Endpoint: POST /api/subscricoes/seguir
 */
export interface SeguirEntidadeResponse {
  /**
   * Se está seguindo após a operação
   */
  seguindo: boolean

  /**
   * Mensagem de confirmação
   */
  mensagem: string

  /**
   * ID da subscrição (se seguindo)
   */
  subscricaoId?: string
}

/**
 * Resposta de status de seguimento
 * Endpoint: GET /api/subscricoes/estou-seguindo
 */
export interface StatusSeguimentoResponse {
  /**
   * Se está seguindo a entidade
   */
  seguindo: boolean

  /**
   * ID da subscrição (se seguindo)
   */
  subscricaoId?: string

  /**
   * Data/hora de criação (se seguindo)
   */
  criadoEm?: string
}

// ============================================================================
// EVENTOS SIGNALR
// ============================================================================

/**
 * Eventos disponíveis no SignalR Hub
 */
export type EventoSignalR =
  | 'ReceberNotificacao'
  | 'NotificacaoLida'
  | 'ReceiveBroadcast'
  | 'reconectado'
  | 'reconectando'
  | 'desconectado'

// ============================================================================
// BROADCASTS (Alertas Globais Temporários)
// ============================================================================

/**
 * Broadcast (alerta global temporário)
 * Endpoint: POST /api/notificacoes/broadcast (microserviços apenas)
 * Evento SignalR: ReceiveBroadcast
 *
 * Diferenças de notificação normal:
 * - Não persiste no banco de dados
 * - Não pode ser marcado como lido ou arquivado
 * - Enviado para TODOS os usuários conectados no sistema
 * - Temporário (existe apenas enquanto exibido)
 */
export interface Broadcast {
  /**
   * ID do sistema que enviou o broadcast
   */
  sistemaId: string

  /**
   * Título do broadcast
   */
  titulo: string

  /**
   * Mensagem do broadcast
   */
  mensagem: string

  /**
   * Prioridade do broadcast
   * 0 = Info, 1 = Normal, 2 = Urgente
   */
  prioridade: 0 | 1 | 2

  /**
   * Categoria do broadcast
   */
  categoria?: string

  /**
   * URL de ação (link para mais detalhes)
   */
  urlAcao?: string

  /**
   * Data/hora de criação do broadcast (ISO 8601)
   */
  criadoEm: string

  /**
   * Quantidade de usuários conectados que receberam
   */
  usuariosConectados: number

  /**
   * Informação adicional retornada pela API
   */
  info: string
}

/**
 * Broadcast temporário com ID local
 * Usado para gerenciar broadcasts no estado local do cliente
 */
export interface BroadcastTemporario extends Broadcast {
  /**
   * ID local gerado pelo cliente (usado para remover da lista)
   */
  id: string

  /**
   * Data/hora em que foi recebido pelo cliente
   */
  recebidoEm: string
}

/**
 * Callback de evento SignalR
 */
export type SignalRCallback<T = unknown> = (data: T) => void

/**
 * Mapa de listeners de eventos
 */
export type SignalRListeners = Map<EventoSignalR, SignalRCallback[]>

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Filtros para listagem de notificações
 */
export interface FiltrosNotificacao {
  /**
   * Página atual (padrão: 1)
   */
  page?: number

  /**
   * Itens por página (padrão: 20, máx: 100)
   */
  pageSize?: number

  /**
   * Filtrar por status de leitura
   */
  lida?: boolean

  /**
   * Filtrar por status de arquivamento
   */
  arquivada?: boolean

  /**
   * Filtrar por tipo
   */
  tipo?: TipoNotificacao

  /**
   * Filtrar por sistema
   */
  sistemaId?: string
}

/**
 * Opções de configuração do hook de notificações
 */
export interface OpcoesNotificacoes {
  /**
   * Se deve conectar ao SignalR automaticamente
   * @default true
   */
  autoConectar?: boolean

  /**
   * Se deve solicitar permissão para notificações nativas
   * @default true
   */
  solicitarPermissaoNativa?: boolean

  /**
   * Se deve tocar som ao receber notificação
   * @default true
   */
  habilitarSom?: boolean

  /**
   * Intervalo de verificação de auto-arquivamento (ms)
   * @default 86400000 (24 horas)
   */
  intervaloAutoArquivamento?: number
}
