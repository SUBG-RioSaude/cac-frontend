import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Alert, AlertTitle, AlertDescription } from '../alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('deve renderizar corretamente', () => {
      render(<Alert data-testid="alert">Alert content</Alert>)

      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Alert content')
    })

    it('deve ter role="alert" por padrão', () => {
      render(<Alert data-testid="alert">Alert</Alert>)

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('role', 'alert')
    })

    it('deve aplicar classes padrão', () => {
      render(<Alert data-testid="alert">Alert</Alert>)

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'px-4',
        'py-3',
        'text-sm',
        'grid',
      )
    })

    it('deve ter data-slot="alert"', () => {
      render(<Alert data-testid="alert">Alert</Alert>)

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('data-slot', 'alert')
    })

    it('deve aceitar className customizada', () => {
      render(
        <Alert className="custom-alert" data-testid="alert">
          Alert
        </Alert>,
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass('custom-alert')
    })

    it('deve aceitar props HTML nativas', () => {
      render(
        <Alert id="my-alert" data-testid="alert">
          Alert
        </Alert>,
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('id', 'my-alert')
    })
  })

  describe('variants', () => {
    it('deve aplicar variant default por padrão', () => {
      render(<Alert data-testid="alert">Default Alert</Alert>)

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass('bg-card', 'text-card-foreground')
    })

    it('deve aplicar variant destructive', () => {
      render(
        <Alert variant="destructive" data-testid="alert">
          Error Alert
        </Alert>,
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass('text-destructive', 'bg-card')
    })
  })

  describe('AlertTitle', () => {
    it('deve renderizar título corretamente', () => {
      render(<AlertTitle data-testid="title">Alert Title</AlertTitle>)

      const title = screen.getByTestId('title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Alert Title')
    })

    it('deve aplicar classes padrão', () => {
      render(<AlertTitle data-testid="title">Title</AlertTitle>)

      const title = screen.getByTestId('title')
      expect(title).toHaveClass(
        'line-clamp-1',
        'min-h-4',
        'font-medium',
        'tracking-tight',
      )
    })

    it('deve ter data-slot="alert-title"', () => {
      render(<AlertTitle data-testid="title">Title</AlertTitle>)

      const title = screen.getByTestId('title')
      expect(title).toHaveAttribute('data-slot', 'alert-title')
    })

    it('deve aceitar className customizada', () => {
      render(
        <AlertTitle className="custom-title" data-testid="title">
          Title
        </AlertTitle>,
      )

      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('AlertDescription', () => {
    it('deve renderizar descrição corretamente', () => {
      render(
        <AlertDescription data-testid="description">
          Alert description
        </AlertDescription>,
      )

      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Alert description')
    })

    it('deve aplicar classes padrão', () => {
      render(
        <AlertDescription data-testid="description">
          Description
        </AlertDescription>,
      )

      const description = screen.getByTestId('description')
      expect(description).toHaveClass(
        'text-muted-foreground',
        'grid',
        'justify-items-start',
        'gap-1',
        'text-sm',
      )
    })

    it('deve ter data-slot="alert-description"', () => {
      render(
        <AlertDescription data-testid="description">
          Description
        </AlertDescription>,
      )

      const description = screen.getByTestId('description')
      expect(description).toHaveAttribute('data-slot', 'alert-description')
    })

    it('deve aceitar className customizada', () => {
      render(
        <AlertDescription className="custom-desc" data-testid="description">
          Description
        </AlertDescription>,
      )

      const description = screen.getByTestId('description')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('Alert Composition', () => {
    it('deve renderizar alert completo com título e descrição', () => {
      render(
        <Alert data-testid="complete-alert">
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is an informational alert message.
          </AlertDescription>
        </Alert>,
      )

      const alert = screen.getByTestId('complete-alert')
      expect(alert).toBeInTheDocument()

      expect(screen.getByText('Information')).toBeInTheDocument()
      expect(
        screen.getByText('This is an informational alert message.'),
      ).toBeInTheDocument()
    })

    it('deve renderizar alert com ícone', () => {
      render(
        <Alert data-testid="alert-with-icon">
          <svg data-testid="alert-icon" width="16" height="16">
            <circle cx="8" cy="8" r="8" />
          </svg>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>This alert has an icon.</AlertDescription>
        </Alert>,
      )

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('This alert has an icon.')).toBeInTheDocument()
    })

    it('deve manter estrutura semântica correta', () => {
      render(
        <Alert>
          <AlertTitle data-testid="title">Title</AlertTitle>
          <AlertDescription data-testid="description">
            Description
          </AlertDescription>
        </Alert>,
      )

      const title = screen.getByTestId('title')
      const description = screen.getByTestId('description')
      const alert = screen.getByRole('alert')

      expect(alert).toContainElement(title)
      expect(alert).toContainElement(description)
    })
  })

  describe('estilos para ícones', () => {
    it('deve aplicar estilos corretos quando há ícone SVG', () => {
      render(
        <Alert data-testid="alert">
          <svg data-testid="icon" width="16" height="16">
            <circle cx="8" cy="8" r="8" />
          </svg>
          Alert with icon
        </Alert>,
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass(
        'has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]',
      )
      expect(alert).toHaveClass('has-[>svg]:gap-x-3')
      expect(alert).toHaveClass('[&>svg]:size-4')
      expect(alert).toHaveClass('[&>svg]:translate-y-0.5')
    })

    it('deve ter layout diferente sem ícone', () => {
      render(<Alert data-testid="alert">Alert without icon</Alert>)

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass('grid-cols-[1fr]')
    })
  })

  describe('diferentes tipos de conteúdo', () => {
    it('deve renderizar apenas título', () => {
      render(
        <Alert>
          <AlertTitle>Only Title</AlertTitle>
        </Alert>,
      )

      expect(screen.getByText('Only Title')).toBeInTheDocument()
    })

    it('deve renderizar apenas descrição', () => {
      render(
        <Alert>
          <AlertDescription>Only description text</AlertDescription>
        </Alert>,
      )

      expect(screen.getByText('Only description text')).toBeInTheDocument()
    })

    it('deve renderizar texto simples sem componentes', () => {
      render(<Alert>Simple text alert</Alert>)

      expect(screen.getByText('Simple text alert')).toBeInTheDocument()
    })

    it('deve renderizar conteúdo complexo', () => {
      render(
        <Alert>
          <AlertTitle>Complex Alert</AlertTitle>
          <AlertDescription>
            <p>This alert has multiple paragraphs.</p>
            <p>And different types of content.</p>
          </AlertDescription>
        </Alert>,
      )

      expect(screen.getByText('Complex Alert')).toBeInTheDocument()
      expect(
        screen.getByText('This alert has multiple paragraphs.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('And different types of content.'),
      ).toBeInTheDocument()
    })
  })

  describe('casos de uso específicos', () => {
    it('deve renderizar alert de erro', () => {
      render(
        <Alert variant="destructive" data-testid="error-alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong!</AlertDescription>
        </Alert>,
      )

      const alert = screen.getByTestId('error-alert')
      expect(alert).toHaveClass('text-destructive')
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
    })

    it('deve renderizar alert informativo', () => {
      render(
        <Alert data-testid="info-alert">
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Here is some important information.
          </AlertDescription>
        </Alert>,
      )

      const alert = screen.getByTestId('info-alert')
      expect(alert).toHaveClass('bg-card', 'text-card-foreground')
      expect(screen.getByText('Information')).toBeInTheDocument()
    })

    it('deve renderizar alert de sucesso customizado', () => {
      render(
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully!</AlertDescription>
        </Alert>,
      )

      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(
        screen.getByText('Operation completed successfully!'),
      ).toBeInTheDocument()
    })
  })

  describe('acessibilidade', () => {
    it('deve ter role alert para screen readers', () => {
      render(<Alert>Important message</Alert>)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('deve ser anunciado por screen readers', () => {
      render(<Alert aria-live="polite">Dynamic content</Alert>)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })

    it('deve aceitar aria-label para contexto adicional', () => {
      render(<Alert aria-label="System notification">Alert content</Alert>)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-label', 'System notification')
    })
  })
})
