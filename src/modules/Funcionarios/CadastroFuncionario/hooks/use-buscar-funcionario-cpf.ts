import { useState, useCallback } from 'react'

import { getFuncionarioByCpf } from '@/modules/Funcionarios/services/funcionarios-service'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'
import { createServiceLogger } from '@/lib/logger'

const logger = createServiceLogger('buscar-funcionario-cpf')

interface BuscaFuncionarioState {
  funcionario: FuncionarioApi | null
  encontrado: boolean
  isLoading: boolean
  erro: string | null
}

/**
 * Hook para buscar funcionário por CPF
 *
 * O service getFuncionarioByCpf já implementa retry HTTP automático (3 tentativas).
 * Este hook apenas gerencia o estado da UI.
 *
 * @example
 * ```tsx
 * const { buscar, funcionario, encontrado, isLoading, reset } = useBuscarFuncionarioCpf()
 *
 * const handleBuscar = async () => {
 *   const resultado = await buscar('12345678901')
 *   if (resultado.encontrado) {
 *     // Funcionário encontrado, preencher formulário
 *   } else {
 *     // Não encontrado após 3 retries HTTP, mostrar formulário de cadastro manual
 *   }
 * }
 * ```
 */
export const useBuscarFuncionarioCpf = () => {
  const [state, setState] = useState<BuscaFuncionarioState>({
    funcionario: null,
    encontrado: false,
    isLoading: false,
    erro: null,
  })

  /**
   * Busca funcionário por CPF (limpo, apenas números)
   * O service internamente faz 3 tentativas HTTP antes de retornar erro
   */
  const buscar = useCallback(
    async (
      cpf: string,
    ): Promise<{ encontrado: boolean; funcionario: FuncionarioApi | null }> => {
      logger.info(
        { cpf: cpf.substring(0, 3) + '***' },
        'Iniciando busca por CPF (service fará 3 retries HTTP)',
      )

      setState((prev) => ({
        ...prev,
        isLoading: true,
        erro: null,
      }))

      try {
        // Service já faz 3 tentativas HTTP automaticamente
        const response = await getFuncionarioByCpf(cpf)

        if (response.encontrado && response.funcionario) {
          logger.info(
            {
              cpf: cpf.substring(0, 3) + '***',
              funcionarioId: response.funcionario.id,
            },
            'Funcionário encontrado',
          )

          setState((prev) => ({
            ...prev,
            funcionario: response.funcionario ?? null,
            encontrado: true,
            isLoading: false,
            erro: null,
          }))

          return { encontrado: true, funcionario: response.funcionario }
        } else {
          logger.warn(
            {
              cpf: cpf.substring(0, 3) + '***',
            },
            'Funcionário não encontrado após retries HTTP',
          )

          setState((prev) => ({
            ...prev,
            funcionario: null,
            encontrado: false,
            isLoading: false,
            erro:
              'Funcionário não encontrado. Por favor, preencha todos os dados manualmente.',
          }))

          return { encontrado: false, funcionario: null }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao buscar funcionário'

        logger.error(
          {
            cpf: cpf.substring(0, 3) + '***',
            erro: errorMessage,
          },
          'Erro na busca de funcionário',
        )

        setState((prev) => ({
          ...prev,
          funcionario: null,
          encontrado: false,
          isLoading: false,
          erro: errorMessage,
        }))

        return { encontrado: false, funcionario: null }
      }
    },
    [],
  )

  /**
   * Reseta o estado para permitir nova busca
   */
  const reset = useCallback(() => {
    logger.info({ action: 'reset' }, 'Resetando estado de busca')
    setState({
      funcionario: null,
      encontrado: false,
      isLoading: false,
      erro: null,
    })
  }, [])

  return {
    // Estado
    funcionario: state.funcionario,
    encontrado: state.encontrado,
    isLoading: state.isLoading,
    erro: state.erro,

    // Ações
    buscar,
    reset,
  }
}
