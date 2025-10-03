import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'

import { Input } from '../input'

describe('Input', () => {
  it('deve renderizar input básico', () => {
    render(<Input data-testid="test-input" />)

    const input = screen.getByTestId('test-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  it('deve aplicar tipo correto', () => {
    render(<Input type="password" data-testid="password-input" />)

    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('deve usar type="text" como padrão quando tipo não é especificado', () => {
    render(<Input data-testid="default-input" />)

    const input = screen.getByTestId('default-input')
    // Verifica se o input não tem tipo especificado (deixa o navegador usar o padrão)
    expect(input).not.toHaveAttribute('type')
  })

  it('deve aplicar placeholder', () => {
    const placeholder = 'Digite seu texto aqui'
    render(<Input placeholder={placeholder} data-testid="placeholder-input" />)

    const input = screen.getByTestId('placeholder-input')
    expect(input).toHaveAttribute('placeholder', placeholder)
  })

  it('deve aplicar value', () => {
    const value = 'Valor inicial'
    render(
      <Input value={value} onChange={() => {}} data-testid="value-input" />,
    )

    const input = screen.getByTestId('value-input')
    expect(input.value).toBe(value)
  })

  it('deve aplicar classes CSS padrão', () => {
    render(<Input data-testid="styled-input" />)

    const input = screen.getByTestId('styled-input')
    expect(input).toHaveClass(
      'border-input',
      'flex',
      'h-9',
      'w-full',
      'min-w-0',
      'rounded-md',
      'border',
      'bg-transparent',
      'px-3',
      'py-1',
      'text-base',
      'shadow-xs',
      'outline-none',
    )
  })

  it('deve aplicar classes de foco', () => {
    render(<Input data-testid="focus-input" />)

    const input = screen.getByTestId('focus-input')
    expect(input).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]',
    )
  })

  it('deve aplicar classes de erro quando aria-invalid', () => {
    render(<Input aria-invalid data-testid="error-input" />)

    const input = screen.getByTestId('error-input')
    expect(input).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'aria-invalid:border-destructive',
    )
  })

  it('deve aplicar className personalizada', () => {
    const customClass = 'custom-input-class'
    render(<Input className={customClass} data-testid="custom-input" />)

    const input = screen.getByTestId('custom-input')
    expect(input).toHaveClass(customClass)
    // Deve manter classes padrão também
    expect(input).toHaveClass('border-input', 'flex', 'h-9')
  })

  it('deve aplicar props de input padrão', () => {
    const props = {
      disabled: true,
      readOnly: true,
      required: true,
      maxLength: 100,
    }

    render(<Input {...props} data-testid="props-input" />)

    const input = screen.getByTestId('props-input')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('readonly')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('maxLength', '100')
  })

  it('deve aplicar classes disabled quando desabilitado', () => {
    render(<Input disabled data-testid="disabled-input" />)

    const input = screen.getByTestId('disabled-input')
    expect(input).toHaveClass(
      'disabled:pointer-events-none',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    )
  })

  it('deve chamar onChange quando valor muda', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="change-input" />)

    const input = screen.getByTestId('change-input')
    fireEvent.change(input, { target: { value: 'novo valor' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onFocus quando recebe foco', () => {
    const handleFocus = vi.fn()
    render(<Input onFocus={handleFocus} data-testid="focus-input" />)

    const input = screen.getByTestId('focus-input')
    fireEvent.focus(input)

    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onBlur quando perde foco', () => {
    const handleBlur = vi.fn()
    render(<Input onBlur={handleBlur} data-testid="blur-input" />)

    const input = screen.getByTestId('blur-input')
    fireEvent.blur(input)

    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('deve suportar ref forwarding', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} data-testid="ref-input" />)

    // Verifica se o ref está funcionando
    expect(ref.current).toBeTruthy()
    if (ref.current) {
      expect(ref.current.tagName.toLowerCase()).toBe('input')
      expect(ref.current).toHaveAttribute('data-testid', 'ref-input')
    }
  })

  it('deve aplicar classes para file input', () => {
    render(<Input type="file" data-testid="file-input" />)

    const input = screen.getByTestId('file-input')
    expect(input).toHaveClass(
      'file:text-foreground',
      'file:inline-flex',
      'file:h-7',
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium',
    )
  })

  it('deve aplicar classes de placeholder', () => {
    render(<Input placeholder="Test" data-testid="placeholder-input" />)

    const input = screen.getByTestId('placeholder-input')
    expect(input).toHaveClass('placeholder:text-muted-foreground')
  })

  it('deve aplicar classes de seleção', () => {
    render(<Input data-testid="selection-input" />)

    const input = screen.getByTestId('selection-input')
    expect(input).toHaveClass(
      'selection:bg-primary',
      'selection:text-primary-foreground',
    )
  })
})
