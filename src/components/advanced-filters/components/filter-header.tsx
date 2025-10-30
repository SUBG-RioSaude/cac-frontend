import { Filter, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface FilterHeaderProps {
  activeFiltersCount: number
  onClearFilters: () => void
}

/**
 * Cabeçalho do container de filtros com botão limpar
 */
export const FilterHeader = ({
  activeFiltersCount,
  onClearFilters,
}: FilterHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <h3 className="font-semibold">Filtros Avançados</h3>
      </div>
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-7 text-xs"
        >
          <X className="mr-1 h-3 w-3" />
          Limpar
        </Button>
      )}
    </div>
  )
}
