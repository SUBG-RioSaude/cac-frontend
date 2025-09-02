import { useState, useEffect, useCallback } from 'react'
import { useToast } from './useToast'
import { 
  listarEmpenhosPorContrato,
  criarEmpenho,
  atualizarEmpenho,
  excluirEmpenho
} from '../services/empenhos-service'
import { getUnidadeById } from '@/modules/Unidades/services/unidades-service'
import type { Empenho, CriarEmpenhoPayload, AtualizarEmpenhoPayload } from '../types/contrato'

// Interfaces para os dados do contrato
interface UseEmpenhosWithRetryReturn {
  empenhos: Empenho[]
  carregando: boolean
  erro: string | null
  carregarEmpenhos: () => Promise<void>
  salvarEmpenho: (payload: CriarEmpenhoPayload) => Promise<void>
  atualizarEmpenho: (id: string, payload: AtualizarEmpenhoPayload) => Promise<void>
  excluirEmpenho: (id: string) => Promise<void>
  limparErro: () => void
}

const MAX_RETRIES = 5
const RETRY_DELAY = 1000 // 1 segundo entre tentativas

export function useEmpenhosWithRetry(contratoId: string): UseEmpenhosWithRetryReturn {
  const toast = useToast()
  const [empenhos, setEmpenhos] = useState<Empenho[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const executarComRetry = useCallback(async <T>(
    operacao: () => Promise<T>,
    operacaoNome: string
  ): Promise<T> => {
    for (let tentativa = 1; tentativa <= MAX_RETRIES; tentativa++) {
      try {
        console.log(`[RETRY] ${operacaoNome} - Tentativa ${tentativa}/${MAX_RETRIES}`)
        const resultado = await operacao()
        
        // Se chegou aqui, a operação foi bem-sucedida
        if (tentativa > 1) {
          console.log(`[RETRY] ✅ ${operacaoNome} - Sucesso na tentativa ${tentativa}`)
        }
        
        // Reset do contador de tentativas falhadas
        setErro(null)
        
        return resultado
      } catch (error) {
        const axiosError = error as { response?: { status?: number }, message?: string }
        
        console.warn(`[RETRY] ⚠️ ${operacaoNome} - Tentativa ${tentativa} falhou:`, {
          status: axiosError.response?.status,
          message: axiosError.message,
          tentativasRestantes: MAX_RETRIES - tentativa
        })

        // Verificar se é erro do servidor (5xx)
        const isServerError = axiosError.response?.status && axiosError.response.status >= 500
        const isNetworkError = !axiosError.response
        
        if (isServerError || isNetworkError) {
          // Se ainda há tentativas restantes, aguarda antes de tentar novamente
          if (tentativa < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * tentativa))
            continue
          }
        }
        
        // Se chegou aqui, é a última tentativa ou erro não é do servidor
        break
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    
    // Se foram 5 tentativas falhadas do servidor, retorna erro 500
    const erro500 = new Error('Erro 500: Servidor indisponível após múltiplas tentativas')
    setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
    throw erro500
  }, []) // Removida a dependência tentativasFalhadas

  const carregarEmpenhos = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)
      
      const dados = await executarComRetry(
        () => listarEmpenhosPorContrato(contratoId),
        'Carregar Empenhos'
      )
      
      setEmpenhos(dados)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao carregar empenhos:', error)
      
      if (errorMessage.includes('Erro 500')) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Erro 500: Servidor indisponível após múltiplas tentativas')
      } else {
        setErro('Não foi possível carregar os empenhos')
        toast.error('Não foi possível carregar os empenhos')
      }
    } finally {
      setCarregando(false)
    }
  }, [contratoId, executarComRetry, toast])

  const salvarEmpenho = useCallback(async (payload: CriarEmpenhoPayload) => {
    try {
      setErro(null)
      
      await executarComRetry(
        () => criarEmpenho(payload),
        'Criar Empenho'
      )
      
      toast.success('Empenho criado com sucesso')
      await carregarEmpenhos() // Recarrega a lista
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao salvar empenho:', error)
      
      if (errorMessage.includes('Erro 500')) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Erro 500: Servidor indisponível após múltiplas tentativas')
      } else {
        setErro('Não foi possível salvar o empenho')
        toast.error('Não foi possível salvar o empenho')
      }
      throw error
    }
  }, [executarComRetry, carregarEmpenhos, toast])

  const atualizarEmpenhoHandler = useCallback(async (id: string, payload: AtualizarEmpenhoPayload) => {
    try {
      setErro(null)
      
      await executarComRetry(
        () => atualizarEmpenho(id, payload),
        'Atualizar Empenho'
      )
      
      toast.success('Empenho atualizado com sucesso')
      await carregarEmpenhos() // Recarrega a lista
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao atualizar empenho:', error)
      
      if (errorMessage.includes('Erro 500')) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Erro 500: Servidor indisponível após múltiplas tentativas')
      } else {
        setErro('Não foi possível atualizar o empenho')
        toast.error('Não foi possível atualizar o empenho')
      }
      throw error
    }
  }, [executarComRetry, carregarEmpenhos, toast])

  const excluirEmpenhoHandler = useCallback(async (id: string) => {
    try {
      setErro(null)
      
      await executarComRetry(
        () => excluirEmpenho(id),
        'Excluir Empenho'
      )
      
      toast.success('Empenho excluído com sucesso')
      await carregarEmpenhos() // Recarrega a lista
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao excluir empenho:', error)
      
      if (errorMessage.includes('Erro 500')) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Erro 500: Servidor indisponível após múltiplas tentativas')
      } else {
        setErro('Não foi possível excluir o empenho')
        toast.error('Não foi possível excluir o empenho')
      }
      throw error
    }
  }, [executarComRetry, carregarEmpenhos, toast])

  const limparErro = useCallback(() => {
    setErro(null)
  }, [])

  // Carregar empenhos quando o componente montar
  useEffect(() => {
    if (contratoId) {
      carregarEmpenhos()
    }
  }, [contratoId, carregarEmpenhos])

  return {
    empenhos,
    carregando,
    erro,
    carregarEmpenhos,
    salvarEmpenho,
    atualizarEmpenho: atualizarEmpenhoHandler,
    excluirEmpenho: excluirEmpenhoHandler,
    limparErro
  }
}

