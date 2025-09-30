import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Label } from '../label'

describe('Label', () => {
  describe('Renderização básica', () => {
    it('deve renderizar corretamente', () => {
      render(<Label data-testid="label">Test Label</Label>)

      const label = screen.getByTestId('label')
      expect(label).toBeInTheDocument()
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveTextContent('Test Label')
    })

    it('deve ter data-slot="label"', () => {
      render(<Label data-testid="label">Test Label</Label>)

      const label = screen.getByTestId('label')
      expect(label).toHaveAttribute('data-slot', 'label')
    })

    it('deve aplicar classes básicas', () => {
      render(<Label data-testid="label">Test Label</Label>)

      const label = screen.getByTestId('label')
      expect(label).toHaveClass('text-sm', 'font-medium')
    })
  })

  describe('Props e associação', () => {
    it('deve aceitar htmlFor', () => {
      render(
        <Label htmlFor="input-id" data-testid="label">
          Label
        </Label>,
      )

      const label = screen.getByTestId('label')
      expect(label).toHaveAttribute('for', 'input-id')
    })

    it('deve aceitar className customizada', () => {
      render(
        <Label className="custom-class" data-testid="label">
          Label
        </Label>,
      )

      const label = screen.getByTestId('label')
      expect(label).toHaveClass('custom-class')
    })

    it('deve funcionar com input associado', () => {
      render(
        <div>
          <Label htmlFor="test-input" data-testid="label">
            Nome
          </Label>
          <input id="test-input" data-testid="input" />
        </div>,
      )

      const label = screen.getByTestId('label')
      const input = screen.getByTestId('input')

      expect(label).toHaveAttribute('for', 'test-input')
      expect(input).toHaveAttribute('id', 'test-input')
    })
  })

  describe('Acessibilidade', () => {
    it('deve aceitar aria attributes', () => {
      render(
        <Label aria-describedby="help-text" data-testid="label">
          Label with help
        </Label>,
      )

      const label = screen.getByTestId('label')
      expect(label).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('deve suportar ref', () => {
      let labelRef: HTMLLabelElement | null = null

      render(
        <Label
          ref={(ref) => {
            labelRef = ref
          }}
          data-testid="label"
        >
          Ref Label
        </Label>,
      )

      expect(labelRef).toBeInstanceOf(HTMLLabelElement)
    })
  })
})
