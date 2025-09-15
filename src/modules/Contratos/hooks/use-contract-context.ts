/**
 * Hook for loading contract context data
 * Provides current contract information to dynamic blocks in alterações contratuais
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import { getContratoDetalhado } from '@/modules/Contratos/services/contratos-service'
import { contratoKeys } from '@/modules/Contratos/lib/query-keys'
import { useEmpresa } from '@/modules/Empresas/hooks/use-empresas'
import { useUnidade } from '@/modules/Unidades/hooks/use-unidades'
import { getUnidadeById } from '@/modules/Unidades/services/unidades-service'
import { unidadeKeys } from '@/modules/Unidades/lib/query-keys'
import {
  getUnidadeDemandantePrincipal,
  getUnidadeGestoraPrincipal
} from '@/modules/Contratos/types/contrato'

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
  const empresaId = contract?.empresaId as string | undefined
  const empresaQuery = useEmpresa(empresaId || '', { enabled: !!empresaId })
  
  const mappedMain = empresaQuery.data
    ? {
        id: empresaQuery.data.id,
        cnpj: empresaQuery.data.cnpj,
        razaoSocial: empresaQuery.data.razaoSocial,
        status: empresaQuery.data.ativo ? 'Ativo' as const : 'Inativo' as const,
        contratosAtivos: 0,
        valorTotal: contract?.valorTotal || 0,
        cidade: empresaQuery.data.cidade || '',
        estado: empresaQuery.data.estado || ''
      }
    : null
  
  return {
    ...queryResult,
    isLoading: queryResult.isLoading || empresaQuery.isLoading,
    isFetching: queryResult.isFetching || empresaQuery.isFetching,
    error: queryResult.error || empresaQuery.error,
    suppliers: mappedMain ? [mappedMain] : [],
    mainSupplier: mappedMain
  }
}

/**
 * Hook específico para dados de unidades do contrato
 */
