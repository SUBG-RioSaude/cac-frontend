import type { ChatMessage } from '@/modules/Contratos/types/timeline'

export interface CriarMensagemDto {
  sistemaId: string
  entidadeOrigemId: string
  texto: string
  autorId: string
  autorNome?: string | null
}

export interface AtualizarMensagemDto {
  texto: string
}

export interface MensagemResponseDto {
  id: string
  sistemaId: string
  entidadeOrigemId: string
  texto: string | null
  autorId: string | null
  autorNome: string | null
  enviadoEm: string
  atualizadoEm?: string | null
  criadoEm: string
}

export interface AutorEstatisticaDto {
  autorId: string | null
  autorNome: string | null
  totalMensagens: number
  ultimaMensagem: string | null
}

export interface SistemaEstatisticaDto {
  sistemaId: string
  totalMensagens: number
  totalEntidades: number
  ultimaMensagem: string | null
}

export interface EstatisticasDto {
  totalMensagens: number
  mensagensHoje: number
  mensagensSemana: number
  mensagensMes: number
  totalAutores: number
  totalSistemas: number
  totalEntidades: number
  ultimaMensagem: string | null
  dataCalculo: string
  topAutores: AutorEstatisticaDto[] | null
  topSistemas: SistemaEstatisticaDto[] | null
}

export interface ResultadoPaginadoDto<TItem> {
  items: TItem[] | null
  totalItens: number
  paginaAtual: number
  tamanhoPagina: number
  totalPaginas?: number
  temProximaPagina?: boolean
  temPaginaAnterior?: boolean
}

export interface BuscarMensagensParams {
  sistemaId?: string
  entidadeOrigemId?: string
  autorId?: string
  autorNome?: string
  pesquisa?: string
  dataInicio?: string
  dataFim?: string
  page?: number
  pageSize?: number
  sortDirection?: 'asc' | 'desc'
  sortBy?: string
  offset?: number
}

export const CHAT_SISTEMA_ID = '7b8659bb-1aeb-4d74-92c1-110c1d27e576'
export const CHAT_PAGE_SIZE_DEFAULT = 50
export const CHAT_TEXTO_MAX_LENGTH = 250

export const mapMensagemResponseToChatMessage = (
  dto: MensagemResponseDto,
): ChatMessage => {
  const conteudo = dto.texto ?? ''

  return {
    id: dto.id,
    contratoId: dto.entidadeOrigemId,
    remetente: {
      id: dto.autorId ?? 'desconhecido',
      nome: dto.autorNome ?? 'Usuário',
      tipo:
        dto.autorId && dto.autorId.toLowerCase() === 'sistema'
          ? 'sistema'
          : 'usuario',
    },
    conteudo,
    tipo:
      dto.autorId && dto.autorId.toLowerCase() === 'sistema'
        ? 'sistema'
        : 'texto',
    dataEnvio: dto.enviadoEm,
    lida: false,
    editada: Boolean(dto.atualizadoEm && dto.atualizadoEm !== dto.criadoEm),
    editadaEm: dto.atualizadoEm ?? undefined,
    metadata: {
      sistemaId: dto.sistemaId,
      entidadeOrigemId: dto.entidadeOrigemId,
    },
  }
}

export const mapChatMessageToCriarMensagemDto = ({
  contratoId,
  conteudo,
  remetente,
}: Pick<ChatMessage, 'contratoId' | 'conteudo' | 'remetente'>): CriarMensagemDto => ({
  sistemaId: CHAT_SISTEMA_ID,
  entidadeOrigemId: contratoId,
  texto: conteudo,
  autorId: remetente.id,
  autorNome: remetente.nome,
})
