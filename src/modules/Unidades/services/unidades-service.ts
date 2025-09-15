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
  // A API espera o parâmetro 'nome' em /unidades?nome=...
  // Fazemos fallback para ambos formatos de resposta: lista direta ou paginada (dados[])
  const response = await executeWithFallback<{ dados?: UnidadeSaudeApi[] } | UnidadeSaudeApi[]>({
    method: 'get',
    url: '/unidades',
    params: { nome },
    baseURL: import.meta.env.VITE_API_URL
  })

  const data = response.data
  if (Array.isArray(data)) return data as UnidadeSaudeApi[]
  if (data && Array.isArray(data.dados)) return data.dados as UnidadeSaudeApi[]
  return []
}

/**
 * Busca unidades por nome ou sigla
 * Realiza busca tanto no campo nome quanto na sigla da unidade
 */
export async function buscarUnidadesPorNomeOuSigla(termo: string): Promise<UnidadeSaudeApi[]> {
  // Primeira busca: por nome
  const unidadesPorNome = await buscarUnidadesPorNome(termo)
  
  // Se o termo é curto (possível sigla), busca também por sigla
  if (termo.length <= 10) { // Siglas geralmente são curtas
    try {
      // Busca também por sigla usando o mesmo endpoint com parâmetro diferente
      const response = await executeWithFallback<{ dados?: UnidadeSaudeApi[] } | UnidadeSaudeApi[]>({
        method: 'get',
        url: '/unidades',
        params: { sigla: termo },
        baseURL: import.meta.env.VITE_API_URL
      })
      
      const data = response.data
      let unidadesPorSigla: UnidadeSaudeApi[] = []
      
      if (Array.isArray(data)) {
        unidadesPorSigla = data as UnidadeSaudeApi[]
      } else if (data && Array.isArray(data.dados)) {
        unidadesPorSigla = data.dados as UnidadeSaudeApi[]
      }
      
      // Combinar resultados e remover duplicatas
      const todasUnidades = [...unidadesPorNome, ...unidadesPorSigla]
      const unidadesUnicas = todasUnidades.filter((unidade, index, self) => 
        index === self.findIndex(u => u.id === unidade.id)
      )
      
      return unidadesUnicas
    } catch (error) {
      // Se a busca por sigla falhar, retorna apenas os resultados por nome
      return unidadesPorNome
    }
  }
  
  return unidadesPorNome
}

export const buscarUnidadePorId = async (id: string): Promise<UnidadeDetalhada> => {
  try {
    const response = await api.get<UnidadeDetalhada>(`/unidades/${id}`)
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
