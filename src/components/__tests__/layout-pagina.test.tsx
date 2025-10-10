import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect } from 'vitest'

import LayoutPagina from '../layout-pagina'

describe('LayoutPagina', () => {
  it('deve renderizar children corretamente', () => {
    render(
      <LayoutPagina>
        <div data-testid="test-content">Test content</div>
      </LayoutPagina>,
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('deve renderizar título quando fornecido', () => {
    const titulo = 'Título da Página'

    render(
      <LayoutPagina titulo={titulo}>
        <div>Content</div>
      </LayoutPagina>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(titulo)).toBeInTheDocument()
    expect(screen.getByText(titulo)).toHaveClass(
      'text-2xl',
      'font-semibold',
      'tracking-tight',
      'text-gray-900',
    )
  })

  it('deve renderizar descrição quando fornecida', () => {
    const descricao = 'Esta é a descrição da página'

    render(
      <LayoutPagina descricao={descricao}>
        <div>Content</div>
      </LayoutPagina>,
    )

    expect(screen.getByText(descricao)).toBeInTheDocument()
    expect(screen.getByText(descricao)).toHaveClass('text-sm', 'text-gray-600')
  })

  it('deve renderizar título e descrição juntos', () => {
    const titulo = 'Título da Página'
    const descricao = 'Descrição da página'

    render(
      <LayoutPagina titulo={titulo} descricao={descricao}>
        <div>Content</div>
      </LayoutPagina>,
    )

    expect(screen.getByText(titulo)).toBeInTheDocument()
    expect(screen.getByText(descricao)).toBeInTheDocument()
  })

  it('não deve renderizar cabeçalho quando título e descrição não são fornecidos', () => {
    render(
      <LayoutPagina>
        <div data-testid="only-content">Only content</div>
      </LayoutPagina>,
    )

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByTestId('only-content')).toBeInTheDocument()
  })

  it('deve aplicar className personalizada', () => {
    const customClassName = 'bg-red-100 p-4'

    const { container } = render(
      <LayoutPagina className={customClassName}>
        <div>Content</div>
      </LayoutPagina>,
    )

    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('space-y-6', 'bg-red-100', 'p-4')
  })

  it('deve manter classe padrão space-y-6 mesmo com className personalizada', () => {
    const { container } = render(
      <LayoutPagina className="custom-class">
        <div>Content</div>
      </LayoutPagina>,
    )

    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('space-y-6', 'custom-class')
  })

  it('deve renderizar estrutura correta quando só título é fornecido', () => {
    render(
      <LayoutPagina titulo="Só título">
        <div>Content</div>
      </LayoutPagina>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Só título')).toBeInTheDocument()
  })

  it('deve renderizar estrutura correta quando só descrição é fornecida', () => {
    render(
      <LayoutPagina descricao="Só descrição">
        <div>Content</div>
      </LayoutPagina>,
    )

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('Só descrição')).toBeInTheDocument()
  })

  it('deve ter estrutura de espaçamento correta', () => {
    const { container } = render(
      <LayoutPagina titulo="Título" descricao="Descrição">
        <div>Content</div>
      </LayoutPagina>,
    )

    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('space-y-6')

    // Verifica se existe um div com classe space-y-2 para o cabeçalho
    const header = container.querySelector('.space-y-2')
    expect(header).toBeInTheDocument()

    // Verifica se existe um div com classe space-y-6 para o conteúdo
    const content = container.querySelector('.space-y-6:last-child')
    expect(content).toBeInTheDocument()
  })
})
