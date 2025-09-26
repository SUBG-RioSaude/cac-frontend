/**
 * Hooks de mutations para contratos
 * Integra operações CRUD com TanStack React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { executeWithFallback } from '@/lib/axios'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import { useToast } from '@/modules/Contratos/hooks/useToast'
import type {
  Contrato,
} from '@/modules/Contratos/types/contrato'
import { criarContrato, calcularPrazoMeses, converterDataParaISO, gerarNumeroContratoUnico } from '@/modules/Contratos/services/contratos-service'
import { 
  transformLegacyToUnidadesResponsaveis
} from '@/modules/Contratos/types/contrato'
import type {
  CriarUnidadeResponsavelPayload
} from '@/modules/Contratos/types/contrato'

// Tipos para as mutations

export interface CriarContratoData {
  numeroContrato?: string
  processoSei?: string
  processoRio?: string
  processoLegado?: string
  categoriaObjeto?: string
  descricaoObjeto?: string
  tipoContratacao?: string
  tipoContrato?: string
  unidadeDemandanteId?: string
  unidadeGestoraId?: string
  contratacao?: string
  vigenciaInicial: string
  vigenciaFinal: string
  prazoInicialMeses: number
  valorGlobal: number
  formaPagamento?: string
  tipoTermoReferencia?: string
  termoReferencia?: string
  vinculacaoPCA?: string
  empresaId: string
  ativo?: boolean
  unidadesVinculadas?: Array<{
    unidadeSaudeId: string
    valorAtribuido: number
    vigenciaInicialUnidade: string
    vigenciaFinalUnidade: string
    observacoes?: string
  }>
  documentos?: Array<{
    tipoDocumento: string
    urlDocumento: string
    dataEntrega: string
    observacoes?: string
  }>
  funcionarios?: Array<{
    funcionarioId: string
    tipoGerencia: 1 | 2 // 1=Gestor, 2=Fiscal
    observacoes?: string
  }>
  // NOVO: Array de unidades responsáveis (preferencial sobre campos únicos)
  unidadesResponsaveis?: CriarUnidadeResponsavelPayload[]
}

interface AtualizarContratoData extends Partial<CriarContratoData> {
  id: string
}

/**
 * Hook para criar contrato
 */
export function useCriarContrato() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  return useMutation({
    mutationFn: async (payload: CriarContratoData) => {
      // Debug: verificar payload original
      
      // Determinar se usar novo formato ou legado
      let unidadesResponsaveis: CriarUnidadeResponsavelPayload[] = []
      
      if (payload.unidadesResponsaveis && payload.unidadesResponsaveis.length > 0) {
        // Usar array fornecido diretamente
        unidadesResponsaveis = payload.unidadesResponsaveis
      } else if (payload.unidadeDemandanteId && payload.unidadeGestoraId) {
        // Converter campos legados para array
        unidadesResponsaveis = transformLegacyToUnidadesResponsaveis(
          payload.unidadeDemandanteId,
          payload.unidadeGestoraId
        )
      } else {
        throw new Error('É necessário fornecer unidadesResponsaveis ou unidadeDemandanteId/unidadeGestoraId')
      }
      
      // Preparar dados para API
      const payloadAPI = {
        // Campos obrigatórios
        numeroContrato: payload.numeroContrato || gerarNumeroContratoUnico(),
        categoriaObjeto: payload.categoriaObjeto || '',
        descricaoObjeto: payload.descricaoObjeto || '',
        tipoContratacao: payload.tipoContratacao || '',
        tipoContrato: payload.tipoContrato || '',
        // NOVO: Usar array de unidades responsáveis
        unidadesResponsaveis,
        contratacao: payload.contratacao || '',
        vigenciaInicial: converterDataParaISO(payload.vigenciaInicial),
        vigenciaFinal: converterDataParaISO(payload.vigenciaFinal),
        prazoInicialMeses: calcularPrazoMeses(payload.vigenciaInicial, payload.vigenciaFinal),
        valorGlobal: typeof payload.valorGlobal === 'string' 
          ? parseFloat((payload.valorGlobal as string).replace(/[^\d,]/g, '').replace(',', '.'))
          : payload.valorGlobal,
        formaPagamento: payload.formaPagamento || '',
        tipoTermoReferencia: payload.tipoTermoReferencia || '',
        termoReferencia: payload.termoReferencia || '',
        vinculacaoPCA: payload.vinculacaoPCA || '',
        empresaId: payload.empresaId,
        ativo: payload.ativo ?? true,
        // Campos opcionais
        processoSei: payload.processoSei,
        processoRio: payload.processoRio,
        processoLegado: payload.processoLegado,
        // Converter funcionários para formato da API
        funcionarios: (payload.funcionarios || []).map(func => ({
          funcionarioId: func.funcionarioId,
          tipoGerencia: func.tipoGerencia,
          observacoes: func.observacoes
        })),
        // Converter unidades vinculadas
        unidadesVinculadas: (payload.unidadesVinculadas || []).map(unidade => ({
          unidadeSaudeId: unidade.unidadeSaudeId,
          valorAtribuido: typeof unidade.valorAtribuido === 'string'
            ? parseFloat((unidade.valorAtribuido as string).replace(/[^\d,]/g, '').replace(',', '.'))
            : unidade.valorAtribuido,
          vigenciaInicialUnidade: converterDataParaISO(unidade.vigenciaInicialUnidade),
          vigenciaFinalUnidade: converterDataParaISO(unidade.vigenciaFinalUnidade),
          observacoes: unidade.observacoes
        }))
      }
      return await criarContrato(payloadAPI)
    },
    onSuccess: () => {
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: contratoKeys.all })
      queryClient.invalidateQueries({ queryKey: contratoKeys.list() })
      
      // Mostrar mensagem de sucesso
      success('Contrato criado com sucesso!')
      
      // Redirecionar para a lista de contratos
      navigate('/contratos')
    },
    onError: (error: Error & { response?: { data?: { message?: string }; status?: number }; status?: number }) => {
      console.error('❌ [HOOK] Erro ao criar contrato:', error)
      
      // Extrair mensagem específica do erro
      let errorMessage = 'Erro ao criar contrato. Tente novamente.'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.status === 409) {
        errorMessage = 'Já existe um contrato com este número ou dados duplicados. Verifique os dados e tente novamente.'
      }
      
      // Mostrar mensagem de erro específica
      showError(errorMessage)
    }
  })
}

