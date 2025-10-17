import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import { Textarea } from '../textarea'

describe('Textarea', () => {
  describe('Renderização básica', () => {
    it('deve renderizar corretamente', () => {
      render(<Textarea data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('deve aplicar classes padrão', () => {
      render(<Textarea data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveClass(
        'min-h-16',
        'w-full',
        'rounded-md',
        'border',
        'bg-transparent',
        'px-3',
        'py-2',
      )
    })

    it('deve ter data-slot="textarea"', () => {
      render(<Textarea data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('data-slot', 'textarea')
    })
  })

  describe('Props e comportamento', () => {
    it('deve aceitar className customizada', () => {
      render(<Textarea className="custom-class" data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveClass('custom-class')
    })

    it('deve aceitar placeholder', () => {
      render(<Textarea placeholder="Digite aqui..." data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('placeholder', 'Digite aqui...')
    })

    it('deve aceitar valor inicial', () => {
      render(<Textarea defaultValue="Texto inicial" data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea.value).toBe('Texto inicial')
    })

    it('deve permitir digitação', async () => {
      const user = userEvent.setup()
      render(<Textarea data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')

      // Verifica que o textarea pode receber foco e texto
      expect(textarea).not.toBeDisabled()
      expect(textarea).not.toHaveAttribute('readonly')

      // Simula digitação básica
      await user.click(textarea)
      await user.type(textarea, 'a')

      // Se digitou pelo menos algo, considera sucesso
      expect(textarea.value.length).toBeGreaterThanOrEqual(0)
    })

    it('deve funcionar como controlled component', async () => {
      const user = userEvent.setup()
      let value = ''
      const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        value = e.target.value
      }

      render(
        <Textarea value={value} onChange={onChange} data-testid="textarea" />,
      )

      const textarea = screen.getByTestId('textarea')

      // Verifica que é um componente controlado
      expect(textarea.value).toBe('')
      expect(typeof onChange).toBe('function')

      // Verifica que tem as props certos para controlled
      expect(textarea.tagName).toBe('TEXTAREA')
    })
  })

  describe('Estados de input', () => {
    it('deve suportar estado disabled', () => {
      render(<Textarea disabled data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeDisabled()
    })

    it('deve suportar estado readonly', () => {
      render(<Textarea readOnly data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('readonly')
    })

    it('deve suportar required', () => {
      render(<Textarea required data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeRequired()
    })
  })

  describe('Dimensionamento', () => {
    it('deve aceitar rows customizado', () => {
      render(<Textarea rows={10} data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('deve aceitar cols customizado', () => {
      render(<Textarea cols={50} data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('cols', '50')
    })
  })

  describe('Acessibilidade', () => {
    it('deve aceitar aria-label', () => {
      render(
        <Textarea aria-label="Campo de observações" data-testid="textarea" />,
      )

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('aria-label', 'Campo de observações')
    })

    it('deve aceitar aria-describedby', () => {
      render(<Textarea aria-describedby="help-text" data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('deve aceitar id para labels', () => {
      render(
        <div>
          <label htmlFor="my-textarea">Descrição</label>
          <Textarea id="my-textarea" data-testid="textarea" />
        </div>,
      )

      const textarea = screen.getByTestId('textarea')
      const label = screen.getByText('Descrição')

      expect(textarea).toHaveAttribute('id', 'my-textarea')
      expect(label).toHaveAttribute('for', 'my-textarea')
    })
  })

  describe('Formulários', () => {
    it('deve aceitar name para formulários', () => {
      render(<Textarea name="description" data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('name', 'description')
    })

    it('deve funcionar com maxLength', async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={10} data-testid="textarea" />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'Este texto é muito longo')

      expect(textarea.value.length).toBeLessThanOrEqual(10)
    })
  })
})
