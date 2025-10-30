import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { FilterHeader } from './components/filter-header'
import { FilterSearchBar } from './components/filter-search-bar'
import { FilterSection } from './components/filter-section'
import { useActiveFiltersCount, useFilterSearch } from './hooks'
import type { AdvancedFiltersProps } from './types'

/**
 * Componente genérico de filtros avançados
 *
 * Características:
 * - ✅ Resolve bug de perda de foco (via RangeField com estados locais)
 * - ✅ Suporta múltiplos tipos de campo (checkbox, range, date, select, async, custom)
 * - ✅ Layout responsivo (dropdown desktop + sheet mobile)
 * - ✅ Pesquisa com debounce e detecção de tipo
 * - ✅ Contagem automática de filtros ativos
 * - ✅ Type-safe com generics
 *
 * @template TFilters - Tipo dos filtros específicos do módulo
 */
export const AdvancedFilters = <TFilters extends Record<string, any>>({
  filtros,
  onFiltrosChange,
  onLimparFiltros,
  searchConfig,
  filterSections,
  layoutMode = 'dropdown',
  mobileMode = 'sheet',
  showActiveFiltersCount = true,
  totalResults,
  ariaLabel = 'Filtros avançados',
}: AdvancedFiltersProps<TFilters>) => {
  // Contagem de filtros ativos
  const activeFiltersCount = useActiveFiltersCount(filtros)

  // Lógica de pesquisa com debounce
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    showMinCharactersWarning,
    minCharacters,
  } = useFilterSearch<TFilters>({
    searchConfig,
    onFiltrosChange: useCallback(
      (partialFilters: Partial<TFilters>) => {
        onFiltrosChange({
          ...filtros,
          ...partialFilters,
        } as TFilters)
      },
      [filtros, onFiltrosChange],
    ),
  })

  // Conteúdo dos filtros (reutilizado em desktop e mobile)
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-4 p-6">
      <FilterHeader
        activeFiltersCount={activeFiltersCount}
        onClearFilters={onLimparFiltros}
      />

      <Separator />

      {/* Seções de filtro */}
      <div className="space-y-2">
        {filterSections.map((section) => (
          <div key={section.id}>
            <FilterSection
              section={section}
              filtros={filtros}
              onFiltrosChange={onFiltrosChange}
              isMobile={isMobile}
            />
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Barra de Pesquisa */}
      {searchConfig && (
        <motion.div
          className="relative w-full flex-1 sm:max-w-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FilterSearchBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onClearSearch={clearSearch}
            placeholder={searchConfig.placeholder}
            showMinCharactersWarning={
              searchConfig.showMinCharactersWarning &&
              showMinCharactersWarning
            }
            minCharacters={minCharacters}
          />
        </motion.div>
      )}

      {/* Botão de Filtros - Desktop (Dropdown) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="hidden sm:block"
      >
        {layoutMode === 'dropdown' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hover:border-primary relative h-10 border-2 px-4 whitespace-nowrap shadow-sm transition-all duration-200 sm:h-11"
                aria-label={ariaLabel}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {showActiveFiltersCount && activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-80 p-0 sm:w-96"
              align="end"
              sideOffset={8}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FilterContent />
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.div>

      {/* Botão de Filtros - Mobile (Sheet) */}
      <div className="sm:hidden">
        {mobileMode === 'sheet' && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="hover:border-primary relative h-10 w-full border-2 px-4 shadow-sm transition-all duration-200"
                aria-label={ariaLabel}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {showActiveFiltersCount && activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros Avançados</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-y-auto">
                <FilterContent isMobile />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Mostrar total de resultados (opcional) */}
      {totalResults !== undefined && (
        <div className="text-muted-foreground hidden text-sm sm:block">
          {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
        </div>
      )}
    </div>
  )
}
