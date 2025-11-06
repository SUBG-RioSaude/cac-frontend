import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import type { AsyncCheckboxConfig, CheckboxOption } from '../../types'

interface AsyncCheckboxFieldProps<TFilters> {
  config: AsyncCheckboxConfig<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters | ((prev: TFilters) => TFilters)) => void
  isMobile?: boolean
}

/**
 * Campo de checkboxes carregados assincronamente via API
 * Com busca local e skeleton durante loading
 * Usado para Unidades, Categorias dinâmicas, etc.
 */
export const AsyncCheckboxField = <TFilters extends Record<string, any>>({
  config,
  filtros,
  onFiltrosChange,
}: AsyncCheckboxFieldProps<TFilters>) => {
  const [options, setOptions] = useState<CheckboxOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const currentValue = (filtros[config.field] as string[]) ?? []

  // Carregar options ao montar
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const loadedOptions = await config.loadOptions()
        setOptions(loadedOptions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar opções')
      } finally {
        setIsLoading(false)
      }
    }

    void loadOptions()
  }, [config])

  // Filtrar options por busca local
  const filteredOptions = searchTerm
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options

  // Handler para mudança de checkbox
  // ✅ CORREÇÃO: Forma funcional para evitar dependência de 'filtros'
  const handleCheckboxChange = useCallback(
    (optionValue: string, checked: boolean) => {
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
    },
    [config.field, onFiltrosChange],
  )

  if (error) {
    return <div className="py-2 text-center text-sm text-red-600">{error}</div>
  }

  return (
    <div className="space-y-3">
      {/* Busca local (se habilitado) */}
      {config.searchable && !isLoading && (
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={config.searchPlaceholder ?? 'Buscar...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-9"
          />
        </div>
      )}

      {/* Lista de checkboxes */}
      <div className="max-h-40 space-y-2 overflow-y-auto">
        {isLoading ? (
          // Skeleton durante loading
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : filteredOptions.length > 0 ? (
          // Options carregadas
          filteredOptions.map((option) => {
            const Icon = option.icon
            const isChecked = currentValue.includes(option.value)

            return (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`async-${String(config.field)}-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`async-${String(config.field)}-${option.value}`}
                  className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {option.color ? (
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs',
                        option.color,
                      )}
                    >
                      {option.label}
                    </span>
                  ) : (
                    <span>{option.label}</span>
                  )}
                </Label>
              </div>
            )
          })
        ) : (
          // Nenhuma opção encontrada
          <div className="py-2 text-center text-sm text-gray-500">
            {searchTerm
              ? 'Nenhuma opção encontrada'
              : 'Nenhuma opção disponível'}
          </div>
        )}
      </div>
    </div>
  )
}
