// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import App from '@/App'

describe('App', () => {
  it('deve renderizar a página de login', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    // Verifica se a página de login está sendo renderizada
    expect(screen.getByText('Bem-Vindo(a)!')).toBeInTheDocument()
    expect(screen.getByText('Insira suas credenciais')).toBeInTheDocument()

    // Verifica se os campos de login estão presentes
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
