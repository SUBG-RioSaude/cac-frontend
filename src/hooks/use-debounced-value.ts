import { useEffect, useState } from 'react'

/**
 * Hook para debounce de valores
 * Útil para evitar chamadas excessivas de API ao digitar/filtrar
 *
 * @param value - Valor a ser debouncado
 * @param delay - Delay em milissegundos (default: 500ms)
 * @returns Valor debouncado
 *
 * @example
 * const debouncedSearch = useDebouncedValue(searchTerm, 500)
 * useEffect(() => {
 *   // API call com searchTerm debouncado
 * }, [debouncedSearch])
 */
export const useDebouncedValue = <T,>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Cria timer para atualizar o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpa timer anterior se valor mudar antes do delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
