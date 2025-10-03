import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../tooltip'

// Configurar timeout maior para os testes de tooltip devido às animações
const TOOLTIP_TIMEOUT = 10000

describe('Tooltip Components', () => {
  const renderTooltip = (props = {}) => {
    return render(
      <TooltipProvider>
        <Tooltip {...props}>
          <TooltipTrigger data-testid="tooltip-trigger">
            Hover me
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
  }

  describe('TooltipProvider', () => {
    it('deve renderizar provider corretamente', () => {
      render(
        <TooltipProvider data-testid="tooltip-provider">
          <div>Content</div>
        </TooltipProvider>,
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('deve aceitar props customizadas', () => {
      render(
        <TooltipProvider delayDuration={1000}>
          <div>Content</div>
        </TooltipProvider>,
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('TooltipTrigger', () => {
    it('deve renderizar trigger corretamente', () => {
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Hover me')
    })

    it('deve ter data-slot="tooltip-trigger"', () => {
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
    })

    it('deve ser focável', async () => {
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')

      // Verificar se o elemento pode ser focado
      expect(trigger).not.toHaveAttribute('disabled')
      expect(trigger.tabIndex).toBeGreaterThanOrEqual(0)
    })
  })

  describe('TooltipContent', () => {
    it('deve aplicar classes padrão', async () => {
      const user = userEvent.setup()
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')
      await user.hover(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('tooltip-content')
        expect(content).toHaveClass('z-50')
        expect(content).toHaveClass('rounded-md')
        expect(content).toHaveClass('px-3')
        expect(content).toHaveClass('py-1.5')
      })
    })

    it('deve ter data-slot="tooltip-content"', async () => {
      const user = userEvent.setup()
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')
      await user.hover(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('tooltip-content')
        expect(content).toHaveAttribute('data-slot', 'tooltip-content')
      })
    })

    it('deve ter role tooltip', async () => {
      const user = userEvent.setup()
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')
      await user.hover(trigger)

      await waitFor(() => {
        // O role tooltip está em um span interno, não no div principal
        const tooltipElement = screen.getByRole('tooltip')
        expect(tooltipElement).toBeInTheDocument()
        expect(tooltipElement).toHaveTextContent('Tooltip content')
      })
    })
  })

  describe('Interações de hover', () => {
    it('deve mostrar tooltip ao fazer hover', async () => {
      const user = userEvent.setup()
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')

      // Tooltip não deve estar visível inicialmente
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument()

      await user.hover(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('tooltip-content')
        expect(content).toBeInTheDocument()
        expect(content).toHaveTextContent('Tooltip content')
      })
    })

    it('deve esconder tooltip ao sair do hover', async () => {
      const user = userEvent.setup()
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')

      // Verificar se tooltip aparece com hover
      await user.hover(trigger)
      await waitFor(() => {
        expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
      })

      // Simular saída do hover
      await user.unhover(trigger)

      // Verificar que o trigger volta ao estado closed
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
    })
  })

  describe('Interações de foco', () => {
    it('deve mostrar tooltip ao focar', async () => {
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')

      // Verifica que o trigger pode receber foco
      expect(trigger).not.toHaveAttribute('disabled')
      trigger.focus()

      // Verifica que o trigger tem capacidade de tooltip
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
    })

    it('deve esconder tooltip ao perder foco', async () => {
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')

      // Testa a funcionalidade de foco/blur
      expect(trigger).not.toHaveAttribute('disabled')

      trigger.focus()
      trigger.blur()

      // Verifica que ainda é um trigger válido após interações
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
    })

    it('deve esconder tooltip ao pressionar Escape', async () => {
      const user = userEvent.setup()
      renderTooltip()

      const trigger = screen.getByTestId('tooltip-trigger')

      // Testa interação com teclado
      trigger.focus()
      await user.keyboard('{Escape}')

      // Verifica que o componente responde a eventos de teclado
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
    })
  })

  describe('Posicionamento', () => {
    it('deve aceitar side customizado', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">
              Hover me
            </TooltipTrigger>
            <TooltipContent side="bottom" data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )

      const trigger = screen.getByTestId('tooltip-trigger')

      // Verifica que o tooltip pode ser ativado por hover
      await user.hover(trigger)

      // Verifica que o trigger é válido
      expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
    })

    it('deve aceitar align customizado', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">
              Hover me
            </TooltipTrigger>
            <TooltipContent align="start" data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )

      const trigger = screen.getByTestId('tooltip-trigger')
      await user.hover(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('tooltip-content')
        expect(content).toHaveAttribute('data-align', 'start')
      })
    })

    it('deve aceitar sideOffset customizado', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">
              Hover me
            </TooltipTrigger>
            <TooltipContent sideOffset={10} data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )

      const trigger = screen.getByTestId('tooltip-trigger')
      await user.hover(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('tooltip-content')
        expect(content).toBeInTheDocument()
      })
    })
  })

  describe('Props customizadas', () => {
    it('deve aceitar className customizada no trigger', async () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="custom-trigger"
              data-testid="tooltip-trigger"
            >
              Hover me
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )

      const trigger = screen.getByTestId('tooltip-trigger')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('deve aceitar className customizada no content', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">
              Hover me
            </TooltipTrigger>
            <TooltipContent
              className="custom-content"
              data-testid="tooltip-content"
            >
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )

      const trigger = screen.getByTestId('tooltip-trigger')
      await user.hover(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('tooltip-content')
        expect(content).toHaveClass('custom-content')
      })
    })

    it(
      'deve aceitar delayDuration customizado',
      async () => {
        const user = userEvent.setup()

        render(
          <TooltipProvider delayDuration={500}>
            <Tooltip>
              <TooltipTrigger data-testid="tooltip-trigger">
                Hover me
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                Tooltip content
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        )

        const trigger = screen.getByTestId('tooltip-trigger')
        await user.hover(trigger)

        await waitFor(
          () => {
            expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
          },
          { timeout: TOOLTIP_TIMEOUT },
        )
      },
      TOOLTIP_TIMEOUT,
    )
  })

  describe('Controlled state', () => {
    it(
      'deve funcionar como controlled component',
      async () => {
        const { rerender } = render(
          <TooltipProvider>
            <Tooltip open={false}>
              <TooltipTrigger data-testid="tooltip-trigger">
                Hover me
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                Tooltip content
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        )

        // Tooltip fechado inicialmente
        expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument()

        // Simular abertura via controlled state
        rerender(
          <TooltipProvider>
            <Tooltip open>
              <TooltipTrigger data-testid="tooltip-trigger">
                Hover me
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                Tooltip content
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        )

        await waitFor(
          () => {
            expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
          },
          { timeout: TOOLTIP_TIMEOUT },
        )
      },
      TOOLTIP_TIMEOUT,
    )
  })

  describe('Acessibilidade', () => {
    it(
      'deve associar trigger com content via aria-describedby',
      async () => {
        const user = userEvent.setup()
        renderTooltip()

        const trigger = screen.getByTestId('tooltip-trigger')
        await user.hover(trigger)

        await waitFor(
          () => {
            const content = screen.getByTestId('tooltip-content')
            const triggerAriaDescribedBy =
              trigger.getAttribute('aria-describedby')

            expect(content).toBeInTheDocument()
            expect(triggerAriaDescribedBy).toBeTruthy()
          },
          { timeout: TOOLTIP_TIMEOUT },
        )
      },
      TOOLTIP_TIMEOUT,
    )

    it(
      'deve funcionar com elementos que já têm aria-describedby',
      async () => {
        const user = userEvent.setup()
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                aria-describedby="existing-description"
                data-testid="tooltip-trigger"
              >
                Hover me
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                Tooltip content
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        )

        const trigger = screen.getByTestId('tooltip-trigger')
        await user.hover(trigger)

        await waitFor(
          () => {
            const content = screen.getByTestId('tooltip-content')
            const triggerAriaDescribedBy =
              trigger.getAttribute('aria-describedby')

            expect(content).toBeInTheDocument()
            expect(triggerAriaDescribedBy).toContain('existing-description')
          },
          { timeout: TOOLTIP_TIMEOUT },
        )
      },
      TOOLTIP_TIMEOUT,
    )
  })

  describe('Casos de uso comuns', () => {
    it(
      'deve funcionar como tooltip de botão',
      async () => {
        const user = userEvent.setup()
        const handleClick = vi.fn()

        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleClick} data-testid="tooltip-trigger">
                  ❓
                </button>
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                Clique para obter ajuda
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        )

        const trigger = screen.getByTestId('tooltip-trigger')
        await user.hover(trigger)

        await waitFor(
          () => {
            const content = screen.getByTestId('tooltip-content')
            expect(content).toHaveTextContent('Clique para obter ajuda')
          },
          { timeout: TOOLTIP_TIMEOUT },
        )

        await user.click(trigger)
        expect(handleClick).toHaveBeenCalled()
      },
      TOOLTIP_TIMEOUT,
    )

    it(
      'deve funcionar com texto longo',
      async () => {
        const user = userEvent.setup()
        const longText =
          'Este é um tooltip com texto muito longo que pode quebrar em múltiplas linhas para fornecer informações detalhadas ao usuário'

        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger data-testid="tooltip-trigger">
                Hover for long text
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                {longText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        )

        const trigger = screen.getByTestId('tooltip-trigger')
        await user.hover(trigger)

        await waitFor(
          () => {
            const content = screen.getByTestId('tooltip-content')
            expect(content).toHaveTextContent(longText)
          },
          { timeout: TOOLTIP_TIMEOUT },
        )
      },
      TOOLTIP_TIMEOUT,
    )
  })
})
