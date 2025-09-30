import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { Button, buttonVariants } from '../button'

describe('Button', () => {
  describe('renderização básica', () => {
    it('deve renderizar o botão corretamente', () => {
      render(<Button>Test Button</Button>)

      const button = screen.getByRole('button', { name: 'Test Button' })
      expect(button).toBeInTheDocument()
    })

    it('deve aplicar className customizada', () => {
      render(<Button className="custom-class">Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('deve ter data-slot="button" por padrão', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('variants', () => {
    it('deve aplicar variant default por padrão', () => {
      render(<Button>Default Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('deve aplicar variant destructive', () => {
      render(<Button variant="destructive">Delete</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'text-white')
    })

    it('deve aplicar variant outline', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'bg-background')
    })

    it('deve aplicar variant secondary', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('deve aplicar variant ghost', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('deve aplicar variant link', () => {
      render(<Button variant="link">Link</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })

    it('deve aplicar variant success', () => {
      render(<Button variant="success">Success</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-green-600', 'text-white')
    })

    it('deve aplicar variant warning', () => {
      render(<Button variant="warning">Warning</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-yellow-500', 'text-white')
    })

    it('deve aplicar variant info', () => {
      render(<Button variant="info">Info</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600', 'text-white')
    })

    it('deve aplicar variant neutral', () => {
      render(<Button variant="neutral">Neutral</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-600', 'text-white')
    })
  })

  describe('sizes', () => {
    it('deve aplicar size default por padrão', () => {
      render(<Button>Default Size</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'px-4', 'py-2')
    })

    it('deve aplicar size sm', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'px-3')
    })

    it('deve aplicar size lg', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-6')
    })

    it('deve aplicar size icon', () => {
      render(<Button size="icon">🔥</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('size-9')
    })
  })

  describe('estados', () => {
    it('deve estar habilitado por padrão', () => {
      render(<Button>Enabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeEnabled()
    })

    it('deve aplicar estado desabilitado', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass(
        'disabled:pointer-events-none',
        'disabled:opacity-50',
      )
    })
  })

  describe('comportamento', () => {
    it('deve executar onClick quando clicado', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Clickable</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('não deve executar onClick quando desabilitado', () => {
      const handleClick = vi.fn()
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('asChild', () => {
    it('deve renderizar como Slot quando asChild=true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      )

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('bg-primary') // Classes do button devem ser aplicadas
    })
  })

  describe('acessibilidade', () => {
    it('deve ter role button por padrão', () => {
      render(<Button>Accessible</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('deve aceitar aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>)

      const button = screen.getByRole('button', { name: 'Close dialog' })
      expect(button).toBeInTheDocument()
    })

    it('deve ter focus-visible styles', () => {
      render(<Button>Focusable</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:ring-ring/50')
    })
  })

  describe('combinações de props', () => {
    it('deve combinar variant e size corretamente', () => {
      render(
        <Button variant="destructive" size="lg">
          Large Delete
        </Button>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'h-10', 'px-6')
    })

    it('deve permitir sobrescrever classes com className', () => {
      render(
        <Button className="bg-purple-500" variant="destructive">
          Custom
        </Button>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-purple-500')
    })
  })
})

describe('buttonVariants', () => {
  it('deve retornar classes corretas para variant default', () => {
    const classes = buttonVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
  })

  it('deve retornar classes corretas para variant e size específicos', () => {
    const classes = buttonVariants({ variant: 'outline', size: 'sm' })
    expect(classes).toContain('border')
    expect(classes).toContain('h-8')
  })

  it('deve aplicar className customizada', () => {
    const classes = buttonVariants({ className: 'custom-class' })
    expect(classes).toContain('custom-class')
  })
})
