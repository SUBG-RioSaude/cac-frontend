import { useCallback, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/use-debounce'

import type { RangeConfig } from '../../types'

interface RangeFieldProps<TFilters> {
  config: RangeConfig<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters | ((prev: TFilters) => TFilters)) => void
  isMobile?: boolean
}

/**
 * Campo de range (valores min/max) com aplicação em tempo real
 *
 * SOLUÇÃO DO PROBLEMA:
 * - Usa estados locais (minValueLocal, maxValueLocal) para armazenar valores durante digitação
 * - Aplica filtros automaticamente após 1 segundo sem digitar (debounce)
 * - onBlur aplica imediatamente se usuário sair do campo antes do debounce
 * - Isso evita re-renderizações que causam perda de foco
 * - useEffect sincroniza com props externas (ex: ao limpar filtros)
 */
export const RangeField = <TFilters extends Record<string, any>>({
  config,
  filtros,
  onFiltrosChange,
}: RangeFieldProps<TFilters>) => {
  // ✅ SOLUÇÃO: Estados locais para evitar perda de foco
  const [minValueLocal, setMinValueLocal] = useState<string>(
    filtros[config.minField]?.toString() ?? '',
  )
  const [maxValueLocal, setMaxValueLocal] = useState<string>(
    filtros[config.maxField]?.toString() ?? '',
  )

  // ✅ NOVO: Debounce dos valores para aplicação automática
  const debouncedMinValue = useDebounce(minValueLocal, 1000)
  const debouncedMaxValue = useDebounce(maxValueLocal, 1000)

  // Sincronizar quando filtros externos mudarem (ex: botão "Limpar Filtros")
  // ✅ CORREÇÃO: Usar apenas o campo específico, não 'filtros' completo
  useEffect(() => {
    const minValue = filtros[config.minField]
    setMinValueLocal(minValue?.toString() ?? '')
  }, [filtros[config.minField], config.minField])

  useEffect(() => {
    const maxValue = filtros[config.maxField]
    setMaxValueLocal(maxValue?.toString() ?? '')
  }, [filtros[config.maxField], config.maxField])

  // ✅ NOVO: Aplicar filtro automaticamente após debounce (valor mínimo)
  useEffect(() => {
    const numericValue = debouncedMinValue
      ? Number(debouncedMinValue)
      : undefined
    const currentValue = filtros[config.minField]

    // Só aplicar se valor realmente mudou
    if (numericValue !== currentValue) {
      onFiltrosChange((prev: TFilters) => ({
        ...prev,
        [config.minField]: numericValue,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMinValue])

  // ✅ NOVO: Aplicar filtro automaticamente após debounce (valor máximo)
  useEffect(() => {
    const numericValue = debouncedMaxValue
      ? Number(debouncedMaxValue)
      : undefined
    const currentValue = filtros[config.maxField]

    // Só aplicar se valor realmente mudou
    if (numericValue !== currentValue) {
      onFiltrosChange((prev: TFilters) => ({
        ...prev,
        [config.maxField]: numericValue,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMaxValue])

  // ✅ MANTIDO: onBlur para aplicação imediata se usuário sair do campo
  const handleMinBlur = useCallback(() => {
    const numericValue = minValueLocal ? Number(minValueLocal) : undefined

    onFiltrosChange((prev: TFilters) => ({
      ...prev,
      [config.minField]: numericValue,
    }))
  }, [minValueLocal, config.minField, onFiltrosChange])

  const handleMaxBlur = useCallback(() => {
    const numericValue = maxValueLocal ? Number(maxValueLocal) : undefined

    onFiltrosChange((prev: TFilters) => ({
      ...prev,
      [config.maxField]: numericValue,
    }))
  }, [maxValueLocal, config.maxField, onFiltrosChange])

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Campo Mínimo */}
      <div className="space-y-2">
        <Label
          htmlFor={`range-${String(config.minField)}`}
          className="text-muted-foreground text-xs"
        >
          {config.minLabel}
        </Label>
        <Input
          id={`range-${String(config.minField)}`}
          type="number"
          placeholder={config.minPlaceholder}
          value={minValueLocal}
          onChange={(e) => setMinValueLocal(e.target.value)}
          onBlur={handleMinBlur}
          step={config.step}
          min={config.min}
          max={config.max}
          className="h-9"
        />
      </div>

      {/* Campo Máximo */}
      <div className="space-y-2">
        <Label
          htmlFor={`range-${String(config.maxField)}`}
          className="text-muted-foreground text-xs"
        >
          {config.maxLabel}
        </Label>
        <Input
          id={`range-${String(config.maxField)}`}
          type="number"
          placeholder={config.maxPlaceholder}
          value={maxValueLocal}
          onChange={(e) => setMaxValueLocal(e.target.value)}
          onBlur={handleMaxBlur}
          step={config.step}
          min={config.min}
          max={config.max}
          className="h-9"
        />
      </div>
    </div>
  )
}
