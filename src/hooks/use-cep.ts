import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export interface EnderecoViaCEP {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

interface UseCEPOptions {
  onSuccess?: (endereco: EnderecoViaCEP) => void
  onError?: (error: string) => void
  debounceMs?: number
  minLoadingTime?: number
  errorMessage?: string
}

interface UseCEPReturn {
  buscarCEP: (cep: string) => Promise<void>
  endereco: EnderecoViaCEP | null
  isLoading: boolean
  error: string | null
  clearError: () => void
}

/**
 * Hook personalizado para busca de endereço via CEP
 * Implementa debounce, cache e tratamento de erros
 */
export function useCEP(options: UseCEPOptions = {}): UseCEPReturn {
  const {
    onSuccess,
    onError,
    debounceMs = 800,
    minLoadingTime = 1000,
    errorMessage,
  } = options

  const [endereco, setEndereco] = useState<EnderecoViaCEP | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  // Cache simples para evitar requisições desnecessárias
  const cacheRef = useRef<Map<string, EnderecoViaCEP>>(new Map())

  // Referência para controle de abort
  const abortControllerRef = useRef<AbortController | null>(null)

  // Timer para debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const limparCEP = useCallback(
    (cep: string): string => cep.replace(/\D/g, ''),
    [],
  )

  const validarCEP = useCallback(
    (cep: string): boolean => {
      const cepLimpo = limparCEP(cep)
      return /^\d{8}$/.test(cepLimpo) && !/^(\d)\1+$/.test(cepLimpo)
    },
    [limparCEP],
  )

  const buscarCEPInterno = useCallback(
    async (cepLimpo: string) => {
      // Cancela requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Cria novo controller para a requisição
      abortControllerRef.current = new AbortController()

      const startTime = Date.now()

      try {
        setIsLoading(true)
        setError(null)

        // Verifica cache primeiro
        const cached = cacheRef.current.get(cepLimpo)
        if (cached) {
          // Mesmo com cache, aguarda o tempo mínimo para mostrar loading
          const elapsed = Date.now() - startTime
          if (elapsed < minLoadingTime) {
            await new Promise((resolve) =>
              setTimeout(resolve, minLoadingTime - elapsed),
            )
          }

          setEndereco(cached)
          setIsLoading(false)
          onSuccess?.(cached)
          return
        }

        const url = `${import.meta.env.VITE_VIACEP_URL}/${cepLimpo}/json/`

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar CEP = ${errorMessage}`)
        }

        if (response.status === 500) {
          navigate('/500')
        }

        if (response.status === 401) {
          navigate('/401')
        }

        if (response.status === 400) {
          navigate('/400')
        }

        if (response.status === 503) {
          navigate('/503')
        }

        if (response.status === 403) {
          navigate('/403')
        }

        const data: EnderecoViaCEP = await response.json()

        if (data.erro) {
          throw new Error('CEP não encontrado')
        }

        // Aguarda tempo mínimo para mostrar loading
        const elapsed = Date.now() - startTime
        if (elapsed < minLoadingTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingTime - elapsed),
          )
        }

        // Salva no cache
        cacheRef.current.set(cepLimpo, data)

        setEndereco(data)
        onSuccess?.(data)
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            return // Requisição foi cancelada, não é erro
          }

          const errorMessage =
            err.message === 'CEP não encontrado'
              ? 'CEP não encontrado. Verifique se o CEP está correto.'
              : 'Erro ao buscar endereço. Tente novamente.'

          setError(errorMessage)
          onError?.(errorMessage)
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [onSuccess, onError, minLoadingTime, errorMessage, navigate],
  )

  const buscarCEP = useCallback(
    (cep: string) => {
      return new Promise<void>((resolve) => {
        // Limpa timer anterior
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        const cepLimpo = limparCEP(cep)

        // Valida CEP
        if (!validarCEP(cepLimpo)) {
          setError(null)
          setEndereco(null)
          resolve()
          return
        }

        // Implementa debounce
        timeoutRef.current = setTimeout(async () => {
          await buscarCEPInterno(cepLimpo)
          resolve()
        }, debounceMs)
      })
    },
    [buscarCEPInterno, debounceMs, validarCEP, limparCEP],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    buscarCEP,
    endereco,
    isLoading,
    error,
    clearError,
  }
}
