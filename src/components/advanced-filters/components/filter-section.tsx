import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import type { FilterSection as FilterSectionType } from '../types'

import {
  AsyncCheckboxField,
  CheckboxListField,
  CustomField,
  DateRangeField,
  RangeField,
  SelectField,
} from './field-types'

interface FilterSectionProps<TFilters> {
  section: FilterSectionType<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters | ((prev: TFilters) => TFilters)) => void
  isMobile?: boolean
}

/**
 * Seção de filtro expansível que renderiza o campo apropriado baseado no tipo
 */
export const FilterSection = <TFilters extends Record<string, any>>({
  section,
  filtros,
  onFiltrosChange,
  isMobile = false,
}: FilterSectionProps<TFilters>) => {
  const [isExpanded, setIsExpanded] = useState(section.defaultExpanded ?? false)

  const Icon = section.icon

  // Calcular se há valores ativos nesta seção
  const hasActiveValues = () => {
    if (section.config.type === 'checkbox-list') {
      const value = filtros[section.config.field]
      return (
        (section.config.multiSelect &&
          Array.isArray(value) &&
          value.length > 0) ||
        (!section.config.multiSelect && value !== undefined && value !== null)
      )
    }

    if (section.config.type === 'range') {
      const minValue = filtros[section.config.minField]
      const maxValue = filtros[section.config.maxField]
      return minValue !== undefined || maxValue !== undefined
    }

    if (section.config.type === 'date-range') {
      const startDate = filtros[section.config.startDateField]
      const endDate = filtros[section.config.endDateField]
      return startDate !== undefined || endDate !== undefined
    }

    if (section.config.type === 'select') {
      const value = filtros[section.config.field]
      return value !== undefined && value !== ''
    }

    if (section.config.type === 'async-checkbox') {
      const value = filtros[section.config.field]
      return Array.isArray(value) && value.length > 0
    }

    return false
  }

  // Renderizar campo baseado no tipo
  const renderField = () => {
    switch (section.config.type) {
      case 'checkbox-list':
        return (
          <CheckboxListField
            config={section.config}
            filtros={filtros}
            onFiltrosChange={onFiltrosChange}
            isMobile={isMobile}
          />
        )

      case 'range':
        return (
          <RangeField
            config={section.config}
            filtros={filtros}
            onFiltrosChange={onFiltrosChange}
            isMobile={isMobile}
          />
        )

      case 'date-range':
        return (
          <DateRangeField
            config={section.config}
            filtros={filtros}
            onFiltrosChange={onFiltrosChange}
            isMobile={isMobile}
          />
        )

      case 'select':
        return (
          <SelectField
            config={section.config}
            filtros={filtros}
            onFiltrosChange={onFiltrosChange}
            isMobile={isMobile}
          />
        )

      case 'async-checkbox':
        return (
          <AsyncCheckboxField
            config={section.config}
            filtros={filtros}
            onFiltrosChange={onFiltrosChange}
            isMobile={isMobile}
          />
        )

      case 'custom':
        return (
          <CustomField
            config={section.config}
            filtros={filtros}
            onFiltrosChange={onFiltrosChange}
            isMobile={isMobile}
          />
        )

      default:
        return null
    }
  }

  const activeValues = hasActiveValues()

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-muted/50 h-auto w-full justify-between p-2"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
            <span className="text-sm font-medium">{section.title}</span>
            {activeValues && (
              <Badge variant="secondary" className="h-5 text-xs">
                Ativo
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 ml-6 space-y-3">
        {renderField()}
      </CollapsibleContent>
    </Collapsible>
  )
}
