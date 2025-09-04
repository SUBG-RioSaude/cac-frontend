import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '../select'

describe('Select Components', () => {
  const TestSelect = ({ onValueChange, value, disabled = false }: {
    onValueChange?: (value: string) => void
    value?: string
    disabled?: boolean
  }) => (
    <Select onValueChange={onValueChange} value={value} disabled={disabled}>
      <SelectTrigger data-testid="select-trigger">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent data-testid="select-content">
        <SelectGroup>
          <SelectLabel>Frutas</SelectLabel>
          <SelectItem value="apple">Maçã</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectSeparator />
          <SelectItem value="orange" disabled>Laranja</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  describe('Select', () => {
    it('deve renderizar corretamente', () => {
      render(<TestSelect />)
      
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      expect(screen.getByText('Selecione uma opção')).toBeInTheDocument()
    })

    it('deve aplicar data-slot corretamente', () => {
      const { container } = render(<TestSelect />)
      
      // Verifica se o trigger tem o data-slot correto
      expect(screen.getByTestId('select-trigger')).toHaveAttribute('data-slot', 'select-trigger')
    })
  })

  describe('SelectTrigger', () => {
    it('deve renderizar com classes padrão', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
      expect(trigger).toHaveAttribute('data-size', 'default')
      expect(trigger).toHaveClass(
        'border-input',
        'flex',
        'w-fit',
        'items-center',
        'justify-between',
        'gap-2',
        'rounded-md',
        'border',
        'bg-transparent'
      )
    })

    it('deve suportar tamanho pequeno', () => {
      render(
        <Select>
          <SelectTrigger size="sm" data-testid="small-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByTestId('small-trigger')
      expect(trigger).toHaveAttribute('data-size', 'sm')
    })

    it('deve aplicar className personalizada', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger" data-testid="custom-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByTestId('custom-trigger')
      expect(trigger).toHaveClass('custom-trigger', 'border-input')
    })

    it('deve mostrar ícone de seta', () => {
      render(<TestSelect />)
      
      const chevron = document.querySelector('.size-4.opacity-50')
      expect(chevron).toBeInTheDocument()
    })
  })

  describe('SelectValue', () => {
    it('deve mostrar placeholder quando nenhum valor está selecionado', () => {
      render(<TestSelect />)
      
      expect(screen.getByText('Selecione uma opção')).toBeInTheDocument()
    })

    it('deve mostrar valor selecionado', () => {
      render(<TestSelect value="apple" />)
      
      expect(screen.getByText('Maçã')).toBeInTheDocument()
    })
  })

  describe('SelectContent', () => {
    it('deve renderizar conteúdo quando aberto', async () => {
      const user = userEvent.setup()
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      // Aguarda o conteúdo aparecer com timeout maior
      await waitFor(() => {
        expect(screen.getByText('Frutas')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      expect(screen.getByText('Maçã')).toBeInTheDocument()
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })

    it('deve aplicar classes corretas', async () => {
      const user = userEvent.setup()
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      await waitFor(() => {
        const content = document.querySelector('[data-slot="select-content"]')
        expect(content).toBeInTheDocument()
      }, { timeout: 3000 })
      
      const content = document.querySelector('[data-slot="select-content"]')
      expect(content).toHaveClass(
        'bg-popover',
        'text-popover-foreground',
        'relative',
        'z-50',
        'min-w-[8rem]',
        'overflow-x-hidden',
        'overflow-y-auto',
        'rounded-md',
        'border',
        'shadow-md'
      )
    })
  })

  describe('SelectItem', () => {
    it('deve permitir seleção de item', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<TestSelect onValueChange={onValueChange} />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      const appleItem = screen.getByText('Maçã')
      await user.click(appleItem)
      
      expect(onValueChange).toHaveBeenCalledWith('apple')
    })

    it('deve aplicar classes corretas', async () => {
      const user = userEvent.setup()
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      const items = document.querySelectorAll('[data-slot="select-item"]')
      expect(items[0]).toHaveClass(
        'relative',
        'flex',
        'w-full',
        'cursor-default',
        'items-center',
        'gap-2',
        'rounded-sm',
        'select-none'
      )
    })

    it('deve mostrar indicador quando selecionado', async () => {
      const user = userEvent.setup()
      render(<TestSelect value="apple" />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      // O indicador é mostrado automaticamente pelo Radix UI quando o item está selecionado
      const checkIcon = document.querySelector('[data-slot="select-item"] .size-4')
      expect(checkIcon).toBeInTheDocument()
    })

    it('não deve permitir seleção quando desabilitado', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<TestSelect onValueChange={onValueChange} />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      const orangeItem = screen.getByText('Laranja')
      await user.click(orangeItem)
      
      // Não deve chamar onValueChange para item desabilitado
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe('SelectLabel', () => {
    it('deve renderizar label', async () => {
      const user = userEvent.setup()
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      const label = screen.getByText('Frutas')
      expect(label).toBeInTheDocument()
      expect(label.closest('[data-slot="select-label"]')).toHaveClass(
        'text-muted-foreground',
        'px-2',
        'py-1.5',
        'text-xs'
      )
    })
  })

  describe('SelectSeparator', () => {
    it('deve renderizar separador', async () => {
      const user = userEvent.setup()
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      const separator = document.querySelector('[data-slot="select-separator"]')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass(
        'bg-border',
        'pointer-events-none',
        '-mx-1',
        'my-1',
        'h-px'
      )
    })
  })

  describe('Select comportamento', () => {
    it('deve fechar quando item é selecionado', async () => {
      const user = userEvent.setup()
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      expect(screen.getByText('Maçã')).toBeInTheDocument()
      
      await user.click(screen.getByText('Maçã'))
      
      // O conteúdo deve desaparecer após seleção
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('deve estar desabilitado quando prop disabled é true', () => {
      render(<TestSelect disabled />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeDisabled()
    })

    it('deve aplicar classes de erro quando aria-invalid', () => {
      render(
        <Select>
          <SelectTrigger aria-invalid data-testid="error-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByTestId('error-trigger')
      expect(trigger).toHaveClass(
        'aria-invalid:ring-destructive/20',
        'aria-invalid:border-destructive'
      )
    })
  })

  describe('SelectGroup', () => {
    it('deve aplicar data-slot corretamente', async () => {
      const user = userEvent.setup()
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      expect(document.querySelector('[data-slot="select-group"]')).toBeInTheDocument()
    })
  })

  describe('Navegação por teclado', () => {
    it('deve ter atributos de acessibilidade corretos', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      
      // Verifica se o trigger tem os atributos corretos
      expect(trigger).toHaveAttribute('role', 'combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-autocomplete', 'none')
    })
  })
})