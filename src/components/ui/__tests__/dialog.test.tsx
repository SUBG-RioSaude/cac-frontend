import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from '../dialog'

describe('Dialog Components', () => {
  describe('Dialog Root', () => {
    it('deve renderizar sem erro', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    })

    it('deve renderizar root do dialog', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
        </Dialog>,
      )

      const trigger = screen.getByRole('button', { name: 'Open' })
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('DialogTrigger', () => {
    it('deve renderizar trigger corretamente', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>,
      )

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      expect(trigger).toBeInTheDocument()
    })

    it('deve ter data-slot="dialog-trigger"', () => {
      render(
        <Dialog>
          <DialogTrigger data-testid="trigger">Open</DialogTrigger>
        </Dialog>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger')
    })

    it('deve abrir dialog ao ser clicado', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog content here</DialogDescription>
          </DialogContent>
        </Dialog>,
      )

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('DialogContent', () => {
    it('deve renderizar conteúdo quando dialog está aberto', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Dialog content')).toBeInTheDocument()
      })
    })

    it('deve aplicar classes padrão', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent data-testid="dialog-content">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const content = screen.getByTestId('dialog-content')
        expect(content).toHaveClass(
          'bg-background',
          'fixed',
          'top-[50%]',
          'left-[50%]',
          'z-50',
          'grid',
          'w-full',
          'translate-x-[-50%]',
          'translate-y-[-50%]',
          'gap-4',
          'rounded-lg',
          'border',
          'p-6',
          'shadow-lg',
        )
      })
    })

    it('deve mostrar botão de fechar por padrão', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Close' }),
        ).toBeInTheDocument()
      })
    })

    it('deve ocultar botão de fechar quando showCloseButton=false', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: 'Close' }),
        ).not.toBeInTheDocument()
      })
    })

    it('deve ter data-slot="dialog-content"', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent data-testid="content">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const content = screen.getByTestId('content')
        expect(content).toHaveAttribute('data-slot', 'dialog-content')
      })
    })
  })

  describe('DialogOverlay', () => {
    it('deve renderizar overlay quando dialog está aberto', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const overlay = document.querySelector('[data-slot="dialog-overlay"]')
        expect(overlay).toBeInTheDocument()
      })
    })

    it('deve aplicar classes de overlay', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const overlay = document.querySelector('[data-slot="dialog-overlay"]')
        expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black/50')
      })
    })
  })

  describe('DialogHeader', () => {
    it('deve renderizar header corretamente', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader data-testid="dialog-header">
              <DialogTitle>Header Title</DialogTitle>
              <DialogDescription>Header description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const header = screen.getByTestId('dialog-header')
        expect(header).toBeInTheDocument()
        expect(header).toHaveClass(
          'flex',
          'flex-col',
          'gap-2',
          'text-center',
          'sm:text-left',
        )
      })
    })

    it('deve ter data-slot="dialog-header"', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader data-testid="header">Content</DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const header = screen.getByTestId('header')
        expect(header).toHaveAttribute('data-slot', 'dialog-header')
      })
    })
  })

  describe('DialogTitle', () => {
    it('deve renderizar título corretamente', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByText('My Dialog Title')).toBeInTheDocument()
      })
    })

    it('deve aplicar classes padrão', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const title = screen.getByTestId('title')
        expect(title).toHaveClass('text-lg', 'leading-none', 'font-semibold')
      })
    })

    it('deve ter data-slot="dialog-title"', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const title = screen.getByTestId('title')
        expect(title).toHaveAttribute('data-slot', 'dialog-title')
      })
    })
  })

  describe('DialogDescription', () => {
    it('deve renderizar descrição corretamente', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByText('This is a description')).toBeInTheDocument()
      })
    })

    it('deve aplicar classes padrão', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="description">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const description = screen.getByTestId('description')
        expect(description).toHaveClass('text-muted-foreground', 'text-sm')
      })
    })
  })

  describe('DialogFooter', () => {
    it('deve renderizar footer corretamente', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">
              <button type="button">Cancel</button>
              <button type="button">Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))

      await waitFor(() => {
        const footer = screen.getByTestId('footer')
        expect(footer).toBeInTheDocument()
        expect(footer).toHaveClass(
          'flex',
          'flex-col-reverse',
          'gap-2',
          'sm:flex-row',
          'sm:justify-end',
        )
      })
    })
  })

  describe('DialogClose', () => {
    it('deve fechar dialog ao ser clicado', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Close Dialog</DialogClose>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Close Dialog' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('deve ter data-slot="dialog-close"', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid="close">Close</DialogClose>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: 'Open' }))

      await waitFor(() => {
        const closeButton = screen.getByTestId('close')
        expect(closeButton).toHaveAttribute('data-slot', 'dialog-close')
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter role dialog', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Accessible Dialog</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('deve fechar com Escape', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('deve ter aria-labelledby quando há título', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Accessible Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        const title = screen.getByText('Accessible Title')
        expect(dialog).toHaveAttribute('aria-labelledby', title.id)
      })
    })
  })

  describe('Dialog Composition', () => {
    it('deve renderizar dialog completo com todos os componentes', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open Complete Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>
                This is a complete dialog example
              </DialogDescription>
            </DialogHeader>
            <div>Main content area</div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <button type="button">Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      )

      await user.click(
        screen.getByRole('button', { name: 'Open Complete Dialog' }),
      )

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Complete Dialog')).toBeInTheDocument()
        expect(
          screen.getByText('This is a complete dialog example'),
        ).toBeInTheDocument()
        expect(screen.getByText('Main content area')).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })
    })
  })
})
