import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('deve renderizar corretamente', () => {
      render(<Card data-testid="card">Card Content</Card>)

      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('Card Content')
    })

    it('deve aplicar classes padrão', () => {
      render(<Card data-testid="card">Content</Card>)

      const card = screen.getByTestId('card')
      expect(card).toHaveClass(
        'bg-card',
        'text-card-foreground',
        'flex',
        'flex-col',
        'gap-6',
        'rounded-xl',
        'border',
        'py-6',
        'shadow-sm',
      )
    })

    it('deve ter data-slot="card"', () => {
      render(<Card data-testid="card">Content</Card>)

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('deve aceitar className customizada', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>,
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('deve aceitar props HTML nativas', () => {
      render(
        <Card id="my-card" data-testid="card">
          Content
        </Card>,
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('id', 'my-card')
    })
  })

  describe('CardHeader', () => {
    it('deve renderizar corretamente', () => {
      render(<CardHeader data-testid="header">Header Content</CardHeader>)

      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('Header Content')
    })

    it('deve aplicar classes padrão', () => {
      render(<CardHeader data-testid="header">Content</CardHeader>)

      const header = screen.getByTestId('header')
      expect(header).toHaveClass(
        '@container/card-header',
        'grid',
        'auto-rows-min',
        'grid-rows-[auto_auto]',
        'items-start',
        'gap-1.5',
        'px-6',
      )
    })

    it('deve ter data-slot="card-header"', () => {
      render(<CardHeader data-testid="header">Content</CardHeader>)

      const header = screen.getByTestId('header')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })
  })

  describe('CardTitle', () => {
    it('deve renderizar corretamente', () => {
      render(<CardTitle data-testid="title">Card Title</CardTitle>)

      const title = screen.getByTestId('title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Card Title')
    })

    it('deve aplicar classes padrão', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)

      const title = screen.getByTestId('title')
      expect(title).toHaveClass('leading-none', 'font-semibold')
    })

    it('deve ter data-slot="card-title"', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)

      const title = screen.getByTestId('title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })
  })

  describe('CardDescription', () => {
    it('deve renderizar corretamente', () => {
      render(
        <CardDescription data-testid="description">
          Description text
        </CardDescription>,
      )

      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Description text')
    })

    it('deve aplicar classes padrão', () => {
      render(
        <CardDescription data-testid="description">
          Description
        </CardDescription>,
      )

      const description = screen.getByTestId('description')
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    })

    it('deve ter data-slot="card-description"', () => {
      render(
        <CardDescription data-testid="description">
          Description
        </CardDescription>,
      )

      const description = screen.getByTestId('description')
      expect(description).toHaveAttribute('data-slot', 'card-description')
    })
  })

  describe('CardAction', () => {
    it('deve renderizar corretamente', () => {
      render(<CardAction data-testid="action">Action Content</CardAction>)

      const action = screen.getByTestId('action')
      expect(action).toBeInTheDocument()
      expect(action).toHaveTextContent('Action Content')
    })

    it('deve aplicar classes padrão', () => {
      render(<CardAction data-testid="action">Action</CardAction>)

      const action = screen.getByTestId('action')
      expect(action).toHaveClass(
        'col-start-2',
        'row-span-2',
        'row-start-1',
        'self-start',
        'justify-self-end',
      )
    })

    it('deve ter data-slot="card-action"', () => {
      render(<CardAction data-testid="action">Action</CardAction>)

      const action = screen.getByTestId('action')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })
  })

  describe('CardContent', () => {
    it('deve renderizar corretamente', () => {
      render(<CardContent data-testid="content">Main content</CardContent>)

      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Main content')
    })

    it('deve aplicar classes padrão', () => {
      render(<CardContent data-testid="content">Content</CardContent>)

      const content = screen.getByTestId('content')
      expect(content).toHaveClass('px-6')
    })

    it('deve ter data-slot="card-content"', () => {
      render(<CardContent data-testid="content">Content</CardContent>)

      const content = screen.getByTestId('content')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })
  })

  describe('CardFooter', () => {
    it('deve renderizar corretamente', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>)

      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveTextContent('Footer content')
    })

    it('deve aplicar classes padrão', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)

      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    })

    it('deve ter data-slot="card-footer"', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)

      const footer = screen.getByTestId('footer')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
    })
  })

  describe('Card Composition', () => {
    it('deve renderizar card completo com todos os componentes', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
            <CardAction>
              <button type="button">Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button type="button">Footer Button</button>
          </CardFooter>
        </Card>,
      )

      const card = screen.getByTestId('complete-card')
      expect(card).toBeInTheDocument()

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Footer Button' }),
      ).toBeInTheDocument()
    })

    it('deve manter estrutura semântica correta', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>,
      )

      const card = screen.getByText('Title').closest('[data-slot="card"]')
      const header = screen
        .getByText('Title')
        .closest('[data-slot="card-header"]')
      const content = screen
        .getByText('Content')
        .closest('[data-slot="card-content"]')

      expect(card).toContainElement(header)
      expect(card).toContainElement(content)
    })
  })

  describe('Customização', () => {
    it('deve permitir sobrescrever classes em todos os componentes', () => {
      render(
        <Card className="card-custom" data-testid="card">
          <CardHeader className="header-custom" data-testid="header">
            <CardTitle className="title-custom" data-testid="title">
              Title
            </CardTitle>
            <CardDescription className="desc-custom" data-testid="description">
              Desc
            </CardDescription>
            <CardAction className="action-custom" data-testid="action">
              Action
            </CardAction>
          </CardHeader>
          <CardContent className="content-custom" data-testid="content">
            Content
          </CardContent>
          <CardFooter className="footer-custom" data-testid="footer">
            Footer
          </CardFooter>
        </Card>,
      )

      expect(screen.getByTestId('card')).toHaveClass('card-custom')
      expect(screen.getByTestId('header')).toHaveClass('header-custom')
      expect(screen.getByTestId('title')).toHaveClass('title-custom')
      expect(screen.getByTestId('description')).toHaveClass('desc-custom')
      expect(screen.getByTestId('action')).toHaveClass('action-custom')
      expect(screen.getByTestId('content')).toHaveClass('content-custom')
      expect(screen.getByTestId('footer')).toHaveClass('footer-custom')
    })
  })
})
