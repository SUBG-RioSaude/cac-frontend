import { useState, useEffect, useCallback } from 'react'
import { useToast } from './useToast'
import { 
  listarEmpenhosPorContrato,
  criarEmpenho,
  atualizarEmpenho,
  excluirEmpenho
} from '../services/empenhos-service'
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

const MAX_RETRIES = 2 // Reduzir para apenas 2 tentativas
const RETRY_DELAY = 500 // Reduzir delay para 500ms

export function useEmpenhosWithRetry(contratoId: string): UseEmpenhosWithRetryReturn {
  const toast = useToast()
  const [empenhos, setEmpenhos] = useState<Empenho[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const executarComRetry = useCallback(async <T>(
    operacao: () => Promise<T>,
    operacaoNome: string
  ): Promise<T> => {
    let ultimoErro: unknown
    
    for (let tentativa = 1; tentativa <= MAX_RETRIES; tentativa++) {
      try {
        // Só logar se for retry (não primeira tentativa)
        if (tentativa > 1) {
          // Log do retry seria aqui
        }
        const resultado = await operacao()
        
        // Se chegou aqui, a operação foi bem-sucedida
        if (tentativa > 1) {
          // Log do sucesso após retry seria aqui
        }
        
        return resultado
      } catch (error) {
        ultimoErro = error
        const axiosError = error as { response?: { status?: number, data?: unknown }, message?: string }
        
        console.warn(`[RETRY] ⚠️ ${operacaoNome} - Tentativa ${tentativa} falhou:`, {
          status: axiosError.response?.status,
          message: axiosError.message,
          data: axiosError.response?.data,
          tentativasRestantes: MAX_RETRIES - tentativa
        })

        // Verificar se é erro do servidor (5xx) ou rede
        const isServerError = axiosError.response?.status && axiosError.response.status >= 500
        const isNetworkError = !axiosError.response
        
        // Erros 4xx (Bad Request, Unauthorized, etc.) não devem ser repetidos
        const isClientError = axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500
        
        if (isClientError) {
          break // Sai do loop imediatamente para erros 4xx
        }
        
        if ((isServerError || isNetworkError) && tentativa < MAX_RETRIES) {
          // Aguarda antes de tentar novamente apenas para erros 5xx ou rede
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * tentativa))
          continue
        }
        
        // Se chegou aqui, é a última tentativa
        break
      }
    }

    // Re-lança o último erro original
    throw ultimoErro
  }, []) // Removida a dependência tentativasFalhadas

  const carregarEmpenhos = useCallback(async () => {
    // Evitar requisições se contratoId está vazio
    if (!contratoId || contratoId.trim() === '') {
      setEmpenhos([])
      setCarregando(false)
      return
    }

    try {
      setCarregando(true)
      setErro(null)
      
      const dados = await executarComRetry(
        () => listarEmpenhosPorContrato(contratoId),
        'Carregar Empenhos'
      )
      
      setEmpenhos(dados)
    } catch (error) {
      console.error('Erro ao carregar empenhos:', error)
      
      // Extrair informações específicas do erro
      const axiosError = error as { response?: { status?: number, data?: unknown }, message?: string }
      
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data as { message?: string, error?: string } | undefined
        const errorMsg = errorData?.message || errorData?.error || 'Dados inválidos enviados para o servidor'
        setErro(`Erro 400: ${errorMsg}`)
        toast.error(`Erro de validação: ${errorMsg}`)
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Servidor indisponível. Tente novamente em alguns minutos.')
      } else {
        const errorData = axiosError.response?.data as { message?: string } | undefined
        const msgErro = errorData?.message || 'Não foi possível carregar os empenhos'
        setErro(msgErro)
        toast.error(msgErro)
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
      console.error('Erro ao salvar empenho:', error)
      
      // Extrair informações específicas do erro
      const axiosError = error as { response?: { status?: number, data?: unknown }, message?: string }
      
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data as { message?: string, error?: string } | undefined
        const errorMsg = errorData?.message || errorData?.error || 'Dados do empenho são inválidos'
        setErro(`Erro 400: ${errorMsg}`)
        toast.error(`Erro de validação: ${errorMsg}`)
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Servidor indisponível. Tente novamente em alguns minutos.')
      } else {
        const errorData = axiosError.response?.data as { message?: string } | undefined
        const msgErro = errorData?.message || 'Não foi possível salvar o empenho'
        setErro(msgErro)
        toast.error(msgErro)
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
      console.error('Erro ao atualizar empenho:', error)
      
      // Extrair informações específicas do erro
      const axiosError = error as { response?: { status?: number, data?: unknown }, message?: string }
      
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data as { message?: string, error?: string } | undefined
        const errorMsg = errorData?.message || errorData?.error || 'Dados do empenho são inválidos'
        setErro(`Erro 400: ${errorMsg}`)
        toast.error(`Erro de validação: ${errorMsg}`)
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Servidor indisponível. Tente novamente em alguns minutos.')
      } else {
        const errorData = axiosError.response?.data as { message?: string } | undefined
        const msgErro = errorData?.message || 'Não foi possível atualizar o empenho'
        setErro(msgErro)
        toast.error(msgErro)
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
      console.error('Erro ao excluir empenho:', error)
      
      // Extrair informações específicas do erro
      const axiosError = error as { response?: { status?: number, data?: unknown }, message?: string }
      
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data as { message?: string, error?: string } | undefined
        const errorMsg = errorData?.message || errorData?.error || 'Não foi possível excluir o empenho'
        setErro(`Erro 400: ${errorMsg}`)
        toast.error(`Erro de validação: ${errorMsg}`)
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
        toast.error('Servidor indisponível. Tente novamente em alguns minutos.')
      } else {
        const errorData = axiosError.response?.data as { message?: string } | undefined
        const msgErro = errorData?.message || 'Não foi possível excluir o empenho'
        setErro(msgErro)
        toast.error(msgErro)
      }
      throw error
    }
  }, [executarComRetry, carregarEmpenhos, toast])

  const limparErro = useCallback(() => {
    setErro(null)
  }, [])

  // Carregar empenhos quando o componente montar - APENAS uma vez por contratoId
  useEffect(() => {
    // Função local para evitar dependência circular  
    const carregarDados = async () => {
      if (!contratoId || contratoId.trim() === '') {
        setEmpenhos([])
        setCarregando(false)
        return
      }

      try {
        setCarregando(true)
        setErro(null)
        
        const dados = await executarComRetry(
          () => listarEmpenhosPorContrato(contratoId),
          'Carregar Empenhos'
        )
        
        setEmpenhos(dados)
      } catch (error) {
        console.error('Erro ao carregar empenhos:', error)
        
        const axiosError = error as { response?: { status?: number, data?: unknown }, message?: string }
        
        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data as { message?: string, error?: string } | undefined
          const errorMsg = errorData?.message || errorData?.error || 'Dados inválidos enviados para o servidor'
          setErro(`Erro 400: ${errorMsg}`)
          toast.error(`Erro de validação: ${errorMsg}`)
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          setErro('Erro 500: Servidor indisponível após múltiplas tentativas')
          toast.error('Servidor indisponível. Tente novamente em alguns minutos.')
        } else {
          const errorData = axiosError.response?.data as { message?: string } | undefined
          const msgErro = errorData?.message || 'Não foi possível carregar os empenhos'
          setErro(msgErro)
          toast.error(msgErro)
        }
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contratoId]) // Ignorar outras dependências intencionalmente para evitar loop

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
