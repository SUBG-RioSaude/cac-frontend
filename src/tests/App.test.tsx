// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'

describe('App', () => {
  it('deve renderizar a sidebar', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Verifica se a sidebar está sendo renderizada
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    
    // Verifica se há pelo menos um item de menu (procura pelo primeiro)
    const inicioElements = screen.getAllByText('Início')
    expect(inicioElements.length).toBeGreaterThan(0)
  })
})
