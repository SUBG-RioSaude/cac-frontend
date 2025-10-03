/**
 * Serviços da API de Unidades de Saúde
 * Integração com TanStack Query e executeWithFallback
 */

import { executeWithFallback, api } from '@/lib/axios'
import { createServiceLogger } from '@/lib/logger'
import type {
  UnidadeSaudeApi,
  UnidadeSaudeCreateApi,
  UnidadeSaudeUpdateApi,
  PaginacaoUnidadesApi,
  FiltrosUnidadesApi,
  CapApi,
  TipoUnidadeApi,
  TipoAdministracaoApi,
  UnidadeDetalhada,
} from '@/modules/Unidades/types/unidade-api'

// Helper para acessar variável de ambiente de forma tipada
const getApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL as string
  if (!url) {
    throw new Error('VITE_API_URL não está configurada')
  }
  return url
}

const logger = createServiceLogger('unidades-service')

// ========== OPERAÇÕES PRINCIPAIS - UNIDADES ==========

export async function getUnidades(
  filtros?: FiltrosUnidadesApi,
): Promise<PaginacaoUnidadesApi> {
  const response = await executeWithFallback<PaginacaoUnidadesApi>({
    method: 'get',
    url: '/unidades',
    params: {
      pagina: filtros?.pagina ?? 1,
      tamanhoPagina: filtros?.tamanhoPagina ?? 10,
      ordenarPor: filtros?.ordenarPor,
      direcaoOrdenacao: filtros?.direcaoOrdenacao,
      nome: filtros?.nome,
      sigla: filtros?.sigla,
      cnes: filtros?.cnes,
      bairro: filtros?.bairro,
      ativo: filtros?.ativo ?? true, // Por padrão, buscar apenas unidades ativas
    },
    baseURL: getApiUrl(),
  })

  return response.data
}

export async function getUnidadeById(id: string): Promise<UnidadeSaudeApi> {
  const response = await executeWithFallback<UnidadeSaudeApi>({
    method: 'get',
    url: `/unidades/${id}`,
    baseURL: getApiUrl(),
  })

  return response.data
}

export async function createUnidade(
  data: UnidadeSaudeCreateApi,
): Promise<UnidadeSaudeApi> {
  const response = await executeWithFallback<UnidadeSaudeApi>({
    method: 'post',
    url: '/unidades',
    data,
    baseURL: getApiUrl(),
  })

  return response.data
}

export async function updateUnidade(
  data: UnidadeSaudeUpdateApi,
): Promise<UnidadeSaudeApi> {
  const { id, ...updateData } = data

  const response = await executeWithFallback<UnidadeSaudeApi>({
    method: 'put',
    url: `/unidades/${id}`,
    data: updateData,
    baseURL: getApiUrl(),
  })

  return response.data
}

export async function deleteUnidade(id: string): Promise<void> {
  await executeWithFallback({
    method: 'delete',
    url: `/unidades/${id}`,
    baseURL: getApiUrl(),
  })
}

export async function buscarUnidadesPorNome(
  nome: string,
): Promise<UnidadeSaudeApi[]> {
  // A API espera o parâmetro 'nome' em /unidades?nome=...
  // Fazemos fallback para ambos formatos de resposta: lista direta ou paginada (dados[])
  const response = await executeWithFallback<
    { dados?: UnidadeSaudeApi[] } | UnidadeSaudeApi[]
  >({
    method: 'get',
    url: '/unidades',
    params: { nome },
    baseURL: getApiUrl(),
  })

  const { data } = response
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'dados' in data) {
    return (data as { dados: UnidadeSaudeApi[] }).dados
  }
  return []
}

/**
 * Busca unidades por nome ou sigla
 * Realiza busca tanto no campo nome quanto na sigla da unidade
 */
export async function buscarUnidadesPorNomeOuSigla(
  termo: string,
): Promise<UnidadeSaudeApi[]> {
  // Primeira busca: por nome
  const unidadesPorNome = await buscarUnidadesPorNome(termo)

  // Se o termo é curto (possível sigla), busca também por sigla
  if (termo.length <= 10) {
    // Siglas geralmente são curtas
    try {
      // Busca também por sigla usando o mesmo endpoint com parâmetro diferente
      const response = await executeWithFallback<
        { dados?: UnidadeSaudeApi[] } | UnidadeSaudeApi[]
      >({
        method: 'get',
        url: '/unidades',
        params: { sigla: termo },
        baseURL: getApiUrl(),
      })

      const { data } = response
      let unidadesPorSigla: UnidadeSaudeApi[] = []

      if (Array.isArray(data)) {
        unidadesPorSigla = data
      } else if (typeof data === 'object' && 'dados' in data) {
        unidadesPorSigla = (data as { dados: UnidadeSaudeApi[] }).dados
      }

      // Combinar resultados e remover duplicatas
      const todasUnidades = [...unidadesPorNome, ...unidadesPorSigla]
      const unidadesUnicas = todasUnidades.filter(
        (unidade, index, self) =>
          index === self.findIndex((u) => u.id === unidade.id),
      )

      return unidadesUnicas
    } catch {
      // Se a busca por sigla falhar, retorna apenas os resultados por nome
      return unidadesPorNome
    }
  }

  return unidadesPorNome
}

export const buscarUnidadePorId = async (
  id: string,
): Promise<UnidadeDetalhada> => {
  try {
    const response = await api.get<UnidadeDetalhada>(`/unidades/${id}`)
    return response.data
  } catch (error) {
    logger.error(
      {
        operation: 'buscar_unidade_por_id',
        unidadeId: id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar unidade por ID',
    )
    throw error
  }
}

// ========== OPERAÇÕES AUXILIARES - CAPS ==========

export async function getCaps(): Promise<CapApi[]> {
  const response = await executeWithFallback<CapApi[]>({
    method: 'get',
    url: '/caps',
    baseURL: getApiUrl(),
  })

  return response.data
}

export async function getCapById(id: string): Promise<CapApi> {
  const response = await executeWithFallback<CapApi>({
    method: 'get',
    url: `/caps/${id}`,
    baseURL: getApiUrl(),
  })

  return response.data
}

export async function buscarCapsPorNome(nome: string): Promise<CapApi[]> {
  const response = await executeWithFallback<CapApi[]>({
    method: 'get',
    url: '/caps/buscar',
    params: { nome },
    baseURL: getApiUrl(),
  })

  return response.data
}

// ========== OPERAÇÕES AUXILIARES - TIPOS ==========

export async function getTiposUnidade(): Promise<TipoUnidadeApi[]> {
  const response = await executeWithFallback<TipoUnidadeApi[]>({
    method: 'get',
    url: '/TipoUnidade',
    baseURL: getApiUrl(),
  })

  return response.data
}

export async function getTiposAdministracao(): Promise<TipoAdministracaoApi[]> {
  const response = await executeWithFallback<TipoAdministracaoApi[]>({
    method: 'get',
    url: '/TipoAdministracao',
    baseURL: getApiUrl(),
  })

  return response.data
}
