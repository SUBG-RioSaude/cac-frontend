import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  UsuarioPermissaoSistemaRequest,
  AtualizarPermissoesRequest,
} from '@/types/permissoes'

import { permissoesCadastroService } from '../services/permissoes-cadastro-service'

/**
 * Hook para atribuir permissão a um usuário em um sistema
 *
 * @example
 * ```tsx
 * const atribuirPermissao = useAtribuirPermissao()
 *
 * const handleAtribuir = async () => {
 *   atribuirPermissao.mutate({
 *     usuarioId: '123-456-789',
 *     sistemaId: '987-654-321',
 *     permissaoId: 1
 *   }, {
 *     onSuccess: () => {
 *       // Mostrar modal de sucesso
 *     }
 *   })
 * }
 * ```
 */
export const useAtribuirPermissao = () => {
  return useMutation({
    mutationFn: async (request: UsuarioPermissaoSistemaRequest) => {
      const response = await permissoesCadastroService.atribuirPermissao(
        request,
      )

      if (!response.sucesso) {
        throw new Error(
          response.mensagem ?? 'Erro ao atribuir permissão ao usuário',
        )
      }

      return response
    },
    onSuccess: (data) => {
      toast.success('Permissão atribuída com sucesso!')
      return data
    },
    onError: (erro) => {
      const errorMessage =
        erro instanceof Error ? erro.message : 'Erro ao atribuir permissão'
      toast.error(errorMessage)
    },
  })
}

/**
 * Hook para atualizar permissões de um usuário (múltiplas permissões)
 * Novo hook da API v1.1 - usa PUT /api/usuarios/{usuarioId}/permissoes
 * Remove todas as permissões antigas e adiciona as novas
 *
 * @example
 * ```tsx
 * const atualizarPermissoes = useAtualizarPermissoes()
 *
 * const handleAtualizar = async () => {
 *   atualizarPermissoes.mutate({
 *     usuarioId: '123-456-789',
 *     payload: {
 *       permissoes: [
 *         { sistemaId: '987-654-321', permissaoId: 1 },
 *         { sistemaId: '987-654-321', permissaoId: 2 }
 *       ]
 *     }
 *   }, {
 *     onSuccess: () => {
 *       // Mostrar modal de sucesso
 *     }
 *   })
 * }
 * ```
 */
export const useAtualizarPermissoes = () => {
  return useMutation({
    mutationFn: async ({
      usuarioId,
      payload,
    }: {
      usuarioId: string
      payload: AtualizarPermissoesRequest
    }) => {
      const response = await permissoesCadastroService.atualizarPermissoes(
        usuarioId,
        payload,
      )

      if (!response.sucesso) {
        throw new Error(
          response.mensagem ?? 'Erro ao atualizar permissões do usuário',
        )
      }

      return response
    },
    onSuccess: (data) => {
      toast.success(
        `Permissões atualizadas com sucesso! Total: ${data.dados.quantidadePermissoes}`,
      )
      return data
    },
    onError: (erro) => {
      const errorMessage =
        erro instanceof Error ? erro.message : 'Erro ao atualizar permissões'
      toast.error(errorMessage)
    },
  })
}