// Hook para atualizar contrato
export function useUpdateContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (data: AtualizarContratoData): Promise<Contrato> => {
      const { id, ...updateData } = data
      const response = await executeWithFallback<Contrato>({
        method: 'put',
        url: `/Contratos/${id}`,
        data: updateData
      })
      return response.data
    },

    onMutate: async (data) => {
      // Toast de loading
      const loadingToast = mutation.loading('Atualizando contrato')

      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(data.id) })

      // Snapshot dos dados atuais para rollback
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(data.id))

      // Optimistic update
      queryClient.setQueryData(contratoKeys.detail(data.id), (old: Contrato | undefined) => old ? ({
        ...old,
        ...data
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (data, _variables, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.success call
        
      }

      // Toast de sucesso
      mutation.success('Contrato atualizado', data.id)

      // Invalidar caches relevantes
      const invalidateKeys = contratoKeys.invalidateOnUpdate(data.id)
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },

    onError: (error, _variables, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.error call
      }

      // Rollback optimistic update
      if (context?.previousContrato) {
        queryClient.setQueryData(
          contratoKeys.detail(_variables.id), 
          context.previousContrato
        )
      }

      // Toast de erro
      mutation.error('atualizar contrato', error)
    }
  })
}

// Hook para deletar contrato (soft delete)
export function useDeleteContrato() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await executeWithFallback({
        method: 'delete',
        url: `/Contratos/${id}`
      })
    },

    onMutate: async (id) => {
      // Toast de loading
      const loadingToast = mutation.loading('Removendo contrato')

      // Cancelar queries para evitar conflitos
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })

      // Snapshot para rollback
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      return { previousContrato, loadingToast }
    },

    onSuccess: (_data, id, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.success call
      }

      // Toast de sucesso
      mutation.success('Contrato removido')

      // Invalidar caches
      const invalidateKeys = contratoKeys.invalidateOnDelete(id)
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Redirecionar para lista de contratos
      navigate('/contratos')
    },

    onError: (error, _id, context) => {
      // Dismiss loading toast - loadingToast is now just the toast ID
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.error call
      }

      // Toast de erro
      mutation.error('remover contrato', error)
    }
  })
}

// Hook para suspender contrato
export function useSuspendContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await executeWithFallback({
        method: 'patch',
        url: `/Contratos/${id}/suspender`
      })
    },

    onMutate: async (id) => {
      const loadingToast = mutation.loading('Suspendendo contrato')
      
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      queryClient.setQueryData(contratoKeys.detail(id), (old: Contrato | undefined) => old ? ({
        ...old,
        status: 'suspenso'
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (_data, _id, context) => {
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.success call
      }

      mutation.success('Contrato suspenso')

      // Invalidar listas para refletir mudança de status
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, _id, context) => {
      if (context?.loadingToast && typeof context.loadingToast === 'string') {
        // Toast is automatically dismissed by the mutation.error call
      }

      // Rollback
      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(_id), context.previousContrato)
      }

      mutation.error('suspender contrato', error)
    }
  })
}

// Hook para reativar contrato
export function useReactivateContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await executeWithFallback({
        method: 'patch',
        url: `/Contratos/${id}/reativar`
      })
    },

    onMutate: async (id) => {
      const loadingToast = mutation.loading('Reativando contrato')
      
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      queryClient.setQueryData(contratoKeys.detail(id), (old: Contrato | undefined) => old ? ({
        ...old,
        status: 'ativo'
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (_data, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      mutation.success('Contrato reativado')
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(_id), context.previousContrato)
      }

      mutation.error('reativar contrato', error)
    }
  })
}

// Hook para encerrar contrato
export function useEncerrarContrato() {
  const queryClient = useQueryClient()
  const { mutation } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await executeWithFallback({
        method: 'patch',
        url: `/Contratos/${id}/encerrar`
      })
    },

    onMutate: async (id) => {
      const loadingToast = mutation.loading('Encerrando contrato')
      
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })
      const previousContrato = queryClient.getQueryData(contratoKeys.detail(id))

      queryClient.setQueryData(contratoKeys.detail(id), (old: Contrato | undefined) => old ? ({
        ...old,
        status: 'encerrado'
      }) : old)

      return { previousContrato, loadingToast }
    },

    onSuccess: (_data, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      mutation.success('Contrato encerrado')
      queryClient.invalidateQueries({ queryKey: contratoKeys.lists() })
    },

    onError: (error, _id, context) => {
      if (context?.loadingToast) {
        // Toast is automatically dismissed by mutation success/error calls
      }

      if (context?.previousContrato) {
        queryClient.setQueryData(contratoKeys.detail(_id), context.previousContrato)
      }

      mutation.error('encerrar contrato', error)
    }
  })
}
