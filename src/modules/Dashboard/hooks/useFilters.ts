/**
 * ==========================================
 * HOOK DE FILTROS DO DASHBOARD
 * ==========================================
 * Gerencia estado dos filtros com persistência na sessão
 */

import { useState, useCallback, useEffect } from 'react'

import type { DashboardFilters, UseFiltersResult } from '../types/dashboard'
import { defaultFilters, hasActiveFilters } from '../utils/dashboard-utils'

const STORAGE_KEY = 'dashboard-filters'

/**
 * Hook para gerenciar filtros do dashboard com persistência
 */
export const useFilters = (): UseFiltersResult => {
  const [filters, setFilters] = useState<DashboardFilters>(() => {
    // Carregar filtros salvos da sessionStorage
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { periodo: unknown; unidades: unknown; status: unknown; tipos: unknown }
        // Validar estrutura básica
        if (
          parsed.periodo &&
          parsed.unidades &&
          parsed.status &&
          parsed.tipos
        ) {
          return parsed as DashboardFilters
        }
      }
    } catch {
      // Error loading saved filters
    }

    return defaultFilters
  })

  // Salvar filtros na sessionStorage sempre que mudarem
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    } catch {
      // Error saving filters
    }
  }, [filters])

  /**
   * Atualiza um filtro específico
   */
  const updateFilter = useCallback(
    <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    [],
  )

  /**
   * Reset filtros para valores padrão
   */
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  /**
   * Verifica se há filtros ativos
   */
  const hasActive = hasActiveFilters(filters)

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters: hasActive,
  }
}
