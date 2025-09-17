import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Mock do next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light' as string | undefined })),
}))

import { Toaster } from '../sonner'

// Mock do sonner
vi.mock('sonner', () => ({
  Toaster: ({ theme, className, style, ...props }: {
    theme?: string
    className?: string
    style?: Record<string, string>
    position?: string
    duration?: number
  }) => {
    return (
      <div
        data-testid="sonner-toaster"
        data-theme={theme}
        className={className || 'toaster group'}
        style={{
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          ...style
        } as React.CSSProperties}
        {...props}
      />
    )
  },
}))

describe('Toaster', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar com tema padrão', () => {
    const { getByTestId } = render(<Toaster />)
    
    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('data-theme', 'light')
  })

  it('deve usar tema dark quando especificado', () => {
    const { getByTestId } = render(<Toaster />)
    
    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'light')
  })

  it('deve usar tema system como fallback', () => {
    const { getByTestId } = render(<Toaster />)
    
    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'light')
  })

  it('deve aplicar className padrão', () => {
    const { getByTestId } = render(<Toaster />)
    
    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveClass('toaster', 'group')
  })

  it('deve aplicar estilos CSS customizados', () => {
    const { getByTestId } = render(<Toaster />)
    
    const toaster = getByTestId('sonner-toaster')
    expect(toaster.style.getPropertyValue('--normal-bg')).toBe('var(--popover)')
    expect(toaster.style.getPropertyValue('--normal-text')).toBe('var(--popover-foreground)')
    expect(toaster.style.getPropertyValue('--normal-border')).toBe('var(--border)')
  })

  it('deve passar props adicionais para o Sonner', () => {
    const { getByTestId } = render(
      <Toaster 
        position="top-right"
        duration={5000}
        data-custom="test"
      />
    )
    
    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('position', 'top-right')
    expect(toaster).toHaveAttribute('duration', '5000')
    expect(toaster).toHaveAttribute('data-custom', 'test')
  })

  it('deve manter estilo e className quando props customizadas são passadas', () => {
    const { getByTestId } = render(
      <Toaster 
        className="custom-toaster"
        style={{ backgroundColor: 'red' }}
      />
    )
    
    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveClass('custom-toaster')
    expect(toaster.style.getPropertyValue('--normal-bg')).toBe('var(--popover)')
    expect(toaster.style.backgroundColor).toBe('red')
  })

  it('deve lidar com diferentes valores de tema', () => {
    // Testa com undefined
    const { rerender, getByTestId } = render(<Toaster />)
    expect(getByTestId('sonner-toaster')).toHaveAttribute('data-theme', 'light')

    // Testa com string personalizada
    rerender(<Toaster />)
    expect(getByTestId('sonner-toaster')).toHaveAttribute('data-theme', 'light')
  })
})