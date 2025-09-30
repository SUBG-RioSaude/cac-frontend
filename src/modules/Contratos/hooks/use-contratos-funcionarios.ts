/**
 * ==========================================
 * HOOKS REACT QUERY PARA FUNCIONÁRIOS DO CONTRATO
 * ==========================================
 * Hooks para mutations de funcionários vinculados a contratos
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { contratoKeys } from '../lib/query-keys'
import {
  adicionarFuncionarioContrato,
  removerFuncionarioContrato,
  substituirFuncionarioContrato,
  listarFuncionariosContrato,
  validarSubstituicaoFuncionario,
  getTipoGerenciaLabel,
  type AdicionarFuncionarioPayload,
} from '../services/contratos-funcionarios-service'
import type { ContratoFuncionario } from '../types/contrato'

// ========== INTERFACES ==========

interface SubstituirFuncionarioPayload {
  contratoId: string
  funcionarioAntigoId: string
  funcionarioNovoId: string
  funcionarioNovoNome: string // Para exibição no toast
  tipoGerencia: 1 | 2
  dataInicio?: string // ISO date (YYYY-MM-DD)
  observacoes?: string
}

interface AdicionarFuncionarioPayloadCompleto
  extends AdicionarFuncionarioPayload {
  contratoId: string
  funcionarioNome?: string // Para exibição no toast
}

interface RemoverFuncionarioPayload {
  contratoId: string
  funcionarioId: string
  funcionarioNome?: string // Para exibição no toast
  tipoGerencia: 1 | 2
}

// ========== UTILITÁRIOS ==========

/**
 * Detecta se o erro é um conflito de período baseado na mensagem
 */
function isConflitoPeriodoError(errorMessage: string): boolean {
  const messageLower = errorMessage.toLowerCase()
  return (
    messageLower.includes('se sobrepõe') ||
    messageLower.includes('sobrepor') ||
    (messageLower.includes('período') && messageLower.includes('conflito'))
  )
}

/**
 * Cria toast de erro personalizado baseado no tipo de erro
 */
function createErrorToast(
  error: unknown,
  tipoGerencia: 1 | 2,
  operacao: 'adicionar' | 'remover' | 'substituir',
  toastId?: string | number,
) {
  const errorMessage =
    error instanceof Error ? error.message : 'Erro desconhecido'
  const isConflitoPeriodo = isConflitoPeriodoError(errorMessage)

  const toastConfig = {
    id: toastId,
    description: isConflitoPeriodo
      ? `${errorMessage}. Verifique as datas e tente novamente.`
      : errorMessage,
  }

  if (isConflitoPeriodo) {
    toast.error('Conflito de Período', toastConfig)
  } else {
    toast.error(
      `Erro ao ${operacao} ${getTipoGerenciaLabel(tipoGerencia).toLowerCase()}`,
      toastConfig,
    )
  }
}

// ========== HOOKS ==========

/**
 * Hook para adicionar funcionário ao contrato
 */
export function useAdicionarFuncionarioContrato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AdicionarFuncionarioPayloadCompleto) => {
      const { contratoId, funcionarioNome: _funcionarioNome, ...dados } = payload
      return await adicionarFuncionarioContrato(contratoId, dados)
    },

    onMutate: (payload) => {
      const loadingToast = toast.loading(
        `Adicionando ${payload.funcionarioNome ?? 'funcionário'} como ${getTipoGerenciaLabel(payload.tipoGerencia).toLowerCase()}...`,
      )
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context.loadingToast) {
        toast.success(
          `${getTipoGerenciaLabel(variables.tipoGerencia)} adicionado com sucesso`,
          {
            id: context.loadingToast,
            description:
              variables.funcionarioNome ?? 'Funcionário vinculado ao contrato',
          },
        )
      }

      // Invalidar queries relacionadas ao contrato
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.detail(variables.contratoId),
      })
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.all,
      })
      // Invalidar especificamente as queries de funcionários
      void queryClient.invalidateQueries({
        queryKey: ['contrato-funcionarios', variables.contratoId],
      })
      // Invalidar queries de histórico de funcionários
      void queryClient.invalidateQueries({
        queryKey: ['historico-funcionarios', variables.contratoId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['funcionarios-ativos-em', variables.contratoId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['periodos-funcionario', variables.contratoId],
      })
    },

    onError: (error, variables, context) => {
      if (context.loadingToast) {
        createErrorToast(
          error,
          variables.tipoGerencia,
          'adicionar',
          context.loadingToast,
        )
      }
    },
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
      return await removerFuncionarioContrato(
        contratoId,
        funcionarioId,
        tipoGerencia,
      )
    },

    onMutate: (payload) => {
      const loadingToast = toast.loading(
        `Removendo ${payload.funcionarioNome ?? 'funcionário'} do contrato...`,
      )
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context.loadingToast) {
        toast.success(
          `${getTipoGerenciaLabel(variables.tipoGerencia)} removido com sucesso`,
          {
            id: context.loadingToast,
            description: `${variables.funcionarioNome ?? 'Funcionário'} não está mais vinculado ao contrato`,
          },
        )
      }

      // Invalidar queries relacionadas ao contrato
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.detail(variables.contratoId),
      })
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.all,
      })
      // Invalidar especificamente as queries de funcionários
      void queryClient.invalidateQueries({
        queryKey: ['contrato-funcionarios', variables.contratoId],
      })
      // Invalidar queries de histórico de funcionários
      void queryClient.invalidateQueries({
        queryKey: ['historico-funcionarios', variables.contratoId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['funcionarios-ativos-em', variables.contratoId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['periodos-funcionario', variables.contratoId],
      })
    },

    onError: (error, variables, context) => {
      if (context.loadingToast) {
        createErrorToast(
          error,
          variables.tipoGerencia,
          'remover',
          context.loadingToast,
        )
      }
    },
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
        payload.tipoGerencia,
      )

      if (!validacao.valido) {
        throw new Error(validacao.erro)
      }

      const {
        contratoId,
        funcionarioAntigoId,
        funcionarioNovoId,
        tipoGerencia,
        observacoes,
        dataInicio,
      } = payload

      return await substituirFuncionarioContrato(
        contratoId,
        funcionarioAntigoId,
        funcionarioNovoId,
        tipoGerencia,
        observacoes,
        dataInicio,
      )
    },

    onMutate: (payload) => {
      const tipoLabel = getTipoGerenciaLabel(payload.tipoGerencia).toLowerCase()
      const loadingToast = toast.loading(`Substituindo ${tipoLabel}...`, {
        description: `Alterando para ${payload.funcionarioNovoNome}`,
      })
      return { loadingToast }
    },

    onSuccess: (_data, variables, context) => {
      if (context.loadingToast) {
        toast.success(
          `${getTipoGerenciaLabel(variables.tipoGerencia)} substituído com sucesso`,
          {
            id: context.loadingToast,
            description: `${variables.funcionarioNovoNome} agora é o novo responsável`,
          },
        )
      }

      // Invalidar queries relacionadas ao contrato
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.detail(variables.contratoId),
      })
      void queryClient.invalidateQueries({
        queryKey: contratoKeys.all,
      })
      // Invalidar especificamente as queries de funcionários
      void queryClient.invalidateQueries({
        queryKey: ['contrato-funcionarios', variables.contratoId],
      })
      // Invalidar queries de histórico de funcionários
      void queryClient.invalidateQueries({
        queryKey: ['historico-funcionarios', variables.contratoId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['funcionarios-ativos-em', variables.contratoId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['periodos-funcionario', variables.contratoId],
      })
    },

    onError: (error, variables, context) => {
      if (context.loadingToast) {
        createErrorToast(
          error,
          variables.tipoGerencia,
          'substituir',
          context.loadingToast,
        )
      }
    },
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
    isLoading:
      adicionarMutation.isPending ||
      removerMutation.isPending ||
      substituirMutation.isPending,
    hasError:
      adicionarMutation.isError ||
      removerMutation.isError ||
      substituirMutation.isError,

    // Reset de todos os mutations
    reset: () => {
      adicionarMutation.reset()
      removerMutation.reset()
      substituirMutation.reset()
    },
  }
}

// ========== HOOKS DE QUERY ==========

/**
 * Hook para listar funcionários de um contrato
 * Otimizado para usar endpoint único em vez de múltiplas requests
 */
export function useContratoFuncionarios(
  contratoId: string,
  tipoGerencia?: 1 | 2,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['contrato-funcionarios', contratoId, tipoGerencia],
    queryFn: () => listarFuncionariosContrato(contratoId, tipoGerencia),
    enabled: !!contratoId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    select: (data: unknown[]): ContratoFuncionario[] => {
      const safeString = (value: unknown): string | null => {
        if (value === null || value === undefined) return null
        if (typeof value === 'string') return value
        if (typeof value === 'number' || typeof value === 'boolean') return String(value)
        return null // For objects, return null instead of '[object Object]'
      }

      // Mapear dados da API para interface padronizada
      return data.map((item: unknown) => {
        const typedItem = item as Record<string, unknown>
        return {
          id: String(typedItem.id),
          contratoId: String(typedItem.contratoId),
          funcionarioId: String(typedItem.funcionarioId),
          tipoGerencia: Number(typedItem.tipoGerencia),
          tipoGerenciaDescricao: String(typedItem.tipoGerenciaDescricao),
          dataInicio: String(typedItem.dataInicio),
          dataFim: safeString(typedItem.dataFim),
          motivoAlteracao: Number(typedItem.motivoAlteracao),
          motivoAlteracaoDescricao: String(typedItem.motivoAlteracaoDescricao),
          documentoDesignacao: safeString(typedItem.documentoDesignacao),
          observacoes: safeString(typedItem.observacoes),
          estaAtivo: Boolean(typedItem.estaAtivo),
          diasNaFuncao: Number(typedItem.diasNaFuncao),
          periodoFormatado: String(typedItem.periodoFormatado),
          funcionarioNome: String(typedItem.funcionarioNome),
          funcionarioMatricula: String(typedItem.funcionarioMatricula),
          funcionarioCargo: String(typedItem.funcionarioCargo),
          dataCadastro: String(typedItem.dataCadastro),
          dataAtualizacao: safeString(typedItem.dataAtualizacao) ?? '',
          ativo: Boolean(typedItem.ativo),
        }
      })
    },
  })
}

/**
 * Hook para listar fiscais de um contrato
 */
export function useContratoFiscais(
  contratoId: string,
  options?: { enabled?: boolean },
) {
  return useContratoFuncionarios(contratoId, 1, options)
}

/**
 * Hook para listar gestores de um contrato
 */
export function useContratoGestores(
  contratoId: string,
  options?: { enabled?: boolean },
) {
  return useContratoFuncionarios(contratoId, 2, options)
}

/**
 * Hook para listar todos os funcionários (fiscais + gestores) de um contrato
 */
export function useContratoTodosFuncionarios(
  contratoId: string,
  options?: { enabled?: boolean },
) {
  return useContratoFuncionarios(contratoId, undefined, options)
}
