import { useCallback, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { RangeConfig } from '../../types'

interface RangeFieldProps<TFilters> {
  config: RangeConfig<TFilters>
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters) => void
  isMobile?: boolean
}

/**
 * Campo de range (valores min/max) com fix de perda de foco
 *
 * SOLUÇÃO DO PROBLEMA:
 * - Usa estados locais (minValueLocal, maxValueLocal) para armazenar valores durante digitação
 * - Atualiza o estado pai apenas no onBlur (quando o usuário sai do campo)
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

  // Sincronizar quando filtros externos mudarem (ex: botão "Limpar Filtros")
  useEffect(() => {
    setMinValueLocal(filtros[config.minField]?.toString() ?? '')
  }, [filtros, config.minField])

  useEffect(() => {
    setMaxValueLocal(filtros[config.maxField]?.toString() ?? '')
  }, [filtros, config.maxField])

  // ✅ SOLUÇÃO: Atualizar filtros pai apenas no blur (evita re-render durante digitação)
  const handleMinBlur = useCallback(() => {
    const numericValue = minValueLocal ? Number(minValueLocal) : undefined

    // Apenas atualiza se o valor mudou (evita re-renders desnecessários)
    if (numericValue !== filtros[config.minField]) {
      onFiltrosChange({
        ...filtros,
        [config.minField]: numericValue,
      })
    }
  }, [minValueLocal, filtros, config.minField, onFiltrosChange])

  const handleMaxBlur = useCallback(() => {
    const numericValue = maxValueLocal ? Number(maxValueLocal) : undefined

    if (numericValue !== filtros[config.maxField]) {
      onFiltrosChange({
        ...filtros,
        [config.maxField]: numericValue,
      })
    }
  }, [maxValueLocal, filtros, config.maxField, onFiltrosChange])

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
