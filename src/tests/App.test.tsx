// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '@/App'

describe('App', () => {
  it('deve renderizar a sidebar', () => {
    render(<App />)

    expect(screen.getByText('Início')).toBeInTheDocument()

    // Use o texto que seu App renderiza.
    // Exemplo, se você tiver um <h1>Olá Mundo</h1> no seu App.
    // expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Olá Mundo');
  })
})
