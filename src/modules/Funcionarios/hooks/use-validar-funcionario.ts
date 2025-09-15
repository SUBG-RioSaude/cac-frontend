import { useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { getFuncionarioByCpf, getFuncionarioByMatricula } from '@/modules/Funcionarios/services/funcionarios-service'
import { funcionarioKeys } from '@/modules/Funcionarios/lib/query-keys'

type ValidacaoState = {
  isChecking: boolean
  isWaiting: boolean
  isAvailable: boolean | null
  error?: string
  lastChecked?: string
}

export function useValidarCpfUnico(rawCpf: string): ValidacaoState {
  const debounced = useDebounce((rawCpf || '').replace(/\D/g, ''), 600)
  const isWaiting = rawCpf?.replace(/\D/g, '') !== debounced && (rawCpf || '').length > 0
  const isValidFormat = debounced.length === 11

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: funcionarioKeys.byCpf(debounced),
    queryFn: async () => {
      const resp = await getFuncionarioByCpf(debounced)
      return resp.encontrado
    },
    enabled: isValidFormat && debounced.length > 0,
    staleTime: 30000,
    gcTime: 60000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  if (!isValidFormat && debounced.length > 0) {
    return { isChecking: false, isWaiting: false, isAvailable: null, error: 'CPF inválido' }
  }
  if (!debounced) {
    return { isChecking: false, isWaiting, isAvailable: null }
  }
  if (isWaiting) {
    return { isChecking: false, isWaiting: true, isAvailable: null }
  }
  if (isLoading || isFetching) {
    return { isChecking: true, isWaiting: false, isAvailable: null, lastChecked: debounced }
  }
  if (error) {
    return { isChecking: false, isWaiting: false, isAvailable: null, error: 'Erro ao verificar CPF', lastChecked: debounced }
  }
  // data === true -> encontrado => não disponível
  if (data === true) return { isChecking: false, isWaiting: false, isAvailable: false, lastChecked: debounced }
  // data === false (ou undefined porque query disabled) -> disponível
  return { isChecking: false, isWaiting: false, isAvailable: true, lastChecked: debounced }
}

export function useValidarMatriculaUnica(rawMatricula: string): ValidacaoState {
  const debounced = useDebounce((rawMatricula || '').trim(), 600)
  const isWaiting = (rawMatricula || '').trim() !== debounced && (rawMatricula || '').length > 0
  const isValidFormat = /^[A-Za-z0-9]{3,20}$/.test(debounced)

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: funcionarioKeys.byMatricula(debounced),
    queryFn: async () => {
      const resp = await getFuncionarioByMatricula(debounced)
      return resp.encontrado
    },
    enabled: isValidFormat && debounced.length > 0,
    staleTime: 30000,
    gcTime: 60000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  if (!isValidFormat && debounced.length > 0) {
    return { isChecking: false, isWaiting: false, isAvailable: null, error: 'Matrícula inválida' }
  }
  if (!debounced) {
    return { isChecking: false, isWaiting, isAvailable: null }
  }
  if (isWaiting) {
    return { isChecking: false, isWaiting: true, isAvailable: null }
  }
  if (isLoading || isFetching) {
    return { isChecking: true, isWaiting: false, isAvailable: null, lastChecked: debounced }
  }
  if (error) {
    return { isChecking: false, isWaiting: false, isAvailable: null, error: 'Erro ao verificar matrícula', lastChecked: debounced }
  }
  if (data === true) return { isChecking: false, isWaiting: false, isAvailable: false, lastChecked: debounced }
  return { isChecking: false, isWaiting: false, isAvailable: true, lastChecked: debounced }
}