// Hook para buscar nome da unidade por ID
export function useUnidadeNome(unidadeId: string) {
  const [nomeUnidade, setNomeUnidade] = useState<string>('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const buscarNomeUnidade = async (id: string) => {
      if (!id) return

      try {
        setCarregando(true)
        console.log('🔍 Buscando unidade por ID:', id)
        const unidade = await getUnidadeById(id)
        console.log('✅ Unidade encontrada:', unidade)
        setNomeUnidade(unidade.nome || 'Unidade não encontrada')
      } catch (error) {
        console.error('❌ Erro ao buscar nome da unidade:', error)
        setNomeUnidade('Unidade não encontrada')
      } finally {
        setCarregando(false)
      }
    }

    buscarNomeUnidade(unidadeId)
  }, [unidadeId])

  return { nomeUnidade, carregando }
}

// Função utilitária para extrair empenhos dos dados do contrato
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extrairEmpenhosDoContrato(contrato: any): Empenho[] {
  if (!contrato?.unidadesVinculadas) {
    return []
  }

  const empenhos: Empenho[] = []
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contrato.unidadesVinculadas.forEach((unidade: any) => {
    if (unidade.empenhos && Array.isArray(unidade.empenhos)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unidade.empenhos.forEach((empenho: any) => {
        empenhos.push({
          id: empenho.id,
          contratoId: contrato.id,
          unidadeSaudeId: unidade.unidadeSaudeId,
          nomeUnidade: unidade.unidadeSaudeId, // Usar ID como nome temporário
          numeroEmpenho: empenho.numeroEmpenho,
          valor: empenho.valor,
          dataEmpenho: empenho.dataEmpenho,
          observacao: empenho.observacao,
          ativo: empenho.ativo,
          dataCadastro: empenho.dataCadastro,
          dataAtualizacao: empenho.dataAtualizacao
        })
      })
    }
  })
  
  return empenhos
}
