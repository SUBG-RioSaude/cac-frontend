/**
 * ==========================================
 * HOOKS REACT QUERY PARA FUNCIONÁRIOS
 * ==========================================
 * Hooks para queries e mutations da API de funcionários
 * Integra com sistema de fallback e cache otimizado
 */

import { useQuery, useQueries, type UseQueryOptions } from '@tanstack/react-query'
import { 
  getFuncionarios,
  getFuncionarioById,
  getFuncionarioByMatricula,
  getFuncionarioByCpf,
  buscarFuncionariosPorNome,
  buscarFuncionariosPorLotacao,
  getLotacoes,
  getLotacaoById,
  getLotacaoByCodigo,
  buscarLotacoesPorNome
} from '@/modules/Funcionarios/services/funcionarios-service'
import { funcionarioKeys, lotacaoKeys } from '@/modules/Funcionarios/lib/query-keys'
import type {
  FuncionarioApi,
  LotacaoApi,
  FuncionarioParametros,
  LotacaoParametros,
  FuncionariosPaginacaoResponse,
  LotacoesPaginacaoResponse,
  BuscaFuncionarioResponse,
  BuscaLotacaoResponse
} from '@/modules/Funcionarios/types/funcionario-api'

// ========== HOOKS DE FUNCIONÁRIOS ==========

/**
 * Hook para buscar lista de funcionários com filtros
 */
export function useGetFuncionarios(
  filtros?: FuncionarioParametros,
  options?: UseQueryOptions<FuncionariosPaginacaoResponse>
) {
  return useQuery({
    queryKey: funcionarioKeys.list(filtros),
    queryFn: () => getFuncionarios(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options
  })
}

/**
 * Hook para buscar funcionário por ID
 */
export function useGetFuncionarioById(
  id: string,
  options?: UseQueryOptions<FuncionarioApi>
) {
  return useQuery({
    queryKey: funcionarioKeys.detail(id),
    queryFn: () => getFuncionarioById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    ...options
  })
}

/**
 * Hook para buscar múltiplos funcionários por IDs
 */
export function useFuncionariosByIds(
  ids: string[],
  options?: { enabled?: boolean }
) {
  const { data, isLoading, error } = useQueries({
    queries: ids.map((id) => ({
      queryKey: funcionarioKeys.detail(id),
      queryFn: () => getFuncionarioById(id),
      enabled: !!(id && (options?.enabled ?? true)),
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
      retry: 2,
    })),
    combine: (results) => ({
      data: results.reduce((acc, result, index) => {
        if (result.data) {
          acc[ids[index]] = result.data
        }
        return acc
      }, {} as Record<string, FuncionarioApi>),
      isLoading: results.some(result => result.isLoading),
      error: results.find(result => result.error)?.error,
      isSuccess: results.every(result => result.isSuccess),
      hasErrors: results.some(result => result.error),
      errors: results.filter(result => result.error).map(result => result.error),
    })
  })

  return {
    data,
    isLoading,
    error,
    funcionarios: data,
    getFuncionario: (id: string) => data[id],
    hasData: Object.keys(data).length > 0,
  }
}

/**
 * Hook para buscar funcionário por matrícula
 */
export function useGetFuncionarioByMatricula(
  matricula: string,
  options?: UseQueryOptions<BuscaFuncionarioResponse> & {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: funcionarioKeys.byMatricula(matricula),
    queryFn: () => getFuncionarioByMatricula(matricula),
    enabled: !!matricula && (options?.enabled !== false),
    staleTime: 15 * 60 * 1000, // 15 minutos (dados mais estáveis)
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 1, // Retry uma vez apenas para buscas específicas
    ...options
  })
}

/**
 * Hook para buscar funcionário por CPF
 */
export function useGetFuncionarioByCpf(
  cpf: string,
  options?: UseQueryOptions<BuscaFuncionarioResponse> & {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: funcionarioKeys.byCpf(cpf),
    queryFn: () => getFuncionarioByCpf(cpf),
    enabled: !!cpf && (options?.enabled !== false),
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 1,
    ...options
  })
}

/**
 * Hook para buscar funcionários por nome (busca parcial)
 */
