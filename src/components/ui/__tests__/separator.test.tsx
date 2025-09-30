import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Separator } from '../separator'

describe('Separator', () => {
  describe('Renderização básica', () => {
    it('deve renderizar corretamente', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      // Radix UI Separator tem role none por padrão quando decorative=true
      expect(separator).toHaveAttribute('data-slot', 'separator')
    })

    it('deve ter data-slot="separator"', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('data-slot', 'separator')
    })

    it('deve aplicar classes padrão horizontais', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('shrink-0')
      expect(separator).toHaveClass('data-[orientation=horizontal]:h-px')
      expect(separator).toHaveClass('data-[orientation=horizontal]:w-full')
    })
  })

  describe('Orientação', () => {
    it('deve renderizar horizontalmente por padrão', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('deve renderizar verticalmente quando especificado', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('data-orientation', 'vertical')
      expect(separator).toHaveClass('data-[orientation=vertical]:h-full')
      expect(separator).toHaveClass('data-[orientation=vertical]:w-px')
    })
  })

  describe('Props customizadas', () => {
    it('deve aceitar className customizada', () => {
      render(<Separator className="custom-separator" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('custom-separator')
    })

    it('deve aceitar decorative prop', () => {
      render(<Separator decorative data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      // Radix UI gerencia decorative internamente
      expect(separator).toHaveAttribute('data-orientation', 'horizontal')
    })
  })

  describe('Casos de uso', () => {
    it('deve funcionar como divisor de seções', () => {
      render(
        <div>
          <div>Seção 1</div>
          <Separator data-testid="separator" />
          <div>Seção 2</div>
        </div>,
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(screen.getByText('Seção 1')).toBeInTheDocument()
      expect(screen.getByText('Seção 2')).toBeInTheDocument()
    })

    it('deve funcionar em menu vertical', () => {
      render(
        <div className="flex">
          <span>Item 1</span>
          <Separator orientation="vertical" data-testid="separator" />
          <span>Item 2</span>
        </div>,
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('data-orientation', 'vertical')
    })
  })
})
