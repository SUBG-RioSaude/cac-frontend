import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  describe('Renderização básica', () => {
    it('deve renderizar corretamente', () => {
      render(<Skeleton data-testid="skeleton" />)

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    it('deve ter data-slot="skeleton"', () => {
      render(<Skeleton data-testid="skeleton" />)

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
    })

    it('deve aplicar classes de animação', () => {
      render(<Skeleton data-testid="skeleton" />)

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-pulse', 'rounded-md')
    })
  })

  describe('Props customizadas', () => {
    it('deve aceitar className customizada', () => {
      render(<Skeleton className="custom-skeleton" data-testid="skeleton" />)

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('custom-skeleton')
    })

    it('deve aceitar styles inline', () => {
      render(
        <Skeleton
          style={{ width: '200px', height: '20px' }}
          data-testid="skeleton"
        />,
      )

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute(
        'style',
        expect.stringContaining('width: 200px'),
      )
      expect(skeleton).toHaveAttribute(
        'style',
        expect.stringContaining('height: 20px'),
      )
    })

    it('deve aceitar data attributes', () => {
      render(<Skeleton data-loading="true" data-testid="skeleton" />)

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('Casos de uso comuns', () => {
    it('deve funcionar para skeleton de texto', () => {
      render(
        <div>
          <Skeleton className="h-4 w-[250px]" data-testid="text-skeleton" />
          <Skeleton className="h-4 w-[200px]" data-testid="text-skeleton-2" />
        </div>,
      )

      const skeleton1 = screen.getByTestId('text-skeleton')
      const skeleton2 = screen.getByTestId('text-skeleton-2')

      expect(skeleton1).toHaveClass('h-4', 'w-[250px]')
      expect(skeleton2).toHaveClass('h-4', 'w-[200px]')
    })

    it('deve funcionar para skeleton de avatar', () => {
      render(
        <Skeleton
          className="h-12 w-12 rounded-full"
          data-testid="avatar-skeleton"
        />,
      )

      const skeleton = screen.getByTestId('avatar-skeleton')
      expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full')
    })

    it('deve funcionar para skeleton de card', () => {
      render(
        <div className="flex items-center space-x-4">
          <Skeleton
            className="h-12 w-12 rounded-full"
            data-testid="card-avatar"
          />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" data-testid="card-title" />
            <Skeleton
              className="h-4 w-[200px]"
              data-testid="card-description"
            />
          </div>
        </div>,
      )

      expect(screen.getByTestId('card-avatar')).toBeInTheDocument()
      expect(screen.getByTestId('card-title')).toBeInTheDocument()
      expect(screen.getByTestId('card-description')).toBeInTheDocument()
    })

    it('deve funcionar para skeleton de tabela', () => {
      render(
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton
                className="h-6 w-[100px]"
                data-testid={`row-${i}-col-1`}
              />
              <Skeleton
                className="h-6 w-[150px]"
                data-testid={`row-${i}-col-2`}
              />
              <Skeleton
                className="h-6 w-[80px]"
                data-testid={`row-${i}-col-3`}
              />
            </div>
          ))}
        </div>,
      )

      // Verifica se todas as linhas foram renderizadas
      for (let i = 0; i < 3; i++) {
        expect(screen.getByTestId(`row-${i}-col-1`)).toBeInTheDocument()
        expect(screen.getByTestId(`row-${i}-col-2`)).toBeInTheDocument()
        expect(screen.getByTestId(`row-${i}-col-3`)).toBeInTheDocument()
      }
    })
  })

  describe('Acessibilidade', () => {
    it('deve aceitar aria-label para screen readers', () => {
      render(
        <Skeleton aria-label="Carregando conteúdo..." data-testid="skeleton" />,
      )

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('aria-label', 'Carregando conteúdo...')
    })

    it('deve aceitar role customizado', () => {
      render(
        <Skeleton
          role="status"
          aria-label="Carregando..."
          data-testid="skeleton"
        />,
      )

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('role', 'status')
    })

    it('deve aceitar aria-hidden para decorativos', () => {
      render(<Skeleton aria-hidden="true" data-testid="skeleton" />)

      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Estados de loading', () => {
    it('deve indicar estado de carregamento', () => {
      render(
        <div>
          <Skeleton data-testid="loading-skeleton" />
          <span className="sr-only">Carregando dados...</span>
        </div>,
      )

      const skeleton = screen.getByTestId('loading-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(screen.getByText('Carregando dados...')).toBeInTheDocument()
    })

    it('deve funcionar com condicionais de loading', () => {
      const isLoading = true

      render(
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-full" data-testid="loading-state" />
          ) : (
            <div data-testid="loaded-content">Conteúdo carregado</div>
          )}
        </div>,
      )

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
      expect(screen.queryByTestId('loaded-content')).not.toBeInTheDocument()
    })
  })
})
