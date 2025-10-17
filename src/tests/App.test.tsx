// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import App from '@/App'

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    usuario: null,
    estaAutenticado: false,
    carregando: false,
  }),
}))

vi.mock('@/lib/auth/auth-queries', () => ({
  useLogoutMutation: () => ({
    mutate: () => {},
    mutateAsync: async () => undefined,
    isPending: false,
    reset: () => {},
  }),
  useLoginMutation: () => ({
    mutate: () => {},
    mutateAsync: async () => undefined,
    isPending: false,
    error: null,
    reset: () => {},
  }),
}))

describe('App', () => {
  it('deve renderizar a página de login', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    expect(screen.getByText('Bem-Vindo(a)!')).toBeInTheDocument()
    expect(screen.getByText('Insira suas credenciais')).toBeInTheDocument()

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
