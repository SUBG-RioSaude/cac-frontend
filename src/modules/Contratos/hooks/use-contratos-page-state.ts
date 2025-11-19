/**
 * Hook para gerenciar estado local da página de lista de contratos
 * Substitui o uso do Zustand store para estado da UI
 */

import { useState, useCallback, useMemo } from 'react'

import type { ContratoParametros } from '@/modules/Contratos/services/contratos-service'
import type {
  FiltrosContrato,
  PaginacaoParams,
} from '@/modules/Contratos/types/contrato'

export interface ContratosPageState {
  // Estados da UI
  filtros: FiltrosContrato
  paginacao: PaginacaoParams
  contratosSelecionados: string[]

  // Dados derivados
  parametrosAPI: ContratoParametros

  // Handlers
  setFiltros: (
    filtros: FiltrosContrato | ((prev: FiltrosContrato) => FiltrosContrato),
  ) => void
  setPaginacao: (
    paginacao: PaginacaoParams | ((prev: PaginacaoParams) => PaginacaoParams),
  ) => void
  selecionarContrato: (contratoId: string, selecionado: boolean) => void
  selecionarTodosContratos: (
    contratoIds: string[],
    selecionado: boolean,
  ) => void
  limparFiltros: () => void
  resetarSelecao: () => void
}

/**
 * Mapeia filtros da UI para parâmetros da API
 */
function mapearFiltrosParaAPI(
  filtros: FiltrosContrato,
  paginacao: PaginacaoParams,
): ContratoParametros {
  const params: ContratoParametros = {
    pagina: paginacao.pagina,
    tamanhoPagina: paginacao.itensPorPagina,
  }

  // Termo de pesquisa (agora integrado nos filtros)
  if (filtros.termoPesquisa?.trim()) {
    params.termoPesquisa = filtros.termoPesquisa.trim()
  }

  // Status (array → string separado por vírgula)
  if (filtros.status && filtros.status.length > 0) {
    params.filtroStatus = filtros.status.join(',')
  }

  // Datas
  if (filtros.dataInicialDe) {
    params.dataInicialDe = filtros.dataInicialDe
  }
  if (filtros.dataInicialAte) {
    params.dataInicialAte = filtros.dataInicialAte
  }
  if (filtros.dataFinalDe) {
    params.dataFinalDe = filtros.dataFinalDe
  }
  if (filtros.dataFinalAte) {
    params.dataFinalAte = filtros.dataFinalAte
  }

  // Valores
  if (filtros.valorMinimo !== undefined && filtros.valorMinimo > 0) {
    params.valorMinimo = filtros.valorMinimo
  }
  if (filtros.valorMaximo !== undefined && filtros.valorMaximo > 0) {
    params.valorMaximo = filtros.valorMaximo
  }

  // Unidades - usando unidadeSaudeId conforme API
  if (filtros.unidade && filtros.unidade.length > 0) {
    // Para agora, vamos usar o primeiro valor da unidade como string de busca
    // TODO: Implementar mapeamento correto de nomes para IDs quando disponível
    const [primeiraUnidade] = filtros.unidade
    params.unidadeSaudeId = primeiraUnidade
  }

  return params
}

export function useContratosPageState(): ContratosPageState {
  // Estados locais
  const [filtros, setFiltros] = useState<FiltrosContrato>({})
  const [paginacao, setPaginacao] = useState<PaginacaoParams>({
    pagina: 1,
    itensPorPagina: 20,
    total: 0,
  })
  const [contratosSelecionados, setContratosSelecionados] = useState<string[]>(
    [],
  )

  // Parâmetros para a API (calculados quando filtros mudam)
  // IMPORTANTE: Só recalcula quando pagina, itensPorPagina ou filtros mudam
  // Mudanças no 'total' não devem causar nova query
  const parametrosAPI = useMemo(() => {
    return mapearFiltrosParaAPI(filtros, paginacao)
  }, [filtros, paginacao.pagina, paginacao.itensPorPagina])

  // Handlers
  // ✅ CORREÇÃO: Suportar tanto valor direto quanto função (setState pattern)
  const handleSetFiltros = useCallback(
    (
      novosFiltros:
        | FiltrosContrato
        | ((prev: FiltrosContrato) => FiltrosContrato),
    ) => {
      setFiltros(novosFiltros)
      // Reset página quando filtros mudam
      setPaginacao((prev) => ({ ...prev, pagina: 1 }))
    },
    [],
  )

  const handleSetPaginacao = useCallback(
    (
      novaPaginacao:
        | PaginacaoParams
        | ((prev: PaginacaoParams) => PaginacaoParams),
    ) => {
      setPaginacao(novaPaginacao)
    },
    [],
  )

  const handleSelecionarContrato = useCallback(
    (contratoId: string, selecionado: boolean) => {
      if (selecionado) {
        setContratosSelecionados((prev) => [...prev, contratoId])
      } else {
        setContratosSelecionados((prev) =>
          prev.filter((id) => id !== contratoId),
        )
      }
    },
    [],
  )

  const handleSelecionarTodosContratos = useCallback(
    (contratoIds: string[], selecionado: boolean) => {
      if (selecionado) {
        setContratosSelecionados(contratoIds)
      } else {
        setContratosSelecionados([])
      }
    },
    [],
  )

  const handleLimparFiltros = useCallback(() => {
    setFiltros({})
    setPaginacao((prev) => ({ ...prev, pagina: 1 }))
  }, [])

  const handleResetarSelecao = useCallback(() => {
    setContratosSelecionados([])
  }, [])

  return {
    // Estados
    filtros,
    paginacao,
    contratosSelecionados,

    // Dados derivados
    parametrosAPI,

    // Handlers
    setFiltros: handleSetFiltros,
    setPaginacao: handleSetPaginacao,
    selecionarContrato: handleSelecionarContrato,
    selecionarTodosContratos: handleSelecionarTodosContratos,
    limparFiltros: handleLimparFiltros,
    resetarSelecao: handleResetarSelecao,
  }
}
