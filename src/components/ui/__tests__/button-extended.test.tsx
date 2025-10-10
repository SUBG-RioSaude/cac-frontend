import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Settings, Edit, Plus } from 'lucide-react'
import { describe, it, expect, vi } from 'vitest'

import {
  LoadingButton,
  ActionButton,
  IconButton,
  ConfirmationButton,
  ButtonGroup,
  ListButton,
  FloatingActionButton,
} from '@/components/ui/button-extended'

describe('LoadingButton', () => {
  it('renderiza botão normal quando não está carregando', () => {
    render(<LoadingButton>Salvar</LoadingButton>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('mostra spinner quando loading=true', () => {
    render(
      <LoadingButton loading loadingText="Carregando...">
        Salvar
      </LoadingButton>,
    )
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('mantém texto original quando loading=true sem loadingText', () => {
    render(<LoadingButton loading>Salvar</LoadingButton>)
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('fica desabilitado quando loading=true', () => {
    render(<LoadingButton loading>Salvar</LoadingButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('respeita disabled prop independente de loading', () => {
    render(<LoadingButton disabled>Salvar</LoadingButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('ActionButton', () => {
  it('renderiza com ícone', () => {
    render(
      <ActionButton icon={<Edit data-testid="edit-icon" />} tooltip="Editar" />,
    )
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Editar')
  })

  it('aplica tamanho pequeno por padrão', () => {
    render(<ActionButton icon={<Edit />} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8', 'w-8', 'p-0')
  })

  it('executa onClick quando clicado', () => {
    const handleClick = vi.fn()
    render(<ActionButton icon={<Edit />} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('IconButton', () => {
  it('renderiza com ícone e aria-label obrigatório', () => {
    render(
      <IconButton
        icon={<Settings data-testid="settings-icon" />}
        aria-label="Configurações"
      />,
    )
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByLabelText('Configurações')).toBeInTheDocument()
  })

  it('usa variant ghost por padrão', () => {
    render(<IconButton icon={<Settings />} aria-label="Configurações" />)
    // Verifica se tem classes específicas do variant ghost
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent')
  })
})

describe('ConfirmationButton', () => {
  it('mostra botão inicial', () => {
    const handleConfirm = vi.fn()
    render(
      <ConfirmationButton onConfirm={handleConfirm}>
        Excluir
      </ConfirmationButton>,
    )
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('mostra botões de confirmação quando clicado', async () => {
    const handleConfirm = vi.fn()
    render(
      <ConfirmationButton onConfirm={handleConfirm}>
        Excluir
      </ConfirmationButton>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Confirmar' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Cancelar' }),
      ).toBeInTheDocument()
    })
  })

  it('executa onConfirm quando confirmado', async () => {
    const handleConfirm = vi.fn()
    render(
      <ConfirmationButton onConfirm={handleConfirm}>
        Excluir
      </ConfirmationButton>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    })

    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('volta ao estado inicial quando cancelado', async () => {
    const handleConfirm = vi.fn()
    render(
      <ConfirmationButton onConfirm={handleConfirm}>
        Excluir
      </ConfirmationButton>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    })

    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('usa textos customizados', async () => {
    const handleConfirm = vi.fn()
    render(
      <ConfirmationButton
        onConfirm={handleConfirm}
        confirmText="Sim, deletar"
        cancelText="Não"
      >
        Excluir
      </ConfirmationButton>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sim, deletar' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument()
    })
  })
})

describe('ButtonGroup', () => {
  it('renderiza filhos em grupo horizontal por padrão', () => {
    render(
      <ButtonGroup>
        <button>Botão 1</button>
        <button>Botão 2</button>
      </ButtonGroup>,
    )
    const group = screen.getByRole('group', { hidden: true })
    expect(group).toHaveClass('flex-row')
  })

  it('renderiza filhos em grupo vertical quando especificado', () => {
    render(
      <ButtonGroup orientation="vertical">
        <button>Botão 1</button>
        <button>Botão 2</button>
      </ButtonGroup>,
    )
    const group = screen.getByRole('group', { hidden: true })
    expect(group).toHaveClass('flex-col')
  })

  it('aplica espaçamento entre botões', () => {
    render(
      <ButtonGroup spacing="md">
        <button>Botão 1</button>
        <button>Botão 2</button>
      </ButtonGroup>,
    )
    const group = screen.getByRole('group', { hidden: true })
    expect(group).toHaveClass('gap-2')
  })
})

describe('ListButton', () => {
  it('renderiza título e descrição', () => {
    render(
      <ListButton
        title="João Silva"
        description="Desenvolvedor"
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Desenvolvedor')).toBeInTheDocument()
  })

  it('renderiza avatar quando fornecido', () => {
    render(
      <ListButton
        title="João Silva"
        avatar={<div data-testid="avatar">Avatar</div>}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })

  it('renderiza trailing content quando fornecido', () => {
    render(
      <ListButton
        title="João Silva"
        trailing={<span data-testid="trailing">Online</span>}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByTestId('trailing')).toBeInTheDocument()
  })

  it('aplica estilo de selecionado quando selected=true', () => {
    render(<ListButton title="João Silva" selected onClick={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-accent')
  })

  it('executa onClick quando clicado', () => {
    const handleClick = vi.fn()
    render(<ListButton title="João Silva" onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('FloatingActionButton', () => {
  it('renderiza com ícone', () => {
    render(
      <FloatingActionButton
        icon={<Plus data-testid="plus-icon" />}
        aria-label="Adicionar"
      />,
    )
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
  })

  it('aplica posição bottom-right por padrão', () => {
    render(<FloatingActionButton icon={<Plus />} aria-label="Adicionar" />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bottom-6', 'right-6')
  })

  it('aplica posições customizadas', () => {
    render(
      <FloatingActionButton
        icon={<Plus />}
        aria-label="Adicionar"
        position="top-left"
      />,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveClass('top-6', 'left-6')
  })

  it('tem classes de botão flutuante', () => {
    render(<FloatingActionButton icon={<Plus />} aria-label="Adicionar" />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('fixed', 'z-50', 'rounded-full', 'shadow-lg')
  })

  it('executa onClick quando clicado', () => {
    const handleClick = vi.fn()
    render(
      <FloatingActionButton
        icon={<Plus />}
        aria-label="Adicionar"
        onClick={handleClick}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
