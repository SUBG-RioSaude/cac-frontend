/**
 * Serviços da API de Unidades de Saúde
 * Integração com TanStack Query e executeWithFallback
 */

import { executeWithFallback, api } from '@/lib/axios'
import type {
  UnidadeSaudeApi,
  UnidadeSaudeCreateApi, 
  UnidadeSaudeUpdateApi,
  PaginacaoUnidadesApi,
  FiltrosUnidadesApi,
  CapApi,
  TipoUnidadeApi,
  TipoAdministracaoApi,
  UnidadeDetalhada
} from '@/modules/Unidades/types/unidade-api'

// ========== OPERAÇÕES PRINCIPAIS - UNIDADES ==========

export async function getUnidades(
  filtros?: FiltrosUnidadesApi
): Promise<PaginacaoUnidadesApi> {
  const response = await executeWithFallback<PaginacaoUnidadesApi>({
    method: 'get',
    url: '/unidades',
    params: {
      pagina: filtros?.pagina || 1,
      tamanhoPagina: filtros?.tamanhoPagina || 10,
      ordenarPor: filtros?.ordenarPor,
      direcaoOrdenacao: filtros?.direcaoOrdenacao
    },
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export async function getUnidadeById(id: string): Promise<UnidadeSaudeApi> {
  const response = await executeWithFallback<UnidadeSaudeApi>({
    method: 'get',
    url: `/unidades/${id}`,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export async function createUnidade(data: UnidadeSaudeCreateApi): Promise<UnidadeSaudeApi> {
  const response = await executeWithFallback<UnidadeSaudeApi>({
    method: 'post',
    url: '/unidades',
    data,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export async function updateUnidade(data: UnidadeSaudeUpdateApi): Promise<UnidadeSaudeApi> {
  const { id, ...updateData } = data
  
  const response = await executeWithFallback<UnidadeSaudeApi>({
    method: 'put',
    url: `/unidades/${id}`,
    data: updateData,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export async function deleteUnidade(id: string): Promise<void> {
  await executeWithFallback({
    method: 'delete',
    url: `/unidades/${id}`,
    baseURL: import.meta.env.VITE_API_URL
  })
}

export async function buscarUnidadesPorNome(nome: string): Promise<UnidadeSaudeApi[]> {
  const response = await executeWithFallback<UnidadeSaudeApi[]>({
    method: 'get',
    url: '/unidades/buscar',
    params: { nome },
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export const buscarUnidadePorId = async (id: string): Promise<UnidadeDetalhada> => {
  try {
    console.log('[DEBUG] URL da API:', import.meta.env.VITE_API_URL)
    console.log('[DEBUG] Fazendo requisição para:', `/unidades/${id}`)
    const response = await api.get<UnidadeDetalhada>(`/unidades/${id}`)
    console.log('[DEBUG] Resposta recebida:', response.data)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar unidade por ID:', error)
    throw error
  }
}

// ========== OPERAÇÕES AUXILIARES - CAPS ==========

export async function getCaps(): Promise<CapApi[]> {
  const response = await executeWithFallback<CapApi[]>({
    method: 'get',
    url: '/caps',
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export async function getCapById(id: string): Promise<CapApi> {
  const response = await executeWithFallback<CapApi>({
    method: 'get',
    url: `/caps/${id}`,
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export async function buscarCapsPorNome(nome: string): Promise<CapApi[]> {
  const response = await executeWithFallback<CapApi[]>({
    method: 'get',
    url: '/caps/buscar',
    params: { nome },
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

// ========== OPERAÇÕES AUXILIARES - TIPOS ==========

export async function getTiposUnidade(): Promise<TipoUnidadeApi[]> {
  const response = await executeWithFallback<TipoUnidadeApi[]>({
    method: 'get',
    url: '/TipoUnidade',
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}

export async function getTiposAdministracao(): Promise<TipoAdministracaoApi[]> {
  const response = await executeWithFallback<TipoAdministracaoApi[]>({
    method: 'get',
    url: '/TipoAdministracao', 
    baseURL: import.meta.env.VITE_API_URL
  })

  return response.data
}