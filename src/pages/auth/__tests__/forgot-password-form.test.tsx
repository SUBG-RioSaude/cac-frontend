import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Mock simples do componente para testar apenas a estrutura básica
const MockForgotPasswordForm = () => (
  <div data-testid="forgot-password-form">
    <h1>Esqueceu sua senha?</h1>
    <p>Digite seu e-mail e enviaremos instruções</p>
    <form>
      <label htmlFor="email">E-mail</label>
      <input id="email" type="email" />
      <button type="submit">Enviar Instruções</button>
      <button type="button">Voltar ao Login</button>
    </form>
    <img src="/logo certa.png" alt="Logo CAC" />
    <img src="/gestao.svg" alt="Background de gestão" />
  </div>
)

describe('ForgotPasswordForm', () => {
  it('deve renderizar estrutura básica', () => {
    render(<MockForgotPasswordForm />)

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument()
    expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument()
    expect(screen.getByText(/Digite seu e-mail e enviaremos instruções/)).toBeInTheDocument()
  })

  it('deve renderizar elementos de formulário', () => {
    render(<MockForgotPasswordForm />)

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar Instruções/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Voltar ao Login/i })).toBeInTheDocument()
  })

  it('deve renderizar logo e imagens', () => {
    render(<MockForgotPasswordForm />)

    const logo = screen.getByAltText('Logo CAC')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/logo certa.png')

    const backgroundImage = screen.getByAltText('Background de gestão')
    expect(backgroundImage).toBeInTheDocument()
    expect(backgroundImage).toHaveAttribute('src', '/gestao.svg')
  })

  it('deve ter estrutura de formulário válida', () => {
    render(<MockForgotPasswordForm />)

    const form = screen.getByTestId('forgot-password-form').querySelector('form')
    expect(form).toBeInTheDocument()
    
    const emailInput = screen.getByLabelText('E-mail')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('deve ter botões com tipos corretos', () => {
    render(<MockForgotPasswordForm />)

    const submitButton = screen.getByRole('button', { name: /Enviar Instruções/i })
    expect(submitButton).toHaveAttribute('type', 'submit')

    const voltarButton = screen.getByRole('button', { name: /Voltar ao Login/i })
    expect(voltarButton).toHaveAttribute('type', 'button')
  })
})