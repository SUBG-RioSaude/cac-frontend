import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { SidebarProvider } from '@/components/ui/sidebar'

import SidebarFooter from '../sidebar-footer'

// Mock das dependências
vi.mock('@/lib/versao', () => ({
  obterVersaoApp: () => '1.2.3',
  obterAnoAtual: () => 2024,
  obterMetadataVersao: () => ({
    versao: '1.2.3',
    commitSha: 'abc1234',
    buildNumber: '42',
    buildTimestamp: '2024-01-01',
    ambiente: 'development',
  }),
}))

// Mock do NavUser
vi.mock('@/components/nav-user', () => ({
  NavUser: () => <div data-testid="nav-user">NavUser Component</div>,
}))

// Mock do useAuth para NavUser
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      nomeCompleto: 'Test User',
      email: 'test@example.com',
    },
    isLoading: false,
    logoutTodasSessoes: vi.fn(),
  }),
}))

describe('SidebarFooter', () => {
  const renderWithSidebar = (collapsed = false) => {
    return render(
      <SidebarProvider defaultOpen={!collapsed}>
        <SidebarFooter />
      </SidebarProvider>,
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('estado expandido', () => {
    it('deve renderizar corretamente quando expandido', () => {
      renderWithSidebar(false)

      expect(screen.getByTestId('nav-user')).toBeInTheDocument()
      expect(
        screen.getByText('Desenvolvido pelo time de TI 2024'),
      ).toBeInTheDocument()
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    })

    it('deve mostrar informações completas do desenvolvedor', () => {
      renderWithSidebar(false)

      const developerText = screen.getByText(
        'Desenvolvido pelo time de TI 2024',
      )
      expect(developerText).toBeInTheDocument()
      expect(developerText).toHaveClass('text-sidebar-foreground/70', 'text-xs')
    })

    it('deve mostrar versão com estilo mono', () => {
      renderWithSidebar(false)

      const version = screen.getByText('v1.2.3')
      expect(version).toBeInTheDocument()
      expect(version).toHaveClass(
        'text-sidebar-foreground/60',
        'font-mono',
        'text-xs',
      )
    })

    it('deve ter estrutura correta com separador', () => {
      const { container } = renderWithSidebar(false)

      const separator = container.querySelector('.bg-sidebar-border\\/50')
      expect(separator).toBeInTheDocument()
    })

    it('deve ter classes de estilo corretas para estado expandido', () => {
      const { container } = renderWithSidebar(false)

      const footer = container.querySelector(
        '.border-sidebar-border.bg-sidebar.text-sidebar-foreground.border-t',
      )
      expect(footer).toBeInTheDocument()
    })

    it('deve ter layout centralizado', () => {
      const { container } = renderWithSidebar(false)

      const contentArea = container.querySelector('.space-y-2.text-center')
      expect(contentArea).toBeInTheDocument()
    })
  })

  describe('estado colapsado', () => {
    it('deve renderizar versão compacta quando colapsado', () => {
      renderWithSidebar(true)

      expect(screen.getByTestId('nav-user')).toBeInTheDocument()
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    })

    it('deve ocultar texto do desenvolvedor quando colapsado', () => {
      renderWithSidebar(true)

      expect(
        screen.queryByText('Desenvolvido pelo time de TI 2024'),
      ).not.toBeInTheDocument()
    })

    it('deve mostrar apenas versão em formato compacto', () => {
      renderWithSidebar(true)

      const version = screen.getByText('v1.2.3')
      expect(version).toBeInTheDocument()
      expect(version).toHaveClass(
        'text-sidebar-foreground/60',
        'font-mono',
        'text-xs',
      )
    })

    it('deve ter classes de estilo corretas para estado colapsado', () => {
      const { container } = renderWithSidebar(true)

      const footer = container.querySelector(
        '.border-sidebar-border.bg-sidebar.border-t',
      )
      expect(footer).toBeInTheDocument()
    })

    it('deve ter layout centralizado compacto', () => {
      const { container } = renderWithSidebar(true)

      const contentArea = container.querySelector('.p-2.text-center')
      expect(contentArea).toBeInTheDocument()
    })

    it('não deve mostrar separador quando colapsado', () => {
      const { container } = renderWithSidebar(true)

      const separator = container.querySelector('.bg-sidebar-border\\/50')
      expect(separator).not.toBeInTheDocument()
    })
  })

  describe('componente NavUser', () => {
    it('deve incluir NavUser em ambos os estados', () => {
      // Estado expandido
      const { rerender } = renderWithSidebar(false)
      expect(screen.getByTestId('nav-user')).toBeInTheDocument()

      // Estado colapsado
      rerender(
        <SidebarProvider>
          <div data-sidebar="collapsed">
            <SidebarFooter />
          </div>
        </SidebarProvider>,
      )
      expect(screen.getByTestId('nav-user')).toBeInTheDocument()
    })
  })

  describe('informações de versão', () => {
    it('deve exibir versão correta do mock', () => {
      renderWithSidebar(false)

      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    })

    it('deve exibir ano correto do mock', () => {
      renderWithSidebar(false)

      expect(
        screen.getByText('Desenvolvido pelo time de TI 2024'),
      ).toBeInTheDocument()
    })

    it('deve manter versão visível em ambos os estados', () => {
      // Estado expandido
      const { rerender } = renderWithSidebar(false)
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()

      // Estado colapsado
      rerender(
        <SidebarProvider>
          <div data-sidebar="collapsed">
            <SidebarFooter />
          </div>
        </SidebarProvider>,
      )
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    })
  })

  describe('responsividade', () => {
    it('deve adaptar layout baseado no estado da sidebar', () => {
      const { container } = renderWithSidebar(false)

      // Estado expandido - deve ter mais conteúdo
      const expandedContent = container.querySelector('.space-y-2.text-center')
      expect(expandedContent).toBeInTheDocument()

      // Testando estado colapsado separadamente
      const { container: collapsedContainer } = renderWithSidebar(true)
      const collapsedContent =
        collapsedContainer.querySelector('.p-2.text-center')
      expect(collapsedContent).toBeInTheDocument()
    })
  })

  describe('estrutura semântica', () => {
    it('deve ter estrutura HTML apropriada', () => {
      const { container } = renderWithSidebar(false)

      // Deve ter div principal
      expect(container.firstChild).toBeTruthy()
      expect(container.firstChild.tagName).toBe('DIV')
    })

    it('deve manter hierarquia de elementos correta', () => {
      renderWithSidebar(false)

      // NavUser deve estar presente
      expect(screen.getByTestId('nav-user')).toBeInTheDocument()

      // Textos informativos devem estar presentes
      expect(
        screen.getByText('Desenvolvido pelo time de TI 2024'),
      ).toBeInTheDocument()
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    })
  })

  describe('acessibilidade', () => {
    it('deve ter texto legível para screen readers', () => {
      renderWithSidebar(false)

      const developerText = screen.getByText(
        'Desenvolvido pelo time de TI 2024',
      )
      const versionText = screen.getByText('v1.2.3')

      expect(developerText).toBeInTheDocument()
      expect(versionText).toBeInTheDocument()
    })

    it('deve manter conteúdo acessível mesmo quando colapsado', () => {
      renderWithSidebar(true)

      const versionText = screen.getByText('v1.2.3')
      expect(versionText).toBeInTheDocument()
    })
  })
})
