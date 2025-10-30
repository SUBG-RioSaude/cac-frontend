import { useCallback, useEffect, useState } from 'react'

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
  const [showMinCharactersWarning, setShowMinCharactersWarning] = useState(false)

  // Debounce do termo de pesquisa
  const debouncedSearch = useDebounce(
    searchTerm,
    searchConfig?.debounceMs ?? 500,
  )

  // Aplicar pesquisa quando debounced value mudar
  useEffect(() => {
    const minChars = searchConfig?.minCharacters ?? 0

    // Se tem mínimo de caracteres e não atingiu, mostrar aviso
    if (minChars > 0 && searchTerm && searchTerm.length < minChars) {
      setShowMinCharactersWarning(true)
      return
    }

    setShowMinCharactersWarning(false)

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
  }, [debouncedSearch, searchTerm, searchConfig, onFiltrosChange])

  // Handler para limpar pesquisa
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setShowMinCharactersWarning(false)
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    showMinCharactersWarning,
    minCharacters: searchConfig?.minCharacters ?? 0,
  }
}
