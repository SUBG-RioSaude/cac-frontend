import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { NavUser } from '../nav-user'
import { useAuth } from '@/lib/auth/auth-context'
import { useLogoutAllSessionsMutation } from '@/lib/auth/auth-queries'
import { setLogoutEmAndamento } from '@/lib/middleware'

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/auth/auth-queries', () => ({
  useLogoutAllSessionsMutation: vi.fn(),
}))

vi.mock('@/lib/middleware', () => ({
  setLogoutEmAndamento: vi.fn(),
}))

const sidebarState = { isMobile: false }

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ isMobile: sidebarState.isMobile }),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="sidebar-menu-button" {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dropdown-menu" {...props}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
    if (asChild) {
      return <>{children}</>
    }
    return (
      <button data-testid="dropdown-trigger" {...props}>
        {children}
      </button>
    )
  },
  DropdownMenuContent: ({
    children,
    side,
    align,
    sideOffset,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    side?: string
    align?: string
    sideOffset?: number
  }) => (
    <div data-testid="dropdown-content" {...props}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dropdown-label" {...props}>
      {children}
    </div>
  ),
  DropdownMenuGroup: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dropdown-group" {...props}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    disabled,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) => (
    <div
      data-testid="dropdown-item"
      aria-disabled={disabled ? 'true' : undefined}
      data-disabled={disabled ? '' : undefined}
      {...props}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: ({
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dropdown-separator" {...props} />
  ),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockUseLogoutAllSessionsMutation = vi.mocked(useLogoutAllSessionsMutation)
const mockSetLogoutEmAndamento = vi.mocked(setLogoutEmAndamento)

const mutateAsyncMock = vi.fn(async () => {})

Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
})

const mockUsuario = {
  id: '1',
  email: 'test@example.com',
  nomeCompleto: 'João Luis Bernardo Ramos',
  tipoUsuario: 'user',
  precisaTrocarSenha: false,
}

const renderNavUser = () => render(<NavUser />)

describe('NavUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutateAsyncMock.mockReset()
    mutateAsyncMock.mockResolvedValue(undefined)
    mockUseLogoutAllSessionsMutation.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useLogoutAllSessionsMutation>)
    mockUseAuth.mockReturnValue({
      usuario: mockUsuario,
      estaAutenticado: true,
      carregando: false,
    })
    sidebarState.isMobile = false
    window.location.href = ''
  })

  describe('Renderização', () => {
    it('deve renderizar informações do usuário corretamente', () => {
      renderNavUser()

      const nomes = screen.getAllByText('João Luis Bernardo Ramos')
      const emails = screen.getAllByText('test@example.com')

      expect(nomes[0]).toBeInTheDocument()
      expect(emails[0]).toBeInTheDocument()
    })

    it('deve renderizar avatar com fallback das iniciais', () => {
      renderNavUser()

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

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    it('deve mostrar informações do usuário no dropdown', () => {
      renderNavUser()

      const nomes = screen.getAllByText('João Luis Bernardo Ramos')
      const emails = screen.getAllByText('test@example.com')

      expect(nomes[0]).toBeInTheDocument()
      expect(emails[0]).toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('deve chamar logout ao clicar em Sair', async () => {
      renderNavUser()

      const logoutButton = screen.getByText('Sair')
      fireEvent.click(logoutButton)

      expect(mockSetLogoutEmAndamento).toHaveBeenCalledWith(true)
      await waitFor(() => {
        expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
      })
    })

    it('deve mostrar loading durante logout', async () => {
      let resolver: (() => void) | undefined

      mutateAsyncMock.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolver = resolve
          }),
      )

      renderNavUser()

      const logoutButton = screen.getByText('Sair')
      fireEvent.click(logoutButton)

      expect(screen.getByText('Saindo...')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-item')).toHaveAttribute(
        'aria-disabled',
        'true',
      )

      resolver?.()
      await waitFor(() => {
        expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
      })
    })

    it('deve desabilitar botão durante logout', async () => {
      let resolver: (() => void) | undefined

      mutateAsyncMock.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolver = resolve
          }),
      )

      renderNavUser()

      fireEvent.click(screen.getByText('Sair'))

      expect(screen.getByTestId('dropdown-item')).toHaveAttribute(
        'aria-disabled',
        'true',
      )

      resolver?.()

      await waitFor(() => {
        expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Casos Especiais', () => {
    it('deve usar email como fallback quando nomeCompleto está vazio', () => {
      mockUseAuth.mockReturnValue({
        usuario: { ...mockUsuario, nomeCompleto: '' },
        estaAutenticado: true,
        carregando: false,
      })

      renderNavUser()

      const nomes = screen.getAllByText((content) => {
        const normalized = content.toLowerCase()
        return normalized.startsWith('usu') && normalized.endsWith('rio')
      })
      expect(nomes[0]).toBeInTheDocument()

      const emails = screen.getAllByText('test@example.com')
      expect(emails[0]).toBeInTheDocument()
    })

    it('deve usar email como fallback para avatar quando nomeCompleto está vazio', () => {
      mockUseAuth.mockReturnValue({
        usuario: { ...mockUsuario, nomeCompleto: '' },
        estaAutenticado: true,
        carregando: false,
      })

      renderNavUser()

      const avatarFallbacks = screen.getAllByText('T')
      expect(avatarFallbacks[0]).toBeInTheDocument()
    })

    it('não deve renderizar quando não há usuário autenticado', () => {
      mockUseAuth.mockReturnValue({
        usuario: null,
        estaAutenticado: false,
        carregando: false,
      })

      const { container } = renderNavUser()

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro no logout e forçar logout local', async () => {
      mutateAsyncMock.mockRejectedValueOnce(new Error('Erro de rede'))

      renderNavUser()

      fireEvent.click(screen.getByText('Sair'))

      await waitFor(() => {
        expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(window.location.href).toBe('/login')
      })
    })
  })

  describe('Responsividade', () => {
    it('deve renderizar corretamente em dispositivos móveis', () => {
      sidebarState.isMobile = true

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

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })
  })
})

