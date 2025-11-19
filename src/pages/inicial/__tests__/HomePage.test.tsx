import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import HomePage from '../HomePage'

// Mock do LayoutPagina
vi.mock('@/components/layout-pagina', () => ({
  default: ({ children, titulo, descricao }: any) => (
    <div>
      <h1>{titulo}</h1>
      <p>{descricao}</p>
      {children}
    </div>
  ),
}))

describe('HomePage', () => {
  describe('Renderização', () => {
    it('deve renderizar o layout da página com título e descrição corretos', () => {
      render(<HomePage />)

      expect(screen.getByText('Painel de Controle')).toBeInTheDocument()
      expect(
        screen.getByText('Visão geral do sistema de contratos'),
      ).toBeInTheDocument()
    })

    it('deve renderizar todos os cards principais', () => {
      render(<HomePage />)

      // Verificar se todos os 3 cards estão presentes
      expect(screen.getByText('Bem-vindo ao Sistema')).toBeInTheDocument()
      expect(screen.getByText('Contratos Ativos')).toBeInTheDocument()
      expect(screen.getByText('Fornecedores')).toBeInTheDocument()
    })

    it('deve exibir informações do sistema no card de boas-vindas', () => {
      render(<HomePage />)

      expect(
        screen.getByText('Sistema de Contratos da Prefeitura - CAC'),
      ).toBeInTheDocument()
    })

    it('deve exibir placeholders para métricas', () => {
      render(<HomePage />)

      // Verificar placeholders "--"
      const placeholders = screen.getAllByText('--')
      expect(placeholders).toHaveLength(2)

      // Verificar labels das métricas
      expect(screen.getByText('Total de contratos')).toBeInTheDocument()
      expect(screen.getByText('Fornecedores cadastrados')).toBeInTheDocument()
    })
  })

  describe('Layout e Estrutura', () => {
    it('deve ter estrutura de grid responsiva', () => {
      const { container } = render(<HomePage />)

      const gridContainer = container.querySelector(
        '.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3',
      )
      expect(gridContainer).toBeInTheDocument()
    })

    it('deve renderizar 3 cards no grid', () => {
      const { container } = render(<HomePage />)

      // Contar quantos Card components foram renderizados
      const cards = container.querySelectorAll('[class*="card"]')
      expect(cards.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Cards de Métricas', () => {
    it('card de contratos deve ter estilo azul', () => {
      const { container } = render(<HomePage />)

      const contratosMetric = container.querySelector(
        '.text-2xl.font-bold.text-blue-600',
      )
      expect(contratosMetric).toBeInTheDocument()
      expect(contratosMetric).toHaveTextContent('--')
    })

    it('card de fornecedores deve ter estilo verde', () => {
      const { container } = render(<HomePage />)

      // Buscar pelo segundo placeholder "--" que é o de fornecedores
      const fornecedoresMetric = container.querySelectorAll(
        '.text-2xl.font-bold',
      )[1]
      expect(fornecedoresMetric).toHaveClass('text-green-600')
    })

    it('labels das métricas devem ter estilo consistente', () => {
      render(<HomePage />)

      const totalContratosLabel = screen.getByText('Total de contratos')
      const fornecedoresLabel = screen.getByText('Fornecedores cadastrados')

      expect(totalContratosLabel).toHaveClass('text-sm', 'text-gray-600')
      expect(fornecedoresLabel).toHaveClass('text-sm', 'text-gray-600')
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter título principal acessível', () => {
      render(<HomePage />)

      const titulo = screen.getByRole('heading', { level: 1 })
      expect(titulo).toHaveTextContent('Painel de Controle')
    })

    it('deve ter estrutura semântica correta', () => {
      const { container } = render(<HomePage />)

      // Verificar se existe uma estrutura hierárquica de conteúdo
      const mainContent = container.firstChild
      expect(mainContent).toBeInTheDocument()
    })

    it('cards devem ter títulos identificáveis', () => {
      render(<HomePage />)

      // Todos os card titles devem estar presentes e serem únicos
      const cardTitles = [
        'Bem-vindo ao Sistema',
        'Contratos Ativos',
        'Fornecedores',
      ]

      cardTitles.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument()
      })
    })
  })

  describe('Responsividade', () => {
    it('deve usar classes de grid responsivo corretas', () => {
      const { container } = render(<HomePage />)

      const gridElement = container.querySelector('.grid')
      expect(gridElement).toHaveClass(
        'gap-6',
        'md:grid-cols-2',
        'lg:grid-cols-3',
      )
    })
  })

  describe('Performance e Estado', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now()
      render(<HomePage />)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(200)
    })

    it('deve ser consistente entre renders', () => {
      const { container: container1 } = render(<HomePage />)
      const { container: container2 } = render(<HomePage />)

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })

    it('deve manter estado visual estático', () => {
      const { container, rerender } = render(<HomePage />)
      const initialHTML = container.innerHTML

      rerender(<HomePage />)

      expect(container.innerHTML).toBe(initialHTML)
    })
  })

  describe('Integração com LayoutPagina', () => {
    it('deve passar props corretas para LayoutPagina', () => {
      render(<HomePage />)

      // Verificar se as props foram passadas corretamente via mock
      expect(screen.getByText('Painel de Controle')).toBeInTheDocument()
      expect(
        screen.getByText('Visão geral do sistema de contratos'),
      ).toBeInTheDocument()
    })
  })
})
