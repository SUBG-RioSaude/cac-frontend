import type { CustomConfig } from '../../types'

interface CustomFieldProps<TFilters> {
  config: CustomConfig<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters | ((prev: TFilters) => TFilters)) => void
  isMobile?: boolean
}

/**
 * Campo customizado (escape hatch)
 * Permite renderização totalmente customizada para casos específicos
 */
export const CustomField = <TFilters extends Record<string, any>>({
  config,
  filtros,
  onFiltrosChange,
  isMobile = false,
}: CustomFieldProps<TFilters>) => {
  return (
    <>
      {config.render({
        filtros,
        onFiltrosChange,
        isMobile,
      })}
    </>
  )
}
