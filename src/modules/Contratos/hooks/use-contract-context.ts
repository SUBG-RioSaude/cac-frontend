/**
 * Hook for loading contract context data
 * Provides current contract information to dynamic blocks in alterações contratuais
 */

import { useQuery } from '@tanstack/react-query'
import { getContratoDetalhado } from '@/modules/Contratos/services/contratos-service'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'

interface UseContractContextOptions {
  enabled?: boolean
}

/**
 * Hook para carregar contexto completo do contrato
 * Usado pelos blocos dinâmicos para ter acesso aos dados atuais do contrato
 */
export function useContractContext(
  contratoId: string, 
  options?: UseContractContextOptions
) {
  return useQuery({
    queryKey: contratoKeys.detail(contratoId),
    queryFn: async () => {
      return await getContratoDetalhado(contratoId)
    },
    enabled: (options?.enabled ?? true) && !!contratoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always'
  })
}

/**
 * Hook específico para dados de fornecedores do contrato
 */
export function useContractSuppliers(contratoId: string, options?: UseContractContextOptions) {
  const { data: contract, ...queryResult } = useContractContext(contratoId, options)
  
  return {
    ...queryResult,
    suppliers: contract?.fornecedor ? [contract.fornecedor] : [],
    mainSupplier: contract?.fornecedor || null
  }
}

/**
 * Hook específico para dados de unidades do contrato
 */
export function useContractUnits(contratoId: string, options?: UseContractContextOptions) {
  const { data: contract, ...queryResult } = useContractContext(contratoId, options)
  
  return {
    ...queryResult,
    units: contract?.unidades || { demandante: null, gestora: null, vinculadas: [] },
    demandingUnit: contract?.unidades?.demandante || null,
    managingUnit: contract?.unidades?.gestora || null,
    linkedUnits: contract?.unidades?.vinculadas || []
  }
}

/**
 * Hook específico para dados financeiros do contrato
 */
export function useContractFinancials(contratoId: string, options?: UseContractContextOptions) {
  const { data: contract, ...queryResult } = useContractContext(contratoId, options)
  
  return {
    ...queryResult,
    totalValue: contract?.valorTotal || 0,
    currentBalance: contract?.indicadores?.saldoAtual || 0,
    executedPercentage: contract?.indicadores?.percentualExecutado || 0
  }
}

/**
 * Hook específico para dados de vigência do contrato
 */
export function useContractTerms(contratoId: string, options?: UseContractContextOptions) {
  const { data: contract, ...queryResult } = useContractContext(contratoId, options)
  
  return {
    ...queryResult,
    startDate: contract?.dataInicio || null,
    endDate: contract?.dataTermino || null,
    isActive: contract?.dataInicio && contract?.dataTermino ? 
      new Date() >= new Date(contract.dataInicio) && new Date() <= new Date(contract.dataTermino) : 
      false
  }
}