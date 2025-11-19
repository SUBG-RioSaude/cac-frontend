import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import type {
  ListarPermissoesResponse,
  MinhasPermissoesResponse,
  Permissao,
  ValidarPermissaoRequest,
  ValidarPermissaoResponse,
} from '@/types/permissoes'

import { createServiceLogger } from '../logger'

import { permissoesService } from './permissoes-service'

const permissoesLogger = createServiceLogger('permissoes-queries')

/**
 * Query keys para permissões
 */
export const permissoesKeys = {
  all: ['permissoes'] as const,
  lists: () => [...permissoesKeys.all, 'list'] as const,
  list: () => [...permissoesKeys.lists()] as const,
  validacoes: () => [...permissoesKeys.all, 'validacao'] as const,
  validacao: (sistemaId: string, permissaoNome: string) =>
    [...permissoesKeys.validacoes(), sistemaId, permissaoNome] as const,
  minhas: () => [...permissoesKeys.all, 'minhas'] as const,
  minha: (sistemaId: string) => [...permissoesKeys.minhas(), sistemaId] as const,
}

/**
 * Hook para buscar lista de todas as permissões disponíveis
 *
 * @example
 * const { data: permissoes, isLoading } = usePermissoesQuery()
 */
export const usePermissoesQuery = (
  options?: Omit<
    UseQueryOptions<ListarPermissoesResponse, Error, Permissao[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<ListarPermissoesResponse, Error, Permissao[]>({
    queryKey: permissoesKeys.list(),
    queryFn: async () => {
      permissoesLogger.info(
        { action: 'listar-permissoes', status: 'requesting' },
        'Buscando lista de permissões',
      )

      const response = await permissoesService.listarPermissoes()

      if (!response.sucesso) {
        permissoesLogger.error(
          { action: 'listar-permissoes', status: 'failed' },
          response.mensagem ?? 'Erro ao buscar permissões',
        )
        throw new Error(response.mensagem ?? 'Erro ao buscar permissões')
      }

      permissoesLogger.info(
        {
          action: 'listar-permissoes',
          status: 'success',
          count: response.dados.items?.length || 0,
        },
        `${response.dados.items?.length || 0} permissões encontradas`,
      )

      return response
    },
    select: (response) => response.dados.items || [],
    staleTime: 15 * 60 * 1000, // 15 minutos (permissões não mudam frequentemente)
    gcTime: 30 * 60 * 1000, // 30 minutos
    ...options,
  })
}

/**
 * Hook para validar se o usuário tem uma permissão específica (validação server-side)
 *
 * @param request - Objeto com sistemaId e permissaoNome
 * @param enabled - Se a query deve ser executada automaticamente
 *
 * @example
 * const { data: temPermissao, isLoading } = useValidarPermissaoQuery({
 *   sistemaId: 'uuid-do-sistema',
 *   permissaoNome: 'Criar'
 * })
 */
export const useValidarPermissaoQuery = (
  request: ValidarPermissaoRequest,
  options?: Omit<
    UseQueryOptions<ValidarPermissaoResponse, Error, boolean>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<ValidarPermissaoResponse, Error, boolean>({
    queryKey: permissoesKeys.validacao(request.sistemaId, request.permissaoNome),
    queryFn: async () => {
      permissoesLogger.info(
        {
          action: 'validar-permissao',
          status: 'requesting',
          sistemaId: request.sistemaId,
          permissaoNome: request.permissaoNome,
        },
        `Validando permissão "${request.permissaoNome}"`,
      )

      const response = await permissoesService.validarPermissao(request)

      if (!response.sucesso) {
        permissoesLogger.error(
          {
            action: 'validar-permissao',
            status: 'failed',
            sistemaId: request.sistemaId,
            permissaoNome: request.permissaoNome,
          },
          response.mensagem ?? 'Erro ao validar permissão',
        )
        throw new Error(response.mensagem ?? 'Erro ao validar permissão')
      }

      permissoesLogger.info(
        {
          action: 'validar-permissao',
          status: 'success',
          sistemaId: request.sistemaId,
          permissaoNome: request.permissaoNome,
          temPermissao: response.dados,
        },
        `Permissão "${request.permissaoNome}": ${response.dados ? 'PERMITIDA' : 'NEGADA'}`,
      )

      return response
    },
    select: (response) => response.dados,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    ...options,
  })
}

/**
 * Hook para buscar todas as permissões do usuário autenticado em um sistema
 *
 * @param sistemaId - ID do sistema
 * @param enabled - Se a query deve ser executada automaticamente
 *
 * @example
 * const { data, isLoading } = useMinhasPermissoesQuery('uuid-do-sistema')
 * // data?.permissoes = ['Visualizar', 'Criar', 'Editar']
 */
export const useMinhasPermissoesQuery = (
  sistemaId: string,
  options?: Omit<
    UseQueryOptions<MinhasPermissoesResponse, Error, MinhasPermissoesResponse['dados']>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<MinhasPermissoesResponse, Error, MinhasPermissoesResponse['dados']>({
    queryKey: permissoesKeys.minha(sistemaId),
    queryFn: async () => {
      permissoesLogger.info(
        { action: 'minhas-permissoes', status: 'requesting', sistemaId },
        'Buscando permissões do usuário',
      )

      const response = await permissoesService.minhasPermissoes(sistemaId)

      if (!response.sucesso) {
        permissoesLogger.error(
          { action: 'minhas-permissoes', status: 'failed', sistemaId },
          response.mensagem ?? 'Erro ao buscar permissões',
        )
        throw new Error(response.mensagem ?? 'Erro ao buscar permissões')
      }

      permissoesLogger.info(
        {
          action: 'minhas-permissoes',
          status: 'success',
          sistemaId,
          sistema: response.dados.sistemaNome,
          permissoes: response.dados.permissoes,
        },
        `Permissões do usuário em "${response.dados.sistemaNome}": ${response.dados.permissoes.join(', ')}`,
      )

      return response
    },
    select: (response) => response.dados,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    enabled: !!sistemaId, // Apenas executa se sistemaId fornecido
    ...options,
  })
}
