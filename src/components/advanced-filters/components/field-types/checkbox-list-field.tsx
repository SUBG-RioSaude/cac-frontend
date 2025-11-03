import { useCallback } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type { CheckboxListConfig } from '../../types'

interface CheckboxListFieldProps<TFilters> {
  config: CheckboxListConfig<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters) => void
  isMobile?: boolean
}

/**
 * Campo de checkbox list para múltipla seleção ou seleção única
 * Usado para Status, Categorias, etc.
 */
export const CheckboxListField = <TFilters extends Record<string, any>>({
  config,
  filtros,
  onFiltrosChange,
}: CheckboxListFieldProps<TFilters>) => {
  const currentValue = filtros[config.field]

  // Handler memoizado para mudanças de checkbox
  // ✅ CORREÇÃO: Forma funcional para evitar dependência de 'filtros'
  const handleCheckboxChange = useCallback(
    (optionValue: string, checked: boolean) => {
      if (config.multiSelect) {
        // Múltipla seleção: array de valores
        onFiltrosChange((prev: TFilters) => {
          const currentArray = (prev[config.field] as string[]) ?? []
          const newArray = checked
            ? [...currentArray, optionValue]
            : currentArray.filter((v) => v !== optionValue)

          return {
            ...prev,
            [config.field]: newArray,
          }
        })
      } else {
        // Seleção única: valor único
        onFiltrosChange((prev: TFilters) => ({
          ...prev,
          [config.field]: checked ? optionValue : undefined,
        }))
      }
    },
    [config.field, config.multiSelect, onFiltrosChange],
  )

  // Verifica se opção está selecionada
  const isOptionChecked = useCallback(
    (optionValue: string) => {
      if (config.multiSelect) {
        return ((currentValue as string[]) ?? []).includes(optionValue)
      }
      return currentValue === optionValue
    },
    [config.multiSelect, currentValue],
  )

  return (
    <div className="space-y-2">
      {config.options.map((option) => {
        const Icon = option.icon
        const isChecked = isOptionChecked(option.value)

        return (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${String(config.field)}-${option.value}`}
              checked={isChecked}
              onCheckedChange={(checked) =>
                handleCheckboxChange(option.value, checked as boolean)
              }
            />
            <Label
              htmlFor={`checkbox-${String(config.field)}-${option.value}`}
              className="flex cursor-pointer items-center gap-2 text-sm font-normal"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {option.color ? (
                <span className={cn('rounded-full px-2 py-1 text-xs', option.color)}>
                  {option.label}
                </span>
              ) : (
                <span>{option.label}</span>
              )}
            </Label>
          </div>
        )
      })}
    </div>
  )
}
