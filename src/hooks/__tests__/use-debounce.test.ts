import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useDebounce } from '../use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Comportamento básico', () => {
    it('deve retornar valor inicial imediatamente', () => {
      const { result } = renderHook(() => useDebounce('initial', 500))

      expect(result.current).toBe('initial')
    })

    it('deve usar delay padrão de 400ms quando não especificado', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, undefined),
        {
          initialProps: { value: 'initial' },
        },
      )

      expect(result.current).toBe('initial')

      rerender({ value: 'changed' })
      expect(result.current).toBe('initial') // Ainda não atualizou

      act(() => {
        vi.advanceTimersByTime(400)
      })

      expect(result.current).toBe('changed')
    })

    it('deve atualizar valor após delay especificado', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'initial' },
        },
      )

      expect(result.current).toBe('initial')

      rerender({ value: 'updated' })
      expect(result.current).toBe('initial') // Ainda não atualizou

      act(() => {
        vi.advanceTimersByTime(299)
      })
      expect(result.current).toBe('initial') // Ainda não chegou no tempo

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe('updated') // Agora atualizou
    })
  })

  describe('Múltiplas mudanças', () => {
    it('deve cancelar timer anterior quando valor muda rapidamente', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' },
        },
      )

      expect(result.current).toBe('initial')

      // Primeira mudança
      rerender({ value: 'first' })
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe('initial') // Ainda não atualizou

      // Segunda mudança (deve cancelar a primeira)
      rerender({ value: 'second' })
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(result.current).toBe('initial') // Timer foi resetado

      // Terceira mudança
      rerender({ value: 'third' })
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(result.current).toBe('third') // Última mudança aplicada
    })

    it('deve lidar com múltiplas mudanças em sequência', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        {
          initialProps: { value: '0' },
        },
      )

      // Mudanças rápidas
      rerender({ value: '1' })
      rerender({ value: '2' })
      rerender({ value: '3' })
      rerender({ value: '4' })
      rerender({ value: '5' })

      expect(result.current).toBe('0') // Valor original

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current).toBe('5') // Última mudança aplicada
    })
  })

  describe('Tipos de valores', () => {
    it('deve funcionar com strings', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 200),
        {
          initialProps: { value: 'hello' },
        },
      )

      rerender({ value: 'world' })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current).toBe('world')
    })

    it('deve funcionar com números', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 200),
        {
          initialProps: { value: 42 },
        },
      )

      rerender({ value: 100 })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current).toBe(100)
    })

    it('deve funcionar com objetos', () => {
      const initialObj = { name: 'João', age: 30 }
      const updatedObj = { name: 'Maria', age: 25 }

      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 200),
        {
          initialProps: { value: initialObj },
        },
      )

      rerender({ value: updatedObj })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current).toEqual(updatedObj)
    })

    it('deve funcionar com arrays', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 200),
        {
          initialProps: { value: [1, 2, 3] },
        },
      )

      rerender({ value: [4, 5, 6] })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current).toEqual([4, 5, 6])
    })

    it('deve funcionar com valores boolean', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 200),
        {
          initialProps: { value: false },
        },
      )

      rerender({ value: true })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current).toBe(true)
    })

    it('deve funcionar com valores null e undefined', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 200),
        {
          initialProps: { value: null },
        },
      )

      rerender({ value: undefined })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current).toBeUndefined()
    })
  })

  describe('Mudanças de delay', () => {
    it('deve usar novo delay quando delay muda', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        },
      )

      rerender({ value: 'updated', delay: 100 })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current).toBe('updated')
    })

    it('deve resetar timer quando delay muda', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 },
        },
      )

      rerender({ value: 'changed', delay: 500 })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      // Mudar delay deve resetar o timer
      rerender({ value: 'changed', delay: 300 })

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe('initial') // Ainda não atualizou

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe('changed') // Agora atualizou
    })
  })

  describe('Cleanup', () => {
    it('deve cancelar timer quando componente é desmontado', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' },
        },
      )

      rerender({ value: 'updated' })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      unmount()

      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Valor não deve ter mudado após unmount
      expect(result.current).toBe('initial')
    })
  })

  describe('Casos extremos', () => {
    it('deve lidar com delay 0', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        {
          initialProps: { value: 'initial' },
        },
      )

      rerender({ value: 'immediate' })

      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(result.current).toBe('immediate')
    })

    it('deve lidar com delay negativo usando padrão', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, -100),
        {
          initialProps: { value: 'initial' },
        },
      )

      rerender({ value: 'updated' })

      // Como delay é negativo, deve usar comportamento padrão
      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(result.current).toBe('updated')
    })

    it('deve lidar com mudanças muito rápidas', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 1000),
        {
          initialProps: { value: 'start' },
        },
      )

      // 100 mudanças rápidas
      for (let i = 0; i < 100; i++) {
        rerender({ value: `value-${i}` })
      }

      expect(result.current).toBe('start')

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current).toBe('value-99')
    })
  })

  describe('Estabilidade de referência', () => {
    it('deve manter referência estável para objetos até update', () => {
      const obj1 = { id: 1, name: 'Test' }
      const obj2 = { id: 2, name: 'Updated' }

      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: obj1 },
        },
      )

      expect(result.current).toBe(obj1) // Mesma referência

      rerender({ value: obj2 })
      expect(result.current).toBe(obj1) // Ainda a referência original

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current).toBe(obj2) // Nova referência após debounce
    })
  })
})
