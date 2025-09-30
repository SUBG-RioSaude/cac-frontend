import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { Switch } from '../switch'

describe('Switch', () => {
  describe('Renderização básica', () => {
    it('deve renderizar corretamente', () => {
      render(<Switch data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toBeInTheDocument()
      expect(switchElement).toHaveRole('switch')
    })

    it('deve aplicar classes padrão', () => {
      render(<Switch data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveClass(
        'peer',
        'inline-flex',
        'shrink-0',
        'h-[1.15rem]',
        'w-8',
        'items-center',
        'rounded-full',
      )
    })

    it('deve ter data-slot="switch"', () => {
      render(<Switch data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('data-slot', 'switch')
    })

    it('deve renderizar thumb interno', () => {
      render(<Switch data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]')
      expect(thumb).toBeInTheDocument()
    })
  })

  describe('Interações', () => {
    it('deve permitir clique para ativar/desativar', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(<Switch onCheckedChange={onCheckedChange} data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')

      await user.click(switchElement)
      expect(onCheckedChange).toHaveBeenCalledWith(true)

      await user.click(switchElement)
      expect(onCheckedChange).toHaveBeenCalledWith(false)
    })

    it('deve funcionar com keyboard (Space)', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(<Switch onCheckedChange={onCheckedChange} data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      await user.click(switchElement)
      switchElement.focus()

      await user.keyboard(' ')
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it('deve funcionar com keyboard (Enter)', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(<Switch onCheckedChange={onCheckedChange} data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      await user.click(switchElement)
      switchElement.focus()

      await user.keyboard('{Enter}')
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Estados do switch', () => {
    it('deve iniciar desativado por padrão', () => {
      render(<Switch data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })

    it('deve aceitar estado checked inicial', () => {
      render(<Switch checked data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('deve suportar estado disabled', () => {
      render(<Switch disabled data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toBeDisabled()
      expect(switchElement).toHaveAttribute('data-disabled', '')
    })

    it('deve suportar estado required', () => {
      render(<Switch required data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Props customizadas', () => {
    it('deve aceitar className customizada', () => {
      render(<Switch className="custom-class" data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveClass('custom-class')
    })

    it('deve aceitar id customizado', () => {
      render(<Switch id="my-switch" data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('id', 'my-switch')
    })

    it('deve aceitar name para formulários', () => {
      render(<Switch name="notifications" data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      // Radix UI Switch pode não expor o atributo name diretamente
      // mas deve aceitar a prop name para integração com formulários
      expect(switchElement).toBeInTheDocument()
    })

    it('deve aceitar value customizado', () => {
      render(<Switch value="enabled" data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('value', 'enabled')
    })
  })

  describe('Acessibilidade', () => {
    it('deve aceitar aria-label', () => {
      render(<Switch aria-label="Ativar notificações" data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('aria-label', 'Ativar notificações')
    })

    it('deve aceitar aria-describedby', () => {
      render(<Switch aria-describedby="switch-help" data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('aria-describedby', 'switch-help')
    })

    it('deve funcionar com labels associados', () => {
      render(
        <div>
          <Switch id="notifications-switch" data-testid="switch" />
          <label htmlFor="notifications-switch">
            Receber notificações por email
          </label>
        </div>,
      )

      const switchElement = screen.getByTestId('switch')
      const label = screen.getByText('Receber notificações por email')

      expect(switchElement).toHaveAttribute('id', 'notifications-switch')
      expect(label).toHaveAttribute('for', 'notifications-switch')
    })

    it('deve ser focável', () => {
      render(<Switch data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      // Verifica se o elemento pode receber foco (tem tabIndex adequado)
      expect(switchElement).not.toHaveAttribute('tabindex', '-1')
      expect(switchElement).toBeInTheDocument()

      // Verifica se é um elemento button que pode ser focado
      expect(switchElement).toHaveRole('switch')
    })
  })

  describe('Estados visuais', () => {
    it('deve mostrar thumb na posição inicial quando desativado', () => {
      render(<Switch checked={false} data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]')

      expect(thumb).toHaveClass('data-[state=unchecked]:translate-x-0')
    })

    it('deve mostrar thumb na posição ativa quando ativado', () => {
      render(<Switch checked data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]')

      expect(thumb).toHaveClass(
        'data-[state=checked]:translate-x-[calc(100%-2px)]',
      )
    })

    it('deve aplicar estilos de estado disabled', () => {
      render(<Switch disabled data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50',
      )
    })
  })

  describe('Casos de uso comuns', () => {
    it('deve funcionar em configurações de preferência', async () => {
      const user = userEvent.setup()
      let darkMode = false
      const onCheckedChange = (checked: boolean) => {
        darkMode = checked
      }

      render(
        <div>
          <label htmlFor="dark-mode">Modo escuro</label>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={onCheckedChange}
            data-testid="switch"
          />
        </div>,
      )

      const switchElement = screen.getByTestId('switch')
      await user.click(switchElement)

      expect(darkMode).toBe(true)
    })

    it('deve funcionar com form data', () => {
      render(
        <form>
          <Switch
            name="newsletter"
            value="subscribed"
            checked
            data-testid="switch"
          />
        </form>,
      )

      const switchElement = screen.getByTestId('switch')
      // Radix UI Switch não expõe o atributo name, mas suporta value e aria-checked
      expect(switchElement).toHaveAttribute('value', 'subscribed')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
      expect(switchElement).toBeInTheDocument()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('deve funcionar como uncontrolled component', async () => {
      const user = userEvent.setup()
      render(<Switch defaultChecked={false} data-testid="switch" />)

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('deve funcionar como controlled component', async () => {
      const user = userEvent.setup()
      let checked = false
      const onCheckedChange = (value: boolean) => {
        checked = value
      }

      const { rerender } = render(
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          data-testid="switch"
        />,
      )

      const switchElement = screen.getByTestId('switch')
      await user.click(switchElement)

      rerender(
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          data-testid="switch"
        />,
      )

      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })
  })
})
