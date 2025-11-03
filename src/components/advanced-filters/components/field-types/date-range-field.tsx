import { useCallback } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { DateRangeConfig } from '../../types'

interface DateRangeFieldProps<TFilters> {
  config: DateRangeConfig<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters) => void
  isMobile?: boolean
}

/**
 * Campo de range de datas para filtrar por período
 * Usado para Vigência, Data de Criação, etc.
 */
export const DateRangeField = <TFilters extends Record<string, any>>({
  config,
  filtros,
  onFiltrosChange,
}: DateRangeFieldProps<TFilters>) => {
  const startDateValue = (filtros[config.startDateField] as string) ?? ''
  const endDateValue = (filtros[config.endDateField] as string) ?? ''

  // Handler para mudança de data início
  // ✅ CORREÇÃO: Forma funcional para evitar dependência de 'filtros'
  const handleStartDateChange = useCallback(
    (value: string) => {
      onFiltrosChange((prev: TFilters) => ({
        ...prev,
        [config.startDateField]: value || undefined,
      }))
    },
    [config.startDateField, onFiltrosChange],
  )

  // Handler para mudança de data fim
  // ✅ CORREÇÃO: Forma funcional para evitar dependência de 'filtros'
  const handleEndDateChange = useCallback(
    (value: string) => {
      onFiltrosChange((prev: TFilters) => ({
        ...prev,
        [config.endDateField]: value || undefined,
      }))
    },
    [config.endDateField, onFiltrosChange],
  )

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Data Início */}
      <div className="space-y-2">
        <Label
          htmlFor={`date-${String(config.startDateField)}`}
          className="text-muted-foreground text-xs"
        >
          {config.startLabel}
        </Label>
        <Input
          id={`date-${String(config.startDateField)}`}
          type="date"
          value={startDateValue}
          onChange={(e) => handleStartDateChange(e.target.value)}
          min={config.minDate}
          max={config.maxDate ?? endDateValue ?? undefined}
          className="h-9"
        />
      </div>

      {/* Data Fim */}
      <div className="space-y-2">
        <Label
          htmlFor={`date-${String(config.endDateField)}`}
          className="text-muted-foreground text-xs"
        >
          {config.endLabel}
        </Label>
        <Input
          id={`date-${String(config.endDateField)}`}
          type="date"
          value={endDateValue}
          onChange={(e) => handleEndDateChange(e.target.value)}
          min={config.minDate ?? startDateValue ?? undefined}
          max={config.maxDate}
          className="h-9"
        />
      </div>
    </div>
  )
}
