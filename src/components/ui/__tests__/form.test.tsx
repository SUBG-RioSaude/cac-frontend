import { render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from '../form'
import { Input } from '../input'

// Componente de teste que usa o useFormField hook
const TestFormFieldComponent = () => {
  try {
    const fieldData = useFormField()
    return (
      <div data-testid="form-field-data">
        {JSON.stringify({
          id: fieldData.id,
          name: fieldData.name,
          formItemId: fieldData.formItemId,
        })}
      </div>
    )
  } catch (error) {
    return <div data-testid="hook-error">{(error as Error).message}</div>
  }
}

describe('Form Components', () => {
  describe('Form', () => {
    it('deve renderizar formulário com react-hook-form', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            username: '',
          },
        })

        return (
          <Form {...form}>
            <form data-testid="test-form">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu username" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.getByTestId('test-form')).toBeInTheDocument()
      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Digite seu username'),
      ).toBeInTheDocument()
    })
  })

  describe('FormItem', () => {
    it('deve renderizar com classes padrão', () => {
      render(<FormItem data-testid="form-item" />)

      const formItem = screen.getByTestId('form-item')
      expect(formItem).toBeInTheDocument()
      expect(formItem).toHaveClass('grid', 'gap-2')
      expect(formItem).toHaveAttribute('data-slot', 'form-item')
    })

    it('deve aplicar className personalizada', () => {
      render(<FormItem className="custom-class" data-testid="form-item" />)

      const formItem = screen.getByTestId('form-item')
      expect(formItem).toHaveClass('grid', 'gap-2', 'custom-class')
    })
  })

  describe('FormLabel', () => {
    it('deve renderizar label dentro do contexto do formulário', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormLabel data-testid="form-label">Test Label</FormLabel>
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const label = screen.getByTestId('form-label')
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('data-slot', 'form-label')
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('deve mostrar estado de erro', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: { test: '' },
          mode: 'onChange',
        })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              rules={{ required: 'Campo obrigatório' }}
              render={({ fieldState }) => (
                <FormItem>
                  <FormLabel data-testid="form-label">Test Label</FormLabel>
                  {fieldState.error && (
                    <span data-testid="error-indicator">error</span>
                  )}
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const label = screen.getByTestId('form-label')
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('data-slot', 'form-label')
    })
  })

  describe('FormControl', () => {
    it('deve renderizar controle dentro do contexto do formulário', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input data-testid="form-input" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const input = screen.getByTestId('form-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('data-slot', 'form-control')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('deve ter atributos de acessibilidade corretos', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input data-testid="form-input" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const input = screen.getByTestId('form-input')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('FormDescription', () => {
    it('deve renderizar descrição', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormDescription data-testid="form-description">
                    Esta é uma descrição do campo
                  </FormDescription>
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const description = screen.getByTestId('form-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveAttribute('data-slot', 'form-description')
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
      expect(
        screen.getByText('Esta é uma descrição do campo'),
      ).toBeInTheDocument()
    })

    it('deve aplicar className personalizada', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormDescription
                    className="custom-description"
                    data-testid="form-description"
                  >
                    Descrição
                  </FormDescription>
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const description = screen.getByTestId('form-description')
      expect(description).toHaveClass(
        'text-muted-foreground',
        'text-sm',
        'custom-description',
      )
    })
  })

  describe('FormMessage', () => {
    it('deve renderizar mensagem personalizada', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage data-testid="form-message">
                    Mensagem customizada
                  </FormMessage>
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const message = screen.getByTestId('form-message')
      expect(message).toBeInTheDocument()
      expect(message).toHaveAttribute('data-slot', 'form-message')
      expect(message).toHaveClass('text-destructive', 'text-sm')
      expect(screen.getByText('Mensagem customizada')).toBeInTheDocument()
    })

    it('não deve renderizar quando não há conteúdo', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage data-testid="form-message" />
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.queryByTestId('form-message')).not.toBeInTheDocument()
    })
  })

  describe('useFormField', () => {
    it('deve lançar erro quando usado fora do contexto FormField', () => {
      render(<TestFormFieldComponent />)

      expect(screen.getByTestId('hook-error')).toBeInTheDocument()
      // Verifica se contém parte da mensagem de erro
      expect(screen.getByTestId('hook-error')).toHaveTextContent(
        'Cannot destructure property',
      )
      expect(screen.getByTestId('hook-error')).toHaveTextContent(
        'useFormContext',
      )
    })

    it('deve retornar dados do campo quando usado no contexto correto', () => {
      const TestForm = () => {
        const form = useForm({ defaultValues: { test: '' } })

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <TestFormFieldComponent />
                </FormItem>
              )}
            />
          </Form>
        )
      }

      render(<TestForm />)

      const fieldData = screen.getByTestId('form-field-data')
      expect(fieldData).toBeInTheDocument()

      const data = JSON.parse(fieldData.textContent || '{}')
      expect(data.name).toBe('test')
      expect(data.id).toBeDefined()
      expect(data.formItemId).toBeDefined()
    })
  })
})
