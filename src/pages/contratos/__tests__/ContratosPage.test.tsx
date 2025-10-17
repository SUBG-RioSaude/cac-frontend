import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import ContratosPage from '../ContratosPage'

// Mock do LayoutPagina
vi.mock('@/components/layout-pagina', () => ({
  default: ({ children }: any) => (
    <div data-testid="layout-pagina">{children}</div>
  ),
}))

// Mock da ContratosPageModerna
vi.mock(
  '@/modules/Contratos/pages/VisualizacaoContratos/ContratosListPage',
  () => ({
    ContratosPage: () => (
      <div data-testid="contratos-page-moderna">Contratos Page Content</div>
    ),
  }),
)

describe('ContratosPage', () => {
  describe('Renderização', () => {
    it('deve renderizar LayoutPagina', () => {
      render(<ContratosPage />)

      expect(screen.getByTestId('layout-pagina')).toBeInTheDocument()
    })

    it('deve renderizar ContratosPageModerna dentro do layout', () => {
      render(<ContratosPage />)

      expect(screen.getByTestId('contratos-page-moderna')).toBeInTheDocument()
      expect(screen.getByText('Contratos Page Content')).toBeInTheDocument()
    })

    it('deve ter estrutura main correta', () => {
      const { container } = render(<ContratosPage />)

      const mainElement = container.querySelector('main')
      expect(mainElement).toBeInTheDocument()
      expect(mainElement).toHaveClass('flex-1', 'overflow-auto')
    })
  })

  describe('Layout e Estrutura', () => {
    it('deve ter hierarquia de componentes correta', () => {
      const { container } = render(<ContratosPage />)

      // LayoutPagina deve ser o container principal
      const layout = screen.getByTestId('layout-pagina')
      expect(layout).toBeInTheDocument()

      // Main deve estar dentro do layout
      const mainElement = container.querySelector('main.flex-1.overflow-auto')
      expect(mainElement).toBeInTheDocument()

      // ContratosPageModerna deve estar dentro do main
      const contratosPageModerna = screen.getByTestId('contratos-page-moderna')
      expect(contratosPageModerna).toBeInTheDocument()
      expect(mainElement).toContainElement(contratosPageModerna)
    })

    it('deve usar classes CSS corretas para scroll', () => {
      const { container } = render(<ContratosPage />)

      const mainElement = container.querySelector('main')
      expect(mainElement).toHaveClass('flex-1')
      expect(mainElement).toHaveClass('overflow-auto')
    })
  })

  describe('Integração de Componentes', () => {
    it('deve renderizar LayoutPagina sem props específicas', () => {
      render(<ContratosPage />)

      // Como não há props específicas, apenas verificar se renderiza
      const layout = screen.getByTestId('layout-pagina')
      expect(layout).toBeInTheDocument()
    })

    it('deve encapsular ContratosPageModerna corretamente', () => {
      render(<ContratosPage />)

      const contratosContent = screen.getByTestId('contratos-page-moderna')
      expect(contratosContent).toBeInTheDocument()

      // Verificar se o conteúdo está presente
      expect(screen.getByText('Contratos Page Content')).toBeInTheDocument()
    })
  })

  describe('Responsividade e Layout', () => {
    it('deve ter main com flex-1 para ocupar espaço disponível', () => {
      const { container } = render(<ContratosPage />)

      const mainElement = container.querySelector('main')
      expect(mainElement).toHaveClass('flex-1')
    })

    it('deve ter overflow-auto para scroll quando necessário', () => {
      const { container } = render(<ContratosPage />)

      const mainElement = container.querySelector('main')
      expect(mainElement).toHaveClass('overflow-auto')
    })
  })

  describe('Performance e Estado', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now()
      render(<ContratosPage />)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50)
    })

    it('deve ser consistente entre renders', () => {
      const { container: container1 } = render(<ContratosPage />)
      const { container: container2 } = render(<ContratosPage />)

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })

    it('deve manter estado visual durante re-renders', () => {
      const { container, rerender } = render(<ContratosPage />)
      const initialHTML = container.innerHTML

      rerender(<ContratosPage />)

      expect(container.innerHTML).toBe(initialHTML)
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter elemento main com semântica correta', () => {
      render(<ContratosPage />)

      const mainElement = screen.getByRole('main')
      expect(mainElement).toBeInTheDocument()
    })

    it('deve ter estrutura hierárquica adequada', () => {
      const { container } = render(<ContratosPage />)

      // Verificar hierarquia: LayoutPagina > main > ContratosPageModerna
      const layout = screen.getByTestId('layout-pagina')
      const main = container.querySelector('main')
      const contratos = screen.getByTestId('contratos-page-moderna')

      expect(layout).toContainElement(main)
      expect(main).toContainElement(contratos)
    })
  })

  describe('Mocks e Dependências', () => {
    it('deve usar mock do LayoutPagina corretamente', () => {
      render(<ContratosPage />)

      // Verificar se o mock está funcionando
      expect(screen.getByTestId('layout-pagina')).toBeInTheDocument()
    })

    it('deve usar mock da ContratosPageModerna corretamente', () => {
      render(<ContratosPage />)

      // Verificar se o mock está funcionando
      expect(screen.getByTestId('contratos-page-moderna')).toBeInTheDocument()
      expect(screen.getByText('Contratos Page Content')).toBeInTheDocument()
    })

    it('deve manter isolamento de testes', () => {
      // Renderizar múltiplas vezes para garantir que mocks não interferem
      const { unmount } = render(<ContratosPage />)
      expect(screen.getByTestId('layout-pagina')).toBeInTheDocument()

      unmount()

      render(<ContratosPage />)
      expect(screen.getByTestId('layout-pagina')).toBeInTheDocument()
    })
  })

  describe('Estrutura Simples e Wrapper', () => {
    it('deve ser uma página wrapper simples', () => {
      const { container } = render(<ContratosPage />)

      // Deve ter uma estrutura simples: LayoutPagina > main > ContratosPageModerna
      const elements = container.querySelectorAll('*')

      // Não deve ter muitos elementos (página wrapper simples)
      expect(elements.length).toBeLessThan(10)
    })

    it('deve focar em composição de componentes', () => {
      render(<ContratosPage />)

      // Verificar que os componentes principais estão presentes
      expect(screen.getByTestId('layout-pagina')).toBeInTheDocument()
      expect(screen.getByTestId('contratos-page-moderna')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })
})
