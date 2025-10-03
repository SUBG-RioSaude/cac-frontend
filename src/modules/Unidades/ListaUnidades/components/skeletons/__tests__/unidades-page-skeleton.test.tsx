import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { UnidadesPageSkeleton } from '../unidades-page-skeleton'

// Helper para simular diferentes tamanhos de tela
const mockViewport = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('lg') ? width >= 1024 : width < 1024,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })
}

describe('UnidadesPageSkeleton', () => {
  beforeEach(() => {
    mockViewport(1024) // Desktop por padrão
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Renderização Básica', () => {
    it('deve renderizar corretamente', () => {
      render(<UnidadesPageSkeleton />)

      const skeleton = screen.getByTestId('unidades-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('min-h-screen', 'bg-gradient-to-br')
    })

    it('deve ter data-testid para identificação', () => {
      render(<UnidadesPageSkeleton />)

      expect(screen.getByTestId('unidades-skeleton')).toBeInTheDocument()
    })

    it('deve aplicar classes de layout responsivo', () => {
      render(<UnidadesPageSkeleton />)

      const container = screen.getByTestId('unidades-skeleton')
      expect(container).toHaveClass('p-6')

      const spacingContainer = container.querySelector('.space-y-6')
      expect(spacingContainer).toBeInTheDocument()
      expect(spacingContainer).toHaveClass('sm:space-y-8', 'lg:space-y-10')
    })
  })

  describe('Seção do Cabeçalho', () => {
    it('deve renderizar skeleton do cabeçalho', () => {
      render(<UnidadesPageSkeleton />)

      // Título principal
      const titleSkeleton = document.querySelector('.h-8.w-32')
      expect(titleSkeleton).toBeInTheDocument()

      // Subtítulo/descrição
      const subtitleSkeleton = document.querySelector('.h-5.w-80')
      expect(subtitleSkeleton).toBeInTheDocument()
    })

    it('deve renderizar botões do cabeçalho', () => {
      render(<UnidadesPageSkeleton />)

      // Deve ter skeletons de botões
      const buttonSkeletons = document.querySelectorAll(
        '.h-10.w-32, .h-10.w-36',
      )
      expect(buttonSkeletons.length).toBeGreaterThanOrEqual(2)
    })

    it('deve ter layout responsivo no cabeçalho', () => {
      render(<UnidadesPageSkeleton />)

      const headerContainer = document.querySelector(
        '.flex.flex-col.sm\\:flex-row',
      )
      expect(headerContainer).toBeInTheDocument()
      expect(headerContainer).toHaveClass('sm:items-start', 'justify-between')
    })
  })

  describe('Seção de Filtros', () => {
    it('deve renderizar barra de pesquisa skeleton', () => {
      render(<UnidadesPageSkeleton />)

      // Barra de pesquisa principal
      const searchSkeleton = document.querySelector('.h-11.w-full')
      expect(searchSkeleton).toBeInTheDocument()

      // Botões de ação da pesquisa
      const actionButtons = document.querySelectorAll('.h-11.w-20, .h-11.w-16')
      expect(actionButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('deve renderizar filtros avançados skeleton', () => {
      render(<UnidadesPageSkeleton />)

      // Labels dos filtros
      const filterLabels = document.querySelectorAll(
        '.h-4.w-12, .h-4.w-10, .h-4.w-20',
      )
      expect(filterLabels.length).toBeGreaterThanOrEqual(3)

      // Campos dos filtros
      const filterFields = document.querySelectorAll('.h-10.w-full')
      expect(filterFields.length).toBeGreaterThanOrEqual(4)
    })

    it('deve usar Cards com backdrop blur', () => {
      render(<UnidadesPageSkeleton />)

      const cards = document.querySelectorAll('.bg-card\\/50.backdrop-blur')
      expect(cards.length).toBeGreaterThanOrEqual(2) // Pelo menos barra de pesquisa e filtros
    })

    it('deve ter grid responsivo nos filtros', () => {
      render(<UnidadesPageSkeleton />)

      const filterGrid = document.querySelector(
        '.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4',
      )
      expect(filterGrid).toBeInTheDocument()
    })
  })

  describe('Seção da Tabela', () => {
    it('deve renderizar cabeçalho da tabela', () => {
      render(<UnidadesPageSkeleton />)

      // Título da seção
      const sectionTitle = document.querySelector('.h-6.w-40')
      expect(sectionTitle).toBeInTheDocument()

      // Contador/descrição
      const sectionDescription = document.querySelector('.h-4.w-32')
      expect(sectionDescription).toBeInTheDocument()
    })

    it('deve renderizar skeleton responsivo da tabela', () => {
      render(<UnidadesPageSkeleton />)

      // Versão mobile (cards)
      const mobileCards = document.querySelector('.block.lg\\:hidden')
      expect(mobileCards).toBeInTheDocument()

      // Versão desktop (tabela)
      const desktopTable = document.querySelector('.hidden.lg\\:block')
      expect(desktopTable).toBeInTheDocument()
    })

    it('deve renderizar múltiplos cards mobile skeleton', () => {
      render(<UnidadesPageSkeleton />)

      // Versão mobile deve estar presente
      const mobileContainer = document.querySelector(
        '.block.lg\\:hidden.space-y-3',
      )
      expect(mobileContainer).toBeInTheDocument()

      // Deve ter múltiplos cards (Card components com p-4)
      const cardElements = document.querySelectorAll(
        '.block.lg\\:hidden > [class*="p-4"]',
      )
      expect(cardElements.length).toBe(5) // Exatamente 5 cards como definido no componente
    })

    it('deve renderizar cabeçalho da tabela desktop', () => {
      render(<UnidadesPageSkeleton />)

      const tableHeader = document.querySelector('thead tr')
      expect(tableHeader).toBeInTheDocument()
      expect(tableHeader).toHaveClass('bg-muted/50')

      // Deve ter múltiplas colunas
      const headerCells = document.querySelectorAll('thead th')
      expect(headerCells.length).toBeGreaterThanOrEqual(10)
    })

    it('deve renderizar linhas da tabela desktop', () => {
      render(<UnidadesPageSkeleton />)

      // Deve ter 10 linhas de dados
      const tableRows = document.querySelectorAll('tbody tr')
      expect(tableRows.length).toBe(10)

      // Cada linha deve ter o mesmo número de células que o cabeçalho
      const headerCells = document.querySelectorAll('thead th')
      const firstRowCells = document.querySelectorAll('tbody tr:first-child td')
      expect(firstRowCells.length).toBe(headerCells.length)
    })

    it('deve renderizar botões de ação na tabela', () => {
      render(<UnidadesPageSkeleton />)

      // Botões de ação na última coluna
      const actionButtons = document.querySelectorAll(
        'tbody tr td:last-child .flex',
      )
      expect(actionButtons.length).toBe(10) // Uma por linha

      // Cada linha deve ter 3 botões de ação
      const firstRowActions = document.querySelectorAll(
        'tbody tr:first-child td:last-child .h-8.w-8',
      )
      expect(firstRowActions.length).toBe(3)
    })
  })

  describe('Seção de Paginação', () => {
    it('deve renderizar informações de paginação', () => {
      render(<UnidadesPageSkeleton />)

      // Informações sobre resultados
      const paginationInfo = document.querySelector('.h-4.w-48')
      expect(paginationInfo).toBeInTheDocument()
    })

    it('deve renderizar controles de paginação', () => {
      render(<UnidadesPageSkeleton />)

      // Botões anterior/próximo
      const navButtons = document.querySelectorAll('.h-8.w-20')
      expect(navButtons.length).toBeGreaterThanOrEqual(2)

      // Números de página (5 botões)
      const pageNumbers = document.querySelectorAll('.h-8.w-8')
      const paginationPageNumbers = Array.from(pageNumbers).filter((el) =>
        el.closest('.flex.items-center.gap-1'),
      )
      expect(paginationPageNumbers.length).toBeGreaterThanOrEqual(5)
    })

    it('deve ter layout responsivo na paginação', () => {
      render(<UnidadesPageSkeleton />)

      const paginationContainer = document.querySelector(
        '.flex.flex-col.gap-3.sm\\:flex-row.sm\\:items-center.sm\\:justify-between',
      )
      expect(paginationContainer).toBeInTheDocument()
      expect(paginationContainer).toHaveClass(
        'flex',
        'flex-col',
        'gap-3',
        'sm:flex-row',
        'sm:items-center',
        'sm:justify-between',
      )
    })
  })

  describe('Estados e Variações', () => {
    it('deve renderizar consistentemente em múltiplas renderizações', () => {
      const { rerender } = render(<UnidadesPageSkeleton />)

      const firstRender = screen.getByTestId('unidades-skeleton').innerHTML

      rerender(<UnidadesPageSkeleton />)

      const secondRender = screen.getByTestId('unidades-skeleton').innerHTML
      expect(firstRender).toBe(secondRender)
    })

    it('deve manter estrutura para diferentes conteúdos', () => {
      render(<UnidadesPageSkeleton />)

      // Estrutura deve sempre ter as seções principais
      expect(document.querySelector('.space-y-6')).toBeInTheDocument() // Container principal
      expect(
        document.querySelectorAll('.bg-card\\/50').length,
      ).toBeGreaterThanOrEqual(3) // Cards das seções
    })
  })

  describe('Responsividade', () => {
    it('deve adaptar para mobile', () => {
      render(<UnidadesPageSkeleton />)

      // Versão mobile deve estar visível
      const mobileVersion = document.querySelector('.block.lg\\:hidden')
      expect(mobileVersion).toBeInTheDocument()

      // Versão desktop deve estar oculta
      const desktopVersion = document.querySelector('.hidden.lg\\:block')
      expect(desktopVersion).toBeInTheDocument()
    })

    it('deve usar classes responsivas consistentes', () => {
      render(<UnidadesPageSkeleton />)

      // Verificar uso de breakpoints
      const responsiveElements = document.querySelectorAll(
        '[class*="sm:"], [class*="lg:"]',
      )
      expect(responsiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter atributo data-testid para testes', () => {
      render(<UnidadesPageSkeleton />)

      expect(screen.getByTestId('unidades-skeleton')).toBeInTheDocument()
    })

    it('deve usar elementos semânticos quando apropriado', () => {
      render(<UnidadesPageSkeleton />)

      // Table elementos
      expect(document.querySelector('table')).toBeInTheDocument()
      expect(document.querySelector('thead')).toBeInTheDocument()
      expect(document.querySelector('tbody')).toBeInTheDocument()
    })

    it('deve manter hierarquia visual com skeleton sizes', () => {
      render(<UnidadesPageSkeleton />)

      // Títulos devem ser maiores
      const titleSkeletons = document.querySelectorAll('.h-6, .h-8')
      expect(titleSkeletons.length).toBeGreaterThan(0)

      // Texto normal deve ser menor
      const textSkeletons = document.querySelectorAll('.h-3, .h-4, .h-5')
      expect(textSkeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now()
      render(<UnidadesPageSkeleton />)
      const endTime = performance.now()

      // Deve renderizar em menos de 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('deve gerar markup consistente', () => {
      const { container: container1 } = render(<UnidadesPageSkeleton />)
      const { container: container2 } = render(<UnidadesPageSkeleton />)

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })

  describe('Integração com Design System', () => {
    it('deve usar componentes do design system', () => {
      render(<UnidadesPageSkeleton />)

      // Deve usar Card components
      expect(document.querySelector('[class*="shadow-sm"]')).toBeInTheDocument()

      // Deve usar Table components
      expect(document.querySelector('table')).toBeInTheDocument()

      // Deve usar Skeleton components
      expect(
        document.querySelector('[class*="animate-pulse"]'),
      ).toBeInTheDocument()
    })

    it('deve seguir padrões de spacing do design system', () => {
      render(<UnidadesPageSkeleton />)

      // Spacing classes consistentes
      const spacingElements = document.querySelectorAll(
        '[class*="space-y-"], [class*="gap-"]',
      )
      expect(spacingElements.length).toBeGreaterThan(0)
    })

    it('deve usar cores consistentes do tema', () => {
      render(<UnidadesPageSkeleton />)

      // Background colors do tema
      const backgroundElements = document.querySelectorAll('[class*="bg-"]')
      expect(backgroundElements.length).toBeGreaterThan(0)

      // Verificar uso de variáveis de cor
      const themeColors = document.querySelectorAll(
        '[class*="bg-card"], [class*="bg-muted"], [class*="bg-background"]',
      )
      expect(themeColors.length).toBeGreaterThan(0)
    })
  })
})