export function useContractUnits(contratoId: string, options?: UseContractContextOptions) {
  const { data: contract, ...queryResult } = useContractContext(contratoId, options)
  
  // Priorizar dados do novo array unidadesResponsaveis, com fallback para campos legados
  let unidadeDemandanteId: string | undefined
  let unidadeGestoraId: string | undefined
  
  if (contract?.unidadesResponsaveis && contract.unidadesResponsaveis.length > 0) {
    // Usar novo array de unidades responsáveis
    const unidadeDemandante = getUnidadeDemandantePrincipal(contract)
    const unidadeGestora = getUnidadeGestoraPrincipal(contract)
    
    unidadeDemandanteId = unidadeDemandante?.unidadeSaudeId
    unidadeGestoraId = unidadeGestora?.unidadeSaudeId
    
    console.log('🔄 [CONTEXT] Usando unidadesResponsaveis:', {
      demandante: unidadeDemandante,
      gestora: unidadeGestora
    })
  } else {
    // Fallback para campos legados
    unidadeDemandanteId = contract?.unidadeDemandanteId as string | undefined
    unidadeGestoraId = contract?.unidadeGestoraId as string | undefined
    
    console.log('🔄 [CONTEXT] Usando campos legados:', {
      unidadeDemandanteId,
      unidadeGestoraId
    })
  }
  
  const unidadeDemandanteQuery = useUnidade(unidadeDemandanteId || '', { 
    enabled: !!unidadeDemandanteId && (options?.enabled ?? true)
  })
  
  const unidadeGestoraQuery = useUnidade(unidadeGestoraId || '', { 
    enabled: !!unidadeGestoraId && (options?.enabled ?? true)
  })

  // Buscar detalhes das unidades vinculadas
  const unidadesVinculadasIds = contract?.unidadesVinculadas?.map((uv: { unidadeSaudeId: string }) => 
    uv.unidadeSaudeId
  ).filter(Boolean) || []

  const unidadesVinculadasQueries = useQueries({
    queries: unidadesVinculadasIds.map((unidadeId: string) => ({
      queryKey: unidadeKeys.detail(unidadeId),
      queryFn: () => getUnidadeById(unidadeId),
      enabled: !!(unidadeId && (options?.enabled ?? true)),
      staleTime: 10 * 60 * 1000, // 10 minutos
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }))
  })
  
  // Resolver nomes das unidades com fallbacks robustos
  const demandingUnitName = 
    // 1. Primeiro: dados da query da unidade específica
    unidadeDemandanteQuery.data?.nome ||
    // 2. Novo: nome do array unidadesResponsaveis
    (contract?.unidadesResponsaveis ? getUnidadeDemandantePrincipal(contract)?.unidadeSaudeNome : null) ||
    // 3. Fallback: nome já presente no contrato  
    contract?.unidades?.demandante ||
    // 4. Fallback: campo legado direto
    contract?.unidadeDemandante ||
    // 5. Se não há nada, retorna null (será mostrado como "Não informado")
    null
    
  const managingUnitName = 
    // 1. Primeiro: dados da query da unidade específica
    unidadeGestoraQuery.data?.nome ||
    // 2. Novo: nome do array unidadesResponsaveis
    (contract?.unidadesResponsaveis ? getUnidadeGestoraPrincipal(contract)?.unidadeSaudeNome : null) ||
    // 3. Fallback: nome já presente no contrato
    contract?.unidades?.gestora ||
    // 4. Fallback: campo legado direto
    contract?.unidadeGestora ||
    // 5. Se não há nada, retorna null (será mostrado como "Não informado")
    null
  
  // Processar unidades vinculadas com detalhes da API
  const linkedUnitsWithDetails = unidadesVinculadasQueries
    .map((query, index) => {
      if (query.data) {
        const unidadeVinculada = contract?.unidadesVinculadas?.[index]
        return {
          id: unidadesVinculadasIds[index],
          codigo: query.data.sigla || query.data.cnes || '',
          nome: query.data.nome || `Unidade ${index + 1}`,
          tipo: query.data.tipoUnidadeId ? `Tipo ${query.data.tipoUnidadeId}` : 'Unidade',
          endereco: query.data.endereco || '',
          ativo: query.data.ativo ?? true,
          valorAtual: unidadeVinculada?.valorAtribuido || 0
        }
      }
      return null
    })
    .filter((unit): unit is NonNullable<typeof unit> => unit !== null)

  // Determinar estados de loading - só considera loading se realmente tem IDs para buscar
  const isLoadingDemandante = !!unidadeDemandanteId && unidadeDemandanteQuery.isLoading
  const isLoadingGestora = !!unidadeGestoraId && unidadeGestoraQuery.isLoading
  const isLoadingLinkedUnits = unidadesVinculadasQueries.some(q => q.isLoading)
  
  // Determinar estados de fetching
  const isFetchingDemandante = !!unidadeDemandanteId && unidadeDemandanteQuery.isFetching  
  const isFetchingGestora = !!unidadeGestoraId && unidadeGestoraQuery.isFetching
  const isFetchingLinkedUnits = unidadesVinculadasQueries.some(q => q.isFetching)
  
  // Agregar erros apenas se as queries foram habilitadas
  const unitsError = 
    (!!unidadeDemandanteId && unidadeDemandanteQuery.error) ||
    (!!unidadeGestoraId && unidadeGestoraQuery.error) ||
    unidadesVinculadasQueries.find(q => q.error)?.error ||
    null
  
  return {
    ...queryResult,
    isLoading: queryResult.isLoading || isLoadingDemandante || isLoadingGestora || isLoadingLinkedUnits,
    isFetching: queryResult.isFetching || isFetchingDemandante || isFetchingGestora || isFetchingLinkedUnits,
    error: queryResult.error || unitsError,
    units: {
      demandante: demandingUnitName,
      gestora: managingUnitName,
      vinculadas: linkedUnitsWithDetails
    },
    demandingUnit: demandingUnitName,
    managingUnit: managingUnitName,
    linkedUnits: linkedUnitsWithDetails,
    // Informações adicionais para debug
    _debug: {
      unidadeDemandanteId,
      unidadeGestoraId,
      demandanteQueryEnabled: !!unidadeDemandanteId,
      gestoraQueryEnabled: !!unidadeGestoraId,
      demandanteQueryStatus: unidadeDemandanteQuery.status,
      gestoraQueryStatus: unidadeGestoraQuery.status
    }
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
