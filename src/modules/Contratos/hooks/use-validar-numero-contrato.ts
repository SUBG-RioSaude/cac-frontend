/**
 * Hook para validação de número de contrato em tempo real
 * Verifica duplicação com debounce para otimizar performance
 */

import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { useState, useEffect, useRef } from 'react'
import { getContratoByNumero } from '@/modules/Contratos/services/contratos-service'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import type { Contrato } from '@/modules/Contratos/types/contrato'

interface NumeroValidationState {
  isChecking: boolean
  isWaiting: boolean // Durante debounce
  isUnique: boolean | null
  conflictData?: {
    id: string
    numeroContrato: string
    empresaRazaoSocial?: string
    empresaCnpj?: string
  }
  error?: string
  lastChecked?: string
}

export function useValidarNumeroContrato(numeroContrato: string): NumeroValidationState {
  // Estados para controle de UX
  const minLoadingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isShowingMinLoading, setIsShowingMinLoading] = useState(false)
  
  // Debounce do número para evitar requests excessivos
  const debouncedNumero = useDebounce(numeroContrato?.trim() || '', 600)
  
  // Detectar se está no período de debounce (waiting)
  const isWaiting = numeroContrato.trim() !== debouncedNumero && numeroContrato.trim().length > 0
  
  // Validar formato básico antes de fazer request
  const isValidFormat = /^\d+$/.test(debouncedNumero) && debouncedNumero.length > 0
  
  // Query para verificar duplicação
  const {
    data: contratoExistente,
    isLoading: isChecking,
    error,
    isFetching
  } = useQuery({
    queryKey: contratoKeys.byNumero(debouncedNumero),
    queryFn: () => getContratoByNumero(debouncedNumero),
    enabled: isValidFormat && debouncedNumero.length > 0,
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
    retry: false, // Não retry para 404s
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Gerenciar delay mínimo de loading para melhor UX
  useEffect(() => {
    // Se começou a carregar, iniciar timer de delay mínimo
    if (isChecking || isFetching) {
      setIsShowingMinLoading(true)
      
      // Limpar timer anterior se existir
      if (minLoadingTimerRef.current) {
        clearTimeout(minLoadingTimerRef.current)
      }
      
      // Definir delay mínimo de 800ms
      minLoadingTimerRef.current = setTimeout(() => {
        // Só parar o loading se não estiver mais carregando
        setIsShowingMinLoading(false)
      }, 800)
      
    } else {
      // Se parou de carregar, limpar timer e estado
      if (minLoadingTimerRef.current) {
        clearTimeout(minLoadingTimerRef.current)
        minLoadingTimerRef.current = null
      }
      setIsShowingMinLoading(false)
    }
    
    // Cleanup function
    return () => {
      if (minLoadingTimerRef.current) {
        clearTimeout(minLoadingTimerRef.current)
        minLoadingTimerRef.current = null
      }
    }
  }, [isChecking, isFetching])

  // Determinar estado da validação
  const getValidationState = (): NumeroValidationState => {
    // Se não é um formato válido, não fazer nada
    if (!isValidFormat && debouncedNumero.length > 0) {
      return {
        isChecking: false,
        isWaiting: false,
        isUnique: null,
        error: 'Formato inválido: use apenas números'
      }
    }

    // Se está vazio, não validar
    if (!debouncedNumero) {
      return {
        isChecking: false,
        isWaiting: isWaiting, // Mostrar waiting se estiver digitando
        isUnique: null
      }
    }

    // Se está no período de debounce (waiting)
    if (isWaiting) {
      return {
        isChecking: false,
        isWaiting: true,
        isUnique: null
      }
    }

    // Se está carregando (com delay mínimo)
    if ((isChecking || isFetching) || isShowingMinLoading) {
      return {
        isChecking: true,
        isWaiting: false,
        isUnique: null,
        lastChecked: debouncedNumero
      }
    }

    // Se houve erro na request
    if (error) {
      return {
        isChecking: false,
        isWaiting: false,
        isUnique: null,
        error: 'Erro ao verificar disponibilidade',
        lastChecked: debouncedNumero
      }
    }

    // Se encontrou contrato (duplicado)
    if (contratoExistente) {
      return {
        isChecking: false,
        isWaiting: false,
        isUnique: false,
        conflictData: {
          id: contratoExistente.id,
          numeroContrato: contratoExistente.numeroContrato || debouncedNumero,
          empresaRazaoSocial: contratoExistente.empresaRazaoSocial || undefined,
          empresaCnpj: contratoExistente.empresaCnpj || undefined
        },
        lastChecked: debouncedNumero
      }
    }

    // Se não encontrou contrato (número disponível)
    if (contratoExistente === null) {
      return {
        isChecking: false,
        isWaiting: false,
        isUnique: true,
        lastChecked: debouncedNumero
      }
    }

    // Estado inicial/indefinido
    return {
      isChecking: false,
      isWaiting: false,
      isUnique: null
    }
  }

  return getValidationState()
}