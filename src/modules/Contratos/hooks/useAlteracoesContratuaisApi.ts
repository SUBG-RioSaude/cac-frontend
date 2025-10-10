/**
 * Hooks especializados para operações da API de Alterações Contratuais
 * Utiliza TanStack Query para cache, loading states e gerenciamento de estado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  getAlteracoesContratuais,
  getAlteracaoContratualById,
  criarAlteracaoContratual,
  confirmarLimiteLegal,
  atualizarAlteracaoContratual,
  excluirAlteracaoContratual,
  submeterParaAprovacao,
  aprovarAlteracao,
  rejeitarAlteracao,
  getWorkflowStatus,
  gerarResumoAlteracao,
  getTiposAlteracaoConfig,
  getDocumentosAlteracao,
  getAlteracoesPendentes,
  getAlteracoesAtivas,
  type PaginacaoResponse,
} from '../services/alteracoes-contratuais-service'
import type {
  AlteracaoContratualForm,
  AlteracaoContratualResponse,
  FiltrosAlteracoesContratuais,
  ResumoAlteracaoResponse,
  TipoAlteracaoConfig,
  WorkflowStatusResponse,
  AlertaLimiteLegal,
} from '../types/alteracoes-contratuais'

// ========== QUERY KEYS ==========

export const alteracoesContratuaisKeys = {
  all: ['alteracoes-contratuais'] as const,
  lists: () => [...alteracoesContratuaisKeys.all, 'list'] as const,
  list: (contratoId: string, filtros?: FiltrosAlteracoesContratuais) =>
    [...alteracoesContratuaisKeys.lists(), contratoId, filtros] as const,
  details: () => [...alteracoesContratuaisKeys.all, 'detail'] as const,
  detail: (id: string) => [...alteracoesContratuaisKeys.details(), id] as const,
  workflow: (id: string) =>
    [...alteracoesContratuaisKeys.detail(id), 'workflow'] as const,
  documentos: (id: string) =>
    [...alteracoesContratuaisKeys.detail(id), 'documentos'] as const,
  resumo: (contratoId: string, dados: AlteracaoContratualForm) =>
    [...alteracoesContratuaisKeys.all, 'resumo', contratoId, dados] as const,
  tipos: () => [...alteracoesContratuaisKeys.all, 'tipos'] as const,
  pendentes: (contratoId: string) =>
    [...alteracoesContratuaisKeys.all, 'pendentes', contratoId] as const,
  ativas: (contratoId: string) =>
    [...alteracoesContratuaisKeys.all, 'ativas', contratoId] as const,
}

// ========== HOOKS DE CONSULTA ==========

/**
 * Hook para listar alterações contratuais com paginação
 */
export function useAlteracoesContratuaisList(
  contratoId: string,
  filtros?: FiltrosAlteracoesContratuais,
  options?: Omit<
    UseQueryOptions<PaginacaoResponse<AlteracaoContratualResponse>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.list(contratoId, filtros),
    queryFn: () => getAlteracoesContratuais(contratoId, filtros),
    enabled: !!contratoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  })
}

/**
 * Hook para buscar alteração contratual por ID
 */
export function useAlteracaoContratual(
  id: string,
  options?: Omit<
    UseQueryOptions<AlteracaoContratualResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.detail(id),
    queryFn: () => getAlteracaoContratualById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    ...options,
  })
}

/**
 * Hook para buscar workflow/histórico de uma alteração
 */
export function useWorkflowStatus(
  id: string,
  options?: Omit<
    UseQueryOptions<WorkflowStatusResponse[]>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.workflow(id),
    queryFn: () => getWorkflowStatus(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    ...options,
  })
}

/**
 * Hook para buscar documentos anexos
 */
export function useDocumentosAlteracao(
  id: string,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.documentos(id),
    queryFn: () => getDocumentosAlteracao(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  })
}

/**
 * Hook para buscar configuração dos tipos de alteração
 */
export function useTiposAlteracaoConfig(
  options?: Omit<
    UseQueryOptions<Record<number, TipoAlteracaoConfig>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.tipos(),
    queryFn: getTiposAlteracaoConfig,
    staleTime: 30 * 60 * 1000, // 30 minutos (dados raramente mudam)
    ...options,
  })
}

/**
 * Hook para gerar resumo/preview da alteração
 */
export function useResumoAlteracao(
  contratoId: string,
  dados: AlteracaoContratualForm,
  options?: Omit<
    UseQueryOptions<ResumoAlteracaoResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.resumo(contratoId, dados),
    queryFn: () => gerarResumoAlteracao(contratoId, dados),
    enabled: !!contratoId && !!dados.tiposAlteracao.length,
    staleTime: 0, // Sempre fresh para refletir mudanças no formulário
    ...options,
  })
}

/**
 * Hook para buscar alterações pendentes
 */
export function useAlteracoesPendentes(
  contratoId: string,
  options?: Omit<
    UseQueryOptions<AlteracaoContratualResponse[]>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.pendentes(contratoId),
    queryFn: () => getAlteracoesPendentes(contratoId),
    enabled: !!contratoId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    ...options,
  })
}

/**
 * Hook para buscar alterações ativas
 */
export function useAlteracoesAtivas(
  contratoId: string,
  options?: Omit<
    UseQueryOptions<AlteracaoContratualResponse[]>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: alteracoesContratuaisKeys.ativas(contratoId),
    queryFn: () => getAlteracoesAtivas(contratoId),
    enabled: !!contratoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  })
}

// ========== HOOKS DE MUTAÇÃO ==========

/**
 * Hook para criar nova alteração contratual
 */
export function useCriarAlteracaoContratual(
  options?: UseMutationOptions<
    {
      alteracao: AlteracaoContratualResponse
      alertaLimiteLegal?: AlertaLimiteLegal
      status: number
    },
    Error,
    { contratoId: string; dados: AlteracaoContratualForm }
  >,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contratoId, dados }) =>
      criarAlteracaoContratual(contratoId, dados),
    onSuccess: (data) => {
      // Invalida listas para refresh
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.lists(),
      })

      // Atualiza cache da nova alteração
      queryClient.setQueryData(
        alteracoesContratuaisKeys.detail(data.alteracao.id),
        data.alteracao,
      )

      // Notificação baseada no status
      if (data.status === 202) {
        toast.warning('Alteração criada com alerta de limite legal', {
          description: 'Revise os limites antes de submeter para aprovação',
        })
      } else {
        toast.success('Alteração contratual criada com sucesso!')
      }
    },
    onError: (error) => {
      toast.error('Erro ao criar alteração contratual', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook para confirmar limite legal excedido
 */
export function useConfirmarLimiteLegal(
  options?: UseMutationOptions<
    AlteracaoContratualResponse,
    Error,
    {
      id: string
      confirmacao: { confirmado: boolean; justificativaAdicional?: string }
    }
  >,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, confirmacao }) => confirmarLimiteLegal(id, confirmacao),
    onSuccess: (data, variables) => {
      // Atualiza cache da alteração
      queryClient.setQueryData(
        alteracoesContratuaisKeys.detail(variables.id),
        data,
      )

      // Invalida listas
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.lists(),
      })

      if (variables.confirmacao.confirmado) {
        toast.success('Limite legal confirmado com sucesso!')
      } else {
        toast.info('Alteração contratual cancelada')
      }
    },
    onError: (error) => {
      toast.error('Erro ao processar confirmação', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook para atualizar alteração contratual
 */
export function useAtualizarAlteracaoContratual(
  options?: UseMutationOptions<
    AlteracaoContratualResponse,
    Error,
    { id: string; dados: Partial<AlteracaoContratualForm> }
  >,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dados }) => atualizarAlteracaoContratual(id, dados),
    onSuccess: (data, variables) => {
      // Atualiza cache
      queryClient.setQueryData(
        alteracoesContratuaisKeys.detail(variables.id),
        data,
      )

      // Invalida listas
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.lists(),
      })

      toast.success('Alteração atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar alteração', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook para excluir alteração contratual
 */
export function useExcluirAlteracaoContratual(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: excluirAlteracaoContratual,
    onSuccess: (_, id) => {
      // Remove do cache
      queryClient.removeQueries({
        queryKey: alteracoesContratuaisKeys.detail(id),
      })

      // Invalida listas
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.lists(),
      })

      toast.success('Alteração contratual excluída com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao excluir alteração', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook para submeter alteração para aprovação
 */
export function useSubmeterParaAprovacao(
  options?: UseMutationOptions<
    AlteracaoContratualResponse,
    Error,
    { id: string; dados: { comentarios?: string; documentosAnexos?: string[] } }
  >,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dados }) => submeterParaAprovacao(id, dados),
    onSuccess: (data, variables) => {
      // Atualiza cache
      queryClient.setQueryData(
        alteracoesContratuaisKeys.detail(variables.id),
        data,
      )

      // Invalida listas e workflow
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.workflow(variables.id),
      })

      toast.success('Alteração submetida para aprovação!')
    },
    onError: (error) => {
      toast.error('Erro ao submeter alteração', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook para aprovar alteração contratual
 */
export function useAprovarAlteracao(
  options?: UseMutationOptions<
    AlteracaoContratualResponse,
    Error,
    { id: string; dados: { comentarios?: string; condicoes?: string[] } }
  >,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dados }) => aprovarAlteracao(id, dados),
    onSuccess: (data, variables) => {
      // Atualiza cache
      queryClient.setQueryData(
        alteracoesContratuaisKeys.detail(variables.id),
        data,
      )

      // Invalida queries relacionadas
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.workflow(variables.id),
      })

      toast.success('Alteração contratual aprovada!')
    },
    onError: (error) => {
      toast.error('Erro ao aprovar alteração', {
        description: error.message,
      })
    },
    ...options,
  })
}

/**
 * Hook para rejeitar alteração contratual
 */
export function useRejeitarAlteracao(
  options?: UseMutationOptions<
    AlteracaoContratualResponse,
    Error,
    { id: string; dados: { motivo: string; comentarios?: string } }
  >,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dados }) => rejeitarAlteracao(id, dados),
    onSuccess: (data, variables) => {
      // Atualiza cache
      queryClient.setQueryData(
        alteracoesContratuaisKeys.detail(variables.id),
        data,
      )

      // Invalida queries relacionadas
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: alteracoesContratuaisKeys.workflow(variables.id),
      })

      toast.success('Alteração contratual rejeitada')
    },
    onError: (error) => {
      toast.error('Erro ao rejeitar alteração', {
        description: error.message,
      })
    },
    ...options,
  })
}

// ========== HOOKS COMPOSTOS ==========

/**
 * Hook composto para gerenciar estados de uma alteração específica
 */
export function useAlteracaoContratualCompleta(id: string) {
  const alteracao = useAlteracaoContratual(id)
  const workflow = useWorkflowStatus(id, { enabled: !!id && !!alteracao.data })
  const documentos = useDocumentosAlteracao(id, {
    enabled: !!id && !!alteracao.data,
  })

  return {
    alteracao,
    workflow,
    documentos,
    isLoading:
      alteracao.isLoading || workflow.isLoading || documentos.isLoading,
    isError: alteracao.isError || workflow.isError || documentos.isError,
    error: alteracao.error ?? workflow.error ?? documentos.error,
  }
}

/**
 * Hook para gerenciar dashboard de alterações de um contrato
 */
export function useAlteracoesDashboard(contratoId: string) {
  const alteracoesPendentes = useAlteracoesPendentes(contratoId)
  const alteracoesAtivas = useAlteracoesAtivas(contratoId)
  const todasAlteracoes = useAlteracoesContratuaisList(contratoId, {
    tamanhoPagina: 5,
    pagina: 1,
  })

  return {
    pendentes: alteracoesPendentes,
    ativas: alteracoesAtivas,
    recentes: todasAlteracoes,
    isLoading:
      alteracoesPendentes.isLoading ||
      alteracoesAtivas.isLoading ||
      todasAlteracoes.isLoading,
    isError:
      alteracoesPendentes.isError ||
      alteracoesAtivas.isError ||
      todasAlteracoes.isError,
  }
}
