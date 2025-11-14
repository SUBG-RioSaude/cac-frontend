import { useCallback } from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { SelectConfig } from '../../types'

interface SelectFieldProps<TFilters> {
  config: SelectConfig<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters | ((prev: TFilters) => TFilters)) => void
  isMobile?: boolean
}

/**
 * Campo select simples
 * Usado para filtros de seleção única como Período, Tipo, etc.
 */
export const SelectField = <TFilters extends Record<string, any>>({
  config,
  filtros,
  onFiltrosChange,
}: SelectFieldProps<TFilters>) => {
  const currentValue = (filtros[config.field] as string) ?? ''

  // ✅ CORREÇÃO: Forma funcional para evitar dependência de 'filtros'
  const handleValueChange = useCallback(
    (value: string) => {
      onFiltrosChange((prev: TFilters) => ({
        ...prev,
        [config.field]: value || undefined,
      }))
    },
    [config.field, onFiltrosChange],
  )

  return (
    <div className="space-y-2">
      <Label htmlFor={`select-${String(config.field)}`} className="text-sm">
        {config.placeholder ?? 'Selecione uma opção'}
      </Label>
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger id={`select-${String(config.field)}`} className="h-9">
          <SelectValue placeholder={config.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {config.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
