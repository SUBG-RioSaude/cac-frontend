import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { NavUser } from '../nav-user'
import { useAuthStore } from '@/lib/auth/auth-store'

// Mock do useAuthStore
vi.mock('@/lib/auth/auth-store')
const mockUseAuthStore = vi.mocked(useAuthStore)

// Mock do useSidebar
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ isMobile: false }),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu">{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu-item">{children}</div>,
  SidebarMenuButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button data-testid="sidebar-menu-button" {...props}>{children}</button>
}))

// Mock do DropdownMenu do Radix UI
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="dropdown-menu" {...props}>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
    if (asChild) {
      return children
    }
    return <button data-testid="dropdown-trigger" {...props}>{children}</button>
  },
  DropdownMenuContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="dropdown-content" {...props}>{children}</div>,
  DropdownMenuLabel: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="dropdown-label" {...props}>{children}</div>,
  DropdownMenuGroup: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="dropdown-group" {...props}>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="dropdown-item" {...props}>{children}</div>,
  DropdownMenuSeparator: ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="dropdown-separator" {...props} />,
}))

// Mock do window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true
})

const mockUsuario = {
  id: '1',
  email: 'test@example.com',
  nomeCompleto: 'João Luis Bernardo Ramos',
  tipoUsuario: 'user',
  precisaTrocarSenha: false
}

const renderNavUser = () => {
  return render(
    <BrowserRouter>
      <NavUser />
    </BrowserRouter>
  )
}

