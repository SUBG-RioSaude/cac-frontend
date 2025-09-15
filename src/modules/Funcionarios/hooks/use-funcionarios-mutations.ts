/**
 * Hooks React Query para Funcionários - Mutations
 * Operações de criação com toast feedback e invalidação automática
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { criarFuncionario } from '@/modules/Funcionarios/services/funcionarios-service'
import { funcionarioKeys } from '@/modules/Funcionarios/lib/query-keys'
import type { FuncionarioApi, FuncionarioCreateApi } from '@/modules/Funcionarios/types/funcionario-api'

export function useCreateFuncionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: FuncionarioCreateApi): Promise<FuncionarioApi> => {
      return await criarFuncionario(data)
    },
    onMutate: async () => {
      const loadingToast = toast.loading('Cadastrando funcionário...')
      return { loadingToast }
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.loadingToast) toast.dismiss(context.loadingToast)
      // Toast removido - agora o feedback é via modal no formulário
      const invalidate = funcionarioKeys.invalidateOnCreate()
      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
    onError: (error, _variables, context) => {
      if (context?.loadingToast) toast.dismiss(context.loadingToast)
      console.error('Erro ao cadastrar funcionário:', error)
      toast.error('Erro ao cadastrar funcionário', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

