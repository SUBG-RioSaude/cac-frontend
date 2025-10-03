/**
 * Hooks React Query para Funcionários - Mutations
 * Operações de criação com toast feedback e invalidação automática
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { funcionarioKeys } from '@/modules/Funcionarios/lib/query-keys'
import { criarFuncionario } from '@/modules/Funcionarios/services/funcionarios-service'
import type {
  FuncionarioApi,
  FuncionarioCreateApi,
} from '@/modules/Funcionarios/types/funcionario-api'

export function useCreateFuncionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: FuncionarioCreateApi): Promise<FuncionarioApi> => {
      return await criarFuncionario(data)
    },
    onMutate: () => {
      const loadingToast = toast.loading('Cadastrando funcionário...')
      return { loadingToast }
    },
    onSuccess: (_data, _variables, context) => {
      if (context.loadingToast) toast.dismiss(context.loadingToast)
      // Toast removido - agora o feedback é via modal no formulário
      const invalidate = funcionarioKeys.invalidateOnCreate()
      invalidate.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (error, _variables, context) => {
      if (context?.loadingToast) toast.dismiss(context.loadingToast)
      // Error logged via toast notification
      toast.error('Erro ao cadastrar funcionário', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}