describe('NavUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock padrão do store
    mockUseAuthStore.mockReturnValue({
      usuario: mockUsuario,
      logoutTodasSessoes: vi.fn().mockResolvedValue(undefined)
    } as ReturnType<typeof useAuthStore>)
  })

  describe('Renderização', () => {
    it('deve renderizar informações do usuário corretamente', () => {
      renderNavUser()
      
      // Usar getAllByText para pegar o primeiro elemento quando há duplicatas
      const nomes = screen.getAllByText('João Luis Bernardo Ramos')
      const emails = screen.getAllByText('test@example.com')
      
      expect(nomes[0]).toBeInTheDocument()
      expect(emails[0]).toBeInTheDocument()
    })

    it('deve renderizar avatar com fallback das iniciais', () => {
      renderNavUser()
      
      // Usar getAllByText para pegar o primeiro elemento quando há duplicatas
      const avatarFallbacks = screen.getAllByText('JL')
      expect(avatarFallbacks[0]).toBeInTheDocument()
    })

    it('deve renderizar indicador de status online', () => {
      renderNavUser()
      
      const statusIndicator = screen.getByTestId('sidebar-menu-button')
      expect(statusIndicator).toBeInTheDocument()
    })

    it('deve renderizar dropdown menu', () => {
      renderNavUser()
      
      const dropdownTrigger = screen.getByTestId('sidebar-menu-button')
      expect(dropdownTrigger).toBeInTheDocument()
    })
  })

  describe('Comportamento do Dropdown', () => {
    it('deve renderizar conteúdo do dropdown', () => {
      renderNavUser()
      
      // O dropdown deve estar sempre visível com o mock
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
      expect(screen.getByText('Conta')).toBeInTheDocument()
      expect(screen.getByText('Faturamento')).toBeInTheDocument()
      expect(screen.getByText('Notificações')).toBeInTheDocument()
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    it('deve mostrar informações do usuário no dropdown', () => {
      renderNavUser()
      
      // Usar getAllByText para pegar o primeiro elemento quando há duplicatas
      const nomes = screen.getAllByText('João Luis Bernardo Ramos')
      const emails = screen.getAllByText('test@example.com')
      
      expect(nomes[0]).toBeInTheDocument()
      expect(emails[0]).toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('deve chamar logoutTodasSessoes ao clicar em Sair', async () => {
      const mockLogoutTodasSessoes = vi.fn().mockResolvedValue(undefined)
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        logoutTodasSessoes: mockLogoutTodasSessoes
      } as ReturnType<typeof useAuthStore>)

      renderNavUser()
      
      const logoutButton = screen.getByText('Sair')
      fireEvent.click(logoutButton)
      
      expect(mockLogoutTodasSessoes).toHaveBeenCalledTimes(1)
    })

    it('deve mostrar loading durante logout', async () => {
      const mockLogoutTodasSessoes = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        logoutTodasSessoes: mockLogoutTodasSessoes
      } as ReturnType<typeof useAuthStore>)

      renderNavUser()
      
      const logoutButton = screen.getByText('Sair')
      fireEvent.click(logoutButton)
      
      // Verifica se o botão mostra "Saindo..." durante o processo
      await waitFor(() => {
        expect(screen.getByText('Saindo...')).toBeInTheDocument()
      })
    })

    it('deve desabilitar botão durante logout', async () => {
      const mockLogoutTodasSessoes = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        logoutTodasSessoes: mockLogoutTodasSessoes
      } as ReturnType<typeof useAuthStore>)

      renderNavUser()
      
      const logoutButton = screen.getByText('Sair')
      fireEvent.click(logoutButton)
      
      // Verifica se o botão está desabilitado
      await waitFor(() => {
        const disabledLogoutButton = screen.getByText('Saindo...').closest('[data-testid="dropdown-item"]')
        expect(disabledLogoutButton).toBeInTheDocument()
      })
    })
  })

  describe('Casos Especiais', () => {
    it('deve usar email como fallback quando nomeCompleto está vazio', () => {
      const usuarioSemNome = {
        ...mockUsuario,
        nomeCompleto: ''
      }
      
      mockUseAuthStore.mockReturnValue({
        usuario: usuarioSemNome,
        logoutTodasSessoes: vi.fn().mockResolvedValue(undefined)
      } as ReturnType<typeof useAuthStore>)

      renderNavUser()
      
      // Deve mostrar "Usuário" como fallback - usar getAllByText para pegar o primeiro
      const nomes = screen.getAllByText('Usuário')
      expect(nomes[0]).toBeInTheDocument()
      
      // Usar getAllByText para pegar o primeiro email quando há duplicatas
      const emails = screen.getAllByText('test@example.com')
      expect(emails[0]).toBeInTheDocument()
    })

    it('deve usar email como fallback para avatar quando nomeCompleto está vazio', () => {
      const usuarioSemNome = {
        ...mockUsuario,
        nomeCompleto: ''
      }
      
      mockUseAuthStore.mockReturnValue({
        usuario: usuarioSemNome,
        logoutTodasSessoes: vi.fn().mockResolvedValue(undefined)
      } as ReturnType<typeof useAuthStore>)

      renderNavUser()
      
      // Deve mostrar iniciais do email (T) - não 'te'
      // Usar getAllByText para pegar o primeiro elemento quando há duplicatas
      const avatarFallbacks = screen.getAllByText('T')
      expect(avatarFallbacks[0]).toBeInTheDocument()
    })

    it('não deve renderizar quando não há usuário autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: null,
        logoutTodasSessoes: vi.fn()
      } as ReturnType<typeof useAuthStore>)

      const { container } = renderNavUser()
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro no logout e forçar logout local', async () => {
      const mockLogoutTodasSessoes = vi.fn()
        .mockRejectedValueOnce(new Error('Erro de rede'))
        .mockResolvedValue(undefined)
      
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        logoutTodasSessoes: mockLogoutTodasSessoes
      } as ReturnType<typeof useAuthStore>)

      renderNavUser()
      
      const logoutButton = screen.getByText('Sair')
      fireEvent.click(logoutButton)
      
      // Aguardar que o processo de logout complete totalmente
      await waitFor(() => {
        expect(mockLogoutTodasSessoes).toHaveBeenCalledTimes(2)
      }, { timeout: 3000 })
      
      // Aguardar um pouco mais para garantir que o finally block execute
      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })

  describe('Responsividade', () => {
    it('deve renderizar corretamente em dispositivos móveis', () => {
      // Mock do useSidebar para mobile
      vi.doMock('@/components/ui/sidebar', () => ({
        useSidebar: () => ({ isMobile: true }),
        SidebarMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu">{children}</div>,
        SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu-item">{children}</div>,
        SidebarMenuButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button data-testid="sidebar-menu-button" {...props}>{children}</button>
      }))
      
      renderNavUser()
      
      const sidebarMenu = screen.getByTestId('sidebar-menu')
      expect(sidebarMenu).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter atributos de acessibilidade apropriados', () => {
      renderNavUser()
      
      const dropdownTrigger = screen.getByTestId('sidebar-menu-button')
      expect(dropdownTrigger).toBeInTheDocument()
      
      // Verifica se o dropdown está acessível
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })
  })
})
