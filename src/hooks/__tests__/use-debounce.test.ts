import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDebounce } from '../use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('deve retornar valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('deve debounce mudanças de valor', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Muda o valor
    rerender({ value: 'changed', delay: 500 })
    
    // Valor ainda deve ser o inicial
    expect(result.current).toBe('initial')

    // Avança o tempo em metade do delay
    act(() => {
      vi.advanceTimersByTime(250)
    })
    
    // Ainda deve ser o valor inicial
    expect(result.current).toBe('initial')

    // Avança o tempo para completar o delay
    act(() => {
      vi.advanceTimersByTime(250)
    })
    
    // Agora deve ter o novo valor
    expect(result.current).toBe('changed')
  })

  it('deve cancelar timer anterior quando valor muda rapidamente', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Primeira mudança
    rerender({ value: 'first-change' })
    
    // Avança tempo parcialmente
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Segunda mudança antes do timer anterior completar
    rerender({ value: 'second-change' })
    
    // Avança o tempo restante do primeiro timer
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    // Valor ainda deve ser o inicial porque o timer foi cancelado
    expect(result.current).toBe('initial')
    
    // Avança o tempo para o novo timer
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Agora deve ter o segundo valor
    expect(result.current).toBe('second-change')
  })

  it('deve usar delay padrão de 400ms quando não especificado', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'changed' })

    // Avança menos que 400ms
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current).toBe('initial')

    // Avança para completar os 400ms
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current).toBe('changed')
  })

  it('deve funcionar com diferentes tipos de dados', () => {
    // Teste com números
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    )

    numberRerender({ value: 42 })
    act(() => { vi.advanceTimersByTime(100) })
    expect(numberResult.current).toBe(42)

    // Teste com objetos
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { name: 'initial' } } }
    )

    const newObject = { name: 'changed' }
    objectRerender({ value: newObject })
    act(() => { vi.advanceTimersByTime(100) })
    expect(objectResult.current).toBe(newObject)

    // Teste com arrays
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: [1, 2, 3] } }
    )

    const newArray = [4, 5, 6]
    arrayRerender({ value: newArray })
    act(() => { vi.advanceTimersByTime(100) })
    expect(arrayResult.current).toBe(newArray)
  })

  it('deve atualizar delay dinamicamente', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Muda valor e delay
    rerender({ value: 'changed', delay: 200 })

    // Avança usando o novo delay
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    expect(result.current).toBe('changed')
  })

  it('deve limpar timeout na desmontagem', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'changed' })
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    
    clearTimeoutSpy.mockRestore()
  })

  it('deve lidar com valores undefined e null', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'initial' as string | null | undefined } }
    )

    // Teste com null
    rerender({ value: null })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBeNull()

    // Teste com undefined
    rerender({ value: undefined })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBeUndefined()
  })

  it('deve funcionar com delay zero', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'changed' })
    
    // Com delay 0, deve atualizar imediatamente após próximo tick
    act(() => {
      vi.advanceTimersByTime(0)
    })
    
    expect(result.current).toBe('changed')
  })

  it('deve manter referência quando valor não muda', () => {
    const initialValue = { name: 'test' }
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: initialValue } }
    )

    expect(result.current).toBe(initialValue)

    // Re-renderiza com o mesmo valor
    rerender({ value: initialValue })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    // Deve manter a mesma referência
    expect(result.current).toBe(initialValue)
  })
})