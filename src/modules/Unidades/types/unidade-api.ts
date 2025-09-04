/**
 * Interfaces da API de Unidades de Saúde
 * Baseadas no OpenAPI schema da API
 */

// ========== TIPOS DA API ==========

export interface CapApi {
  id: string
  ativo: boolean
  nome: string
  uo: string
}

export interface UnidadeSaudeApi {
  id: string
  ativo: boolean
  nome: string
  sigla?: string | null
  capId: string
  cap: CapApi
  endereco?: string | null
  bairro?: string | null
  ua?: number | null
  subsecretaria?: string | null
  ap?: string | null
  uo?: number | null
  ug?: number | null
  cnes?: string | null
  latitude?: string | null
  longitude?: string | null
  tipoUnidadeId?: number
  tipoAdministracaoId?: number
}

export interface UnidadeSaudeCreateApi {
  nome: string
  capId: string
  ativo?: boolean
  endereco?: string | null
  bairro?: string | null
  ua?: number | null
  subsecretaria?: string | null
  sigla?: string | null
  ap?: string | null
  uo?: number | null
  ug?: number | null
  cnes?: string | null
  latitude?: string | null
  longitude?: string | null
  tipoUnidadeId: number
  tipoAdministracaoId: number
}

export interface UnidadeSaudeUpdateApi extends Partial<UnidadeSaudeCreateApi> {
  id: string
}

// ========== RESPOSTA PAGINADA ==========

export interface PaginacaoUnidadesApi {
  dados: UnidadeSaudeApi[]
  paginaAtual: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
  temPaginaAnterior: boolean
  temProximaPagina: boolean
  ordenadoPor?: string | null
  direcaoOrdenacao?: string | null
}

// ========== FILTROS E PARÂMETROS ==========

export interface FiltrosUnidadesApi {
  pagina?: number
  tamanhoPagina?: number
  ordenarPor?: string
  direcaoOrdenacao?: 'asc' | 'desc'
  nome?: string // para busca por nome
}

// ========== MAPEAMENTO PARA INTERFACE LEGADA ==========

import type { Unidade } from '@/modules/Unidades/ListaUnidades/types/unidade'

export function mapearUnidadeApi(apiData: UnidadeSaudeApi): Unidade {
  console.log('[DEBUG] Mapeando unidade API:', apiData)
  
  // Preservar o ID original (pode ser GUID ou número)
  const mappedId = apiData.id
  
  console.log('[DEBUG] ID mapeado:', mappedId, 'de:', apiData.id, 'tipo original:', typeof apiData.id)
  
  return {
    id: mappedId,
    nome: apiData.nome,
    sigla: apiData.sigla || '',
    UO: apiData.uo?.toString() || '',
    UG: apiData.ug?.toString() || '',
    endereco: apiData.endereco || '',
    status: apiData.ativo ? 'ativo' : 'inativo',
    // Campos calculados - serão implementados quando necessário
    contratosAtivos: 0,
    valorTotalContratado: 0,
    contratos: []
  }
}

// ========== TIPOS AUXILIARES ==========

export interface TipoUnidadeApi {
  id: number
  descricao: string
  ativo: boolean
}

export interface TipoAdministracaoApi {
  id: number
  descricao: string
  ativo: boolean
}

export interface CapCreateApi {
  nome: string
  uo: string
  ativo?: boolean
}

export interface UnidadeDetalhada {
  nome: string
  sigla: string
  capId: string
  cap: {
    nome: string
    uo: string
    id: string
    ativo: boolean
  }
  endereco: string
  bairro: string
  ua: number
  subsecretaria: string
  ap: string
  uo: number
  ug: number
  cnes: string
  latitude: string
  longitude: string
  tipoUnidadeId: number
  tipoUnidade: TipoUnidadeApi | null
  tipoAdministracaoId: number
  tipoAdministracao: TipoAdministracaoApi | null
  id: string
  ativo: boolean
}