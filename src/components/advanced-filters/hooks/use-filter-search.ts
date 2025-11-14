import { useCallback, useEffect, useRef, useState } from 'react'

import { useDebounce } from '@/hooks/use-debounce'

import type { SearchConfig } from '../types'

interface UseFilterSearchProps<TFilters> {
  searchConfig?: SearchConfig<TFilters>
  onFiltrosChange: (filtros: Partial<TFilters>) => void
}

/**
 * Hook para gerenciar pesquisa com debounce e detecção de tipo
 *
 * @param searchConfig - Configuração da pesquisa
 * @param onFiltrosChange - Callback para atualizar filtros
 * @returns Estado e handlers da pesquisa
 */
export const useFilterSearch = <TFilters extends Record<string, any>>({
  searchConfig,
  onFiltrosChange,
}: UseFilterSearchProps<TFilters>) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showMinCharactersWarning, setShowMinCharactersWarning] =
    useState(false)

  // ✅ CORREÇÃO DEFINITIVA: Usar ref para rastrear último valor aplicado
  const lastAppliedSearchRef = useRef<string>('')

  // Debounce do termo de pesquisa
  const debouncedSearch = useDebounce(
    searchTerm,
    searchConfig?.debounceMs ?? 500,
  )

  // Aplicar pesquisa quando debounced value mudar
  // ✅ CORREÇÃO: Só chamar onFiltrosChange se valor REALMENTE mudou
  useEffect(() => {
    const minChars = searchConfig?.minCharacters ?? 0

    // Se tem mínimo de caracteres e não atingiu, mostrar aviso
    if (minChars > 0 && searchTerm && searchTerm.length < minChars) {
      setShowMinCharactersWarning(true)
      return
    }

    setShowMinCharactersWarning(false)

    // ✅ CRÍTICO: Só aplicar se valor mudou de verdade
    if (debouncedSearch === lastAppliedSearchRef.current) {
      return // Não fazer nada se o valor já foi aplicado
    }

    lastAppliedSearchRef.current = debouncedSearch

    // Se tem termo de pesquisa debounced, aplicar filtros
    if (debouncedSearch) {
      // Usar detectType se configurado, senão usar campo padrão
      const detectedFilters = searchConfig?.detectType?.(debouncedSearch) ?? {
        termoPesquisa: debouncedSearch,
      }

      onFiltrosChange(detectedFilters as Partial<TFilters>)
    } else {
      // Limpar filtros de pesquisa quando vazio
      const clearedFilters = searchConfig?.detectType?.('') ?? {
        termoPesquisa: undefined,
      }

      onFiltrosChange(clearedFilters as Partial<TFilters>)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, searchTerm, searchConfig])

  // Handler para limpar pesquisa
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setShowMinCharactersWarning(false)
    lastAppliedSearchRef.current = '' // ✅ Resetar ref também
  }, [])

  // Estado de busca em andamento
  const minChars = searchConfig?.minCharacters ?? 0
  const isSearching =
    searchTerm !== debouncedSearch &&
    searchTerm.trim() !== '' &&
    searchTerm.trim().length >= minChars

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    showMinCharactersWarning,
    minCharacters: searchConfig?.minCharacters ?? 0,
    isSearching,
  }
}
