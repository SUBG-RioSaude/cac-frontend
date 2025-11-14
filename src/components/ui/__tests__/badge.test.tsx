import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Badge, badgeVariants } from '../badge'

describe('Badge', () => {
  describe('renderização básica', () => {
    it('deve renderizar o badge corretamente', () => {
      render(<Badge>Test Badge</Badge>)

      const badge = screen.getByText('Test Badge')
      expect(badge).toBeInTheDocument()
    })

    it('deve renderizar como span por padrão', () => {
      render(<Badge data-testid="badge">Badge</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge.tagName).toBe('SPAN')
    })

    it('deve aplicar className customizada', () => {
      render(
        <Badge className="custom-class" data-testid="badge">
          Badge
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('custom-class')
    })

    it('deve ter data-slot="badge"', () => {
      render(<Badge data-testid="badge">Badge</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-slot', 'badge')
    })
  })

  describe('variants', () => {
    it('deve aplicar variant default por padrão', () => {
      render(<Badge data-testid="badge">Default Badge</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-primary',
        'text-primary-foreground',
      )
    })

    it('deve aplicar variant secondary', () => {
      render(
        <Badge variant="secondary" data-testid="badge">
          Secondary
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-secondary',
        'text-secondary-foreground',
      )
    })

    it('deve aplicar variant destructive', () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          Destructive
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-destructive',
        'text-white',
      )
    })

    it('deve aplicar variant outline', () => {
      render(
        <Badge variant="outline" data-testid="badge">
          Outline
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-foreground')
    })
  })

  describe('classes padrão', () => {
    it('deve aplicar todas as classes base', () => {
      render(<Badge data-testid="badge">Badge</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'border',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-medium',
        'w-fit',
        'whitespace-nowrap',
        'shrink-0',
      )
    })

    it('deve ter estilos de foco e acessibilidade', () => {
      render(<Badge data-testid="badge">Badge</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]',
      )
    })

    it('deve ter estilos para SVG icons', () => {
      render(<Badge data-testid="badge">Badge</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        '[&>svg]:size-3',
        'gap-1',
        '[&>svg]:pointer-events-none',
      )
    })
  })

  describe('asChild', () => {
    it('deve renderizar como Slot quando asChild=true', () => {
      render(
        <Badge asChild>
          <a href="/test" data-testid="badge-link">
            Link Badge
          </a>
        </Badge>,
      )

      const link = screen.getByTestId('badge-link')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('bg-primary') // Classes do badge devem ser aplicadas
    })

    it('deve renderizar botão como badge quando asChild=true', () => {
      render(
        <Badge asChild variant="secondary">
          <button type="button" data-testid="badge-button">
            Button Badge
          </button>
        </Badge>,
      )

      const button = screen.getByTestId('badge-button')
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveClass('bg-secondary')
    })
  })

  describe('acessibilidade', () => {
    it('deve aceitar props de acessibilidade', () => {
      render(
        <Badge aria-label="Status badge" data-testid="badge">
          Active
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
    })

    it('deve ter role correto quando necessário', () => {
      render(
        <Badge role="status" data-testid="badge">
          Loading...
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('role', 'status')
    })
  })

  describe('conteúdo', () => {
    it('deve renderizar texto', () => {
      render(<Badge>Status: Active</Badge>)

      expect(screen.getByText('Status: Active')).toBeInTheDocument()
    })

    it('deve renderizar números', () => {
      render(<Badge>42</Badge>)

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('deve renderizar com ícones', () => {
      render(
        <Badge data-testid="badge">
          <svg data-testid="icon" width="12" height="12">
            <circle cx="6" cy="6" r="6" />
          </svg>
          With Icon
        </Badge>,
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('With Icon')).toBeInTheDocument()
    })

    it('deve renderizar apenas ícone', () => {
      render(
        <Badge data-testid="badge">
          <svg data-testid="icon-only" width="12" height="12">
            <circle cx="6" cy="6" r="6" />
          </svg>
        </Badge>,
      )

      expect(screen.getByTestId('icon-only')).toBeInTheDocument()
    })
  })

  describe('responsividade', () => {
    it('deve manter tamanho fixo com w-fit', () => {
      render(<Badge data-testid="badge">Very Long Badge Text Here</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('w-fit', 'whitespace-nowrap')
    })

    it('deve evitar shrinking com shrink-0', () => {
      render(<Badge data-testid="badge">Badge</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('shrink-0')
    })
  })

  describe('estados especiais', () => {
    it('deve ter estilos de hover quando usado como link (asChild)', () => {
      render(
        <Badge asChild variant="default">
          <a href="/test" data-testid="badge">
            Hoverable Badge
          </a>
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('[a&]:hover:bg-primary/90')
    })

    it('deve ter estilos de focus-visible para destructive', () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          Destructive
        </Badge>,
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('focus-visible:ring-destructive/20')
    })
  })
})

describe('badgeVariants', () => {
  it('deve retornar classes corretas para variant default', () => {
    const classes = badgeVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
  })

  it('deve retornar classes corretas para cada variant', () => {
    const secondary = badgeVariants({ variant: 'secondary' })
    expect(secondary).toContain('bg-secondary')

    const destructive = badgeVariants({ variant: 'destructive' })
    expect(destructive).toContain('bg-destructive')

    const outline = badgeVariants({ variant: 'outline' })
    expect(outline).toContain('text-foreground')
  })

  it('deve aplicar className customizada', () => {
    const classes = badgeVariants({ className: 'custom-badge' })
    expect(classes).toContain('custom-badge')
  })

  it('deve incluir todas as classes base independente da variant', () => {
    const classes = badgeVariants({ variant: 'outline' })
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('rounded-full')
    expect(classes).toContain('text-xs')
  })
})
