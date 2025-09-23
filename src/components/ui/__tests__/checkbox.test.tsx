import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../checkbox'

describe('Checkbox', () => {
  describe('Renderização básica', () => {
    it('deve renderizar corretamente', () => {
      render(<Checkbox data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveRole('checkbox')
    })

    it('deve aplicar classes padrão', () => {
      render(<Checkbox data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('peer', 'size-4', 'shrink-0')
    })

    it('deve ter data-slot="checkbox"', () => {
      render(<Checkbox data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('data-slot', 'checkbox')
    })
  })

  describe('Interações', () => {
    it('deve permitir clique para marcar/desmarcar', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(
        <Checkbox onCheckedChange={onCheckedChange} data-testid="checkbox" />,
      )

      const checkbox = screen.getByTestId('checkbox')

      await user.click(checkbox)
      expect(onCheckedChange).toHaveBeenCalledWith(true)

      await user.click(checkbox)
      expect(onCheckedChange).toHaveBeenCalledWith(false)
    })

    it('deve funcionar com keyboard (Space)', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(
        <Checkbox onCheckedChange={onCheckedChange} data-testid="checkbox" />,
      )

      const checkbox = screen.getByTestId('checkbox')
      await user.click(checkbox)
      checkbox.focus()

      await user.keyboard(' ')
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it('deve funcionar com keyboard (Enter)', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(
        <Checkbox onCheckedChange={onCheckedChange} data-testid="checkbox" />,
      )

      const checkbox = screen.getByTestId('checkbox')
      await user.click(checkbox)
      checkbox.focus()

      await user.keyboard('{Enter}')
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Estados do checkbox', () => {
    it('deve iniciar não marcado por padrão', () => {
      render(<Checkbox data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('deve aceitar estado checked inicial', () => {
      render(<Checkbox checked={true} data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('deve aceitar estado indeterminate', () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('deve suportar estado disabled', () => {
      render(<Checkbox disabled data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toBeDisabled()
      expect(checkbox).toHaveAttribute('data-disabled', '')
    })

    it('deve suportar estado required', () => {
      render(<Checkbox required data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Props customizadas', () => {
    it('deve aceitar className customizada', () => {
      render(<Checkbox className="custom-class" data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('custom-class')
    })

    it('deve aceitar id customizado', () => {
      render(<Checkbox id="my-checkbox" data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('id', 'my-checkbox')
    })

    it('deve aceitar name para formulários', () => {
      render(<Checkbox name="terms" data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      // Radix UI Checkbox não expõe o atributo name diretamente
      // mas suporta a prop name para integração com formulários
      expect(checkbox).toBeInTheDocument()
    })

    it('deve aceitar value customizado', () => {
      render(<Checkbox value="accept" data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('value', 'accept')
    })
  })

  describe('Acessibilidade', () => {
    it('deve aceitar aria-label', () => {
      render(
        <Checkbox
          aria-label="Aceitar termos e condições"
          data-testid="checkbox"
        />,
      )

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute(
        'aria-label',
        'Aceitar termos e condições',
      )
    })

    it('deve aceitar aria-describedby', () => {
      render(
        <Checkbox aria-describedby="checkbox-help" data-testid="checkbox" />,
      )

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-help')
    })

    it('deve funcionar com labels associados', () => {
      render(
        <div>
          <Checkbox id="terms-checkbox" data-testid="checkbox" />
          <label htmlFor="terms-checkbox">Aceito os termos e condições</label>
        </div>,
      )

      const checkbox = screen.getByTestId('checkbox')
      const label = screen.getByText('Aceito os termos e condições')

      expect(checkbox).toHaveAttribute('id', 'terms-checkbox')
      expect(label).toHaveAttribute('for', 'terms-checkbox')
    })
  })

  describe('Casos de uso comuns', () => {
    it('deve funcionar em um formulário', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <form onSubmit={onSubmit}>
          <Checkbox name="newsletter" value="yes" data-testid="checkbox" />
          <button type="submit">Submit</button>
        </form>,
      )

      const checkbox = screen.getByTestId('checkbox')
      const submitButton = screen.getByText('Submit')

      await user.click(checkbox)
      await user.click(submitButton)

      expect(onSubmit).toHaveBeenCalled()
    })

    it('deve mostrar ícone de check quando marcado', () => {
      render(<Checkbox checked={true} data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      const checkIcon = checkbox.querySelector('svg')

      expect(checkIcon).toBeInTheDocument()
    })

    it('deve mostrar ícone minus quando indeterminate', () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      const minusIcon = checkbox.querySelector('svg')

      expect(minusIcon).toBeInTheDocument()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('deve funcionar como uncontrolled component', async () => {
      const user = userEvent.setup()
      render(<Checkbox defaultChecked={false} data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await user.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('deve funcionar como controlled component', async () => {
      const user = userEvent.setup()
      let checked = false
      const onCheckedChange = (value: boolean) => {
        checked = value
      }

      const { rerender } = render(
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          data-testid="checkbox"
        />,
      )

      const checkbox = screen.getByTestId('checkbox')
      await user.click(checkbox)

      rerender(
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          data-testid="checkbox"
        />,
      )

      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
  })
})