export function useBuscarFuncionariosPorNome(
  nome: string,
  limit = 10,
  options?: UseQueryOptions<FuncionarioApi[]> & {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: funcionarioKeys.byNome(nome),
    queryFn: () => buscarFuncionariosPorNome(nome, limit),
    enabled: !!nome && nome.length >= 2 && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutos (busca dinâmica)
    gcTime: 5 * 60 * 1000, // 5 minutos
    ...options
  })
}

/**
 * Hook para buscar funcionários por lotação
 */
export function useBuscarFuncionariosPorLotacao(
  lotacao: string,
  limit = 50,
  options?: UseQueryOptions<FuncionarioApi[]> & {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: funcionarioKeys.byLotacao(lotacao),
    queryFn: () => buscarFuncionariosPorLotacao(lotacao, limit),
    enabled: !!lotacao && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options
  })
}

/**
 * Hook para buscar apenas funcionários ativos
 */
export function useGetFuncionariosAtivos(
  filtros?: Omit<FuncionarioParametros, 'ativo'>,
  options?: UseQueryOptions<FuncionariosPaginacaoResponse>
) {
  return useQuery({
    queryKey: funcionarioKeys.list({ ...filtros, ativo: true }),
    queryFn: () => getFuncionarios({ ...filtros, ativo: true }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options
  })
}

// ========== HOOKS DE LOTAÇÕES ==========

/**
 * Hook para buscar lista de lotações com filtros
 */
export function useGetLotacoes(
  filtros?: LotacaoParametros,
  options?: UseQueryOptions<LotacoesPaginacaoResponse>
) {
  return useQuery({
    queryKey: lotacaoKeys.list(filtros),
    queryFn: () => getLotacoes(filtros),
    staleTime: 10 * 60 * 1000, // 10 minutos (dados mais estáveis)
    gcTime: 30 * 60 * 1000, // 30 minutos
    ...options
  })
}

/**
 * Hook para buscar lotação por ID
 */
export function useGetLotacaoById(
  id: string,
  options?: UseQueryOptions<LotacaoApi>
) {
  return useQuery({
    queryKey: lotacaoKeys.detail(id),
    queryFn: () => getLotacaoById(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    ...options
  })
}

/**
 * Hook para buscar lotação por código
 */
export function useGetLotacaoByCodigo(
  codigo: string,
  options?: UseQueryOptions<BuscaLotacaoResponse> & {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: lotacaoKeys.byCodigo(codigo),
    queryFn: () => getLotacaoByCodigo(codigo),
    enabled: !!codigo && (options?.enabled !== false),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    ...options
  })
}

/**
 * Hook para buscar lotações por nome (busca parcial)
 */
export function useBuscarLotacoesPorNome(
  nome: string,
  limit = 20,
  options?: UseQueryOptions<LotacaoApi[]> & {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: lotacaoKeys.byNome(nome),
    queryFn: () => buscarLotacoesPorNome(nome, limit),
    enabled: !!nome && nome.length >= 2 && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options
  })
}

/**
 * Hook para buscar apenas lotações ativas
 */
export function useGetLotacoesAtivas(
  filtros?: Omit<LotacaoParametros, 'ativo'>,
  options?: UseQueryOptions<LotacoesPaginacaoResponse>
) {
  return useQuery({
    queryKey: lotacaoKeys.list({ ...filtros, ativo: true }),
    queryFn: () => getLotacoes({ ...filtros, ativo: true }),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options
  })
}

// ========== HOOKS COMPOSTOS PARA FORMULÁRIOS ==========

/**
 * Hook otimizado para busca em formulários de atribuição
 * Combina funcionários ativos com suas lotações
 */
export function useFuncionariosParaAtribuicao(
  filtros?: {
    nome?: string
    lotacao?: string
    limit?: number
  },
  options?: {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: [...funcionarioKeys.all, 'para-atribuicao', filtros],
    queryFn: async () => {
      const params: FuncionarioParametros = {
        ativo: true,
        tamanhoPagina: filtros?.limit || 50
      }

      if (filtros?.nome) params.nome = filtros.nome
      if (filtros?.lotacao) params.lotacao = filtros.lotacao

      const response = await getFuncionarios(params)
      return response.dados
    },
    enabled: options?.enabled !== false,
    staleTime: 3 * 60 * 1000, // 3 minutos para uso em formulários
    gcTime: 10 * 60 * 1000,
  })
}