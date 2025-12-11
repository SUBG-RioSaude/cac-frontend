/**
 * ==========================================
 * HOOK: USE-HISTORICO-RELATORIOS
 * ==========================================
 * Hooks para gerenciamento de histórico de relatórios
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  RelatorioHistoricoListItem,
  FiltrosHistorico,
  EstatisticasHistorico,
  ResultadoOperacaoHistorico,
} from '../types/historico'
import {
  listarHistorico,
  buscarRelatorio,
  baixarDoHistorico,
  excluirDoHistorico,
  limparHistorico,
  obterEstatisticasHistorico,
} from '../services/historico-service'

// ========== KEYS DE QUERY ==========

const QUERY_KEYS = {
  historico: (filtros?: FiltrosHistorico) => ['historico-relatorios', filtros] as const,
  estatisticas: () => ['historico-estatisticas'] as const,
  relatorio: (id: string) => ['historico-relatorio', id] as const,
}

// ========== HOOK DE LISTAGEM ==========

/**
 * Hook para listar histórico de relatórios com filtros
 */
export const useHistoricoRelatorios = (filtros?: FiltrosHistorico) => {
  return useQuery<RelatorioHistoricoListItem[], Error>({
    queryKey: QUERY_KEYS.historico(filtros),
    queryFn: () => listarHistorico(filtros),
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 1,
  })
}

// ========== HOOK DE ESTATÍSTICAS ==========

/**
 * Hook para obter estatísticas do histórico
 */
export const useEstatisticasHistorico = () => {
  return useQuery<EstatisticasHistorico, Error>({
    queryKey: QUERY_KEYS.estatisticas(),
    queryFn: obterEstatisticasHistorico,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 1,
  })
}

// ========== HOOK DE BUSCAR RELATÓRIO ==========

/**
 * Hook para buscar um relatório específico do histórico
 */
export const useBuscarRelatorio = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.relatorio(id),
    queryFn: () => buscarRelatorio(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  })
}

// ========== HOOK DE BAIXAR DO HISTÓRICO ==========

interface OpcoesBaixar {
  onSuccess?: (resultado: ResultadoOperacaoHistorico) => void
  onError?: (erro: Error) => void
}

/**
 * Hook para baixar relatório do histórico
 */
export const useBaixarDoHistorico = (opcoes?: OpcoesBaixar) => {
  return useMutation<ResultadoOperacaoHistorico, Error, string>({
    mutationFn: (id: string) => baixarDoHistorico(id),
    onSuccess: (resultado) => {
      if (resultado.sucesso) {
        toast.success('Relatório baixado com sucesso!')
        opcoes?.onSuccess?.(resultado)
      } else {
        toast.error(resultado.mensagem || 'Erro ao baixar relatório')
      }
    },
    onError: (erro) => {
      toast.error(erro.message || 'Erro ao baixar relatório')
      opcoes?.onError?.(erro)
    },
  })
}

// ========== HOOK DE EXCLUSÃO ==========

interface OpcoesExcluir {
  onSuccess?: (resultado: ResultadoOperacaoHistorico) => void
  onError?: (erro: Error) => void
}

/**
 * Hook para excluir relatório do histórico
 */
export const useExcluirRelatorio = (opcoes?: OpcoesExcluir) => {
  const queryClient = useQueryClient()

  return useMutation<ResultadoOperacaoHistorico, Error, string>({
    mutationFn: (id: string) => excluirDoHistorico(id),
    onSuccess: (resultado) => {
      if (resultado.sucesso) {
        // Invalida todas as queries de histórico
        queryClient.invalidateQueries({
          queryKey: ['historico-relatorios'],
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.estatisticas(),
        })

        toast.success('Relatório excluído com sucesso!')
        opcoes?.onSuccess?.(resultado)
      } else {
        toast.error(resultado.mensagem || 'Erro ao excluir relatório')
      }
    },
    onError: (erro) => {
      toast.error(erro.message || 'Erro ao excluir relatório')
      opcoes?.onError?.(erro)
    },
  })
}

// ========== HOOK DE LIMPAR HISTÓRICO ==========

interface OpcoesLimpar {
  onSuccess?: (resultado: ResultadoOperacaoHistorico) => void
  onError?: (erro: Error) => void
}

/**
 * Hook para limpar todo o histórico
 */
export const useLimparHistorico = (opcoes?: OpcoesLimpar) => {
  const queryClient = useQueryClient()

  return useMutation<ResultadoOperacaoHistorico, Error, void>({
    mutationFn: () => limparHistorico(),
    onSuccess: (resultado) => {
      if (resultado.sucesso) {
        // Invalida todas as queries de histórico
        queryClient.invalidateQueries({
          queryKey: ['historico-relatorios'],
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.estatisticas(),
        })

        toast.success('Histórico limpo com sucesso!')
        opcoes?.onSuccess?.(resultado)
      } else {
        toast.error(resultado.mensagem || 'Erro ao limpar histórico')
      }
    },
    onError: (erro) => {
      toast.error(erro.message || 'Erro ao limpar histórico')
      opcoes?.onError?.(erro)
    },
  })
}

// ========== HOOKS DE UTILITÁRIO ==========

/**
 * Hook para invalidar cache do histórico manualmente
 */
export const useInvalidarHistorico = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({
      queryKey: ['historico-relatorios'],
    })
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.estatisticas(),
    })
  }
}

/**
 * Hook para prefetch de relatório específico
 */
export const usePrefetchRelatorio = () => {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.relatorio(id),
      queryFn: () => buscarRelatorio(id),
      staleTime: 1000 * 60 * 5,
    })
  }
}
