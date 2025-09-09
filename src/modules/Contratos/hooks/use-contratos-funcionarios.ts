/**
 * ==========================================
 * HOOKS REACT QUERY PARA FUNCIONÁRIOS DO CONTRATO
 * ==========================================
 * Hooks para mutations de funcionários vinculados a contratos
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  adicionarFuncionarioContrato,
  removerFuncionarioContrato,
  substituirFuncionarioContrato,
  validarSubstituicaoFuncionario,
  getTipoGerenciaLabel,
  type AdicionarFuncionarioPayload
} from '../services/contratos-funcionarios-service'
import { contratoKeys } from '../lib/query-keys'

// ========== INTERFACES ==========

interface SubstituirFuncionarioPayload {
  contratoId: string
  funcionarioAntigoId: string
  funcionarioNovoId: string
  funcionarioNovoNome: string // Para exibição no toast
  tipoGerencia: 1 | 2
  observacoes?: string
}

interface AdicionarFuncionarioPayloadCompleto extends AdicionarFuncionarioPayload {
  contratoId: string
  funcionarioNome?: string // Para exibição no toast
}

interface RemoverFuncionarioPayload {
  contratoId: string
  funcionarioId: string
  funcionarioNome?: string // Para exibição no toast
  tipoGerencia: 1 | 2
}

// ========== HOOKS ==========

/**
 * Hook para adicionar funcionário ao contrato
 */
export function useAdicionarFuncionarioContrato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AdicionarFuncionarioPayloadCompleto) => {
      const { contratoId, funcionarioNome, ...dados } = payload
      return await adicionarFuncionarioContrato(contratoId, dados)
    },

    onMutate: async (payload) => {
      const loadingToast = toast.loading(
        `Adicionando ${payload.funcionarioNome || 'funcionário'} como ${getTipoGerenciaLabel(payload.tipoGerencia).toLowerCase()}...`
      )
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context?.loadingToast) {
        toast.success(
          `${getTipoGerenciaLabel(variables.tipoGerencia)} adicionado com sucesso`,
          {
            id: context.loadingToast,
            description: variables.funcionarioNome || 'Funcionário vinculado ao contrato'
          }
        )
      }

      // Invalidar queries relacionadas ao contrato
      queryClient.invalidateQueries({
        queryKey: contratoKeys.detail(variables.contratoId)
      })
      queryClient.invalidateQueries({
        queryKey: contratoKeys.all
      })
    },

    onError: (error, variables, context) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (context?.loadingToast) {
        toast.error(
          `Erro ao adicionar ${getTipoGerenciaLabel(variables.tipoGerencia).toLowerCase()}`,
          {
            id: context.loadingToast,
            description: errorMessage
          }
        )
      }
    }
  })
}

/**
 * Hook para remover funcionário do contrato
 */
export function useRemoverFuncionarioContrato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RemoverFuncionarioPayload) => {
      const { contratoId, funcionarioId, tipoGerencia } = payload
      return await removerFuncionarioContrato(contratoId, funcionarioId, tipoGerencia)
    },

    onMutate: async (payload) => {
      const loadingToast = toast.loading(
        `Removendo ${payload.funcionarioNome || 'funcionário'} do contrato...`
      )
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context?.loadingToast) {
        toast.success(
          `${getTipoGerenciaLabel(variables.tipoGerencia)} removido com sucesso`,
          {
            id: context.loadingToast,
            description: `${variables.funcionarioNome || 'Funcionário'} não está mais vinculado ao contrato`
          }
        )
      }

      // Invalidar queries relacionadas ao contrato
      queryClient.invalidateQueries({
        queryKey: contratoKeys.detail(variables.contratoId)
      })
      queryClient.invalidateQueries({
        queryKey: contratoKeys.all
      })
    },

    onError: (error, variables, context) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (context?.loadingToast) {
        toast.error(
          `Erro ao remover ${getTipoGerenciaLabel(variables.tipoGerencia).toLowerCase()}`,
          {
            id: context.loadingToast,
            description: errorMessage
          }
        )
      }
    }
  })
}

/**
 * Hook para substituir funcionário do contrato
 * Esta é a operação principal que combina remoção + adição
 */
export function useSubstituirFuncionarioContrato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SubstituirFuncionarioPayload) => {
      // Validar dados antes da operação
      const validacao = validarSubstituicaoFuncionario(
        payload.funcionarioAntigoId,
        payload.funcionarioNovoId,
        payload.tipoGerencia
      )

      if (!validacao.valido) {
        throw new Error(validacao.erro)
      }

      const { contratoId, funcionarioAntigoId, funcionarioNovoId, tipoGerencia, observacoes } = payload

      return await substituirFuncionarioContrato(
        contratoId,
        funcionarioAntigoId,
        funcionarioNovoId,
        tipoGerencia,
        observacoes
      )
    },

    onMutate: async (payload) => {
      const tipoLabel = getTipoGerenciaLabel(payload.tipoGerencia).toLowerCase()
      const loadingToast = toast.loading(
        `Substituindo ${tipoLabel}...`,
        {
          description: `Alterando para ${payload.funcionarioNovoNome}`
        }
      )
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context?.loadingToast) {
        toast.success(
          `${getTipoGerenciaLabel(variables.tipoGerencia)} substituído com sucesso`,
          {
            id: context.loadingToast,
            description: `${variables.funcionarioNovoNome} agora é o novo responsável`
          }
        )
      }

      // Invalidar queries relacionadas ao contrato
      queryClient.invalidateQueries({
        queryKey: contratoKeys.detail(variables.contratoId)
      })
      queryClient.invalidateQueries({
        queryKey: contratoKeys.all
      })
    },

    onError: (error, variables, context) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (context?.loadingToast) {
        toast.error(
          `Erro ao substituir ${getTipoGerenciaLabel(variables.tipoGerencia).toLowerCase()}`,
          {
            id: context.loadingToast,
            description: errorMessage
          }
        )
      }
    }
  })
}

// ========== HOOK HELPER ==========

/**
 * Hook que retorna todos os mutations de funcionários
 * Útil para usar em componentes que precisam de múltiplas operações
 */
export function useContratosFuncionarios() {
  const adicionarMutation = useAdicionarFuncionarioContrato()
  const removerMutation = useRemoverFuncionarioContrato()
  const substituirMutation = useSubstituirFuncionarioContrato()

  return {
    adicionar: adicionarMutation,
    remover: removerMutation,
    substituir: substituirMutation,
    
    // Estados agregados
    isLoading: adicionarMutation.isPending || removerMutation.isPending || substituirMutation.isPending,
    hasError: adicionarMutation.isError || removerMutation.isError || substituirMutation.isError,
    
    // Reset de todos os mutations
    reset: () => {
      adicionarMutation.reset()
      removerMutation.reset()
      substituirMutation.reset()
    }
  }
}
