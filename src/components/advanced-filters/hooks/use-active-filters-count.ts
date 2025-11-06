import { useMemo } from 'react'

/**
 * Hook para contar quantos filtros estão ativos
 * Exclui campos de paginação por padrão
 *
 * @param filtros - Objeto de filtros
 * @param excludeFields - Campos a excluir da contagem (ex: pagina, tamanhoPagina)
 * @returns Número de filtros ativos
 */
export const useActiveFiltersCount = <TFilters extends Record<string, any>>(
  filtros: TFilters,
  excludeFields: (keyof TFilters)[] = [
    'pagina',
    'tamanhoPagina',
  ] as (keyof TFilters)[],
) => {
  return useMemo(() => {
    let count = 0

    Object.entries(filtros).forEach(([key, value]) => {
      // Ignorar campos excluídos
      if (excludeFields.includes(key as keyof TFilters)) {
        return
      }

      // Contar arrays não vazios
      if (Array.isArray(value) && value.length > 0) {
        count++
        return
      }

      // Contar valores definidos e não vazios
      if (value !== undefined && value !== null && value !== '') {
        count++
      }
    })

    return count
  }, [filtros, excludeFields])
}
