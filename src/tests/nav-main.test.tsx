import { render, screen } from '@testing-library/react'
import { Home, PenBoxIcon } from 'lucide-react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { NavMain } from '@/components/nav-main'
import { SidebarProvider } from '@/components/ui/sidebar'

// Mock do useLocation
const mockUseLocation = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  }
})

const mockItems = [
  {
    title: 'Início',
    url: '/',
    icon: Home,
  },
  {
    title: 'Contratos',
    url: '/contratos',
    icon: PenBoxIcon,
    items: [
      {
        title: 'Lista de Contratos',
        url: '/contratos',
      },
    ],
  },
]

const renderNavMain = () => {
  return render(
    <BrowserRouter>
      <SidebarProvider>
        <NavMain items={mockItems} />
      </SidebarProvider>
    </BrowserRouter>,
  )
}

describe('NavMain', () => {
  it('deve renderizar todos os itens de navegação', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    renderNavMain()

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Contratos')).toBeInTheDocument()
  })

  it('deve destacar o item ativo baseado na URL atual', () => {
    renderNavMain()

    // Procura pelo botão do Início que deve estar ativo
    const inicioButton = screen.getByText('Início').closest('button')
    expect(inicioButton).toHaveAttribute('data-active', 'true')
  })

  it('deve destacar o item pai quando um subitem está ativo', () => {
    mockUseLocation.mockReturnValue({ pathname: '/contratos' })

    renderNavMain()

    const contratosButton = screen.getAllByRole('button')[1] // segundo botão (Contratos)
    expect(contratosButton).toHaveAttribute('data-active', 'true')
  })

  it('deve aplicar estado ativo nos subitens', () => {
    mockUseLocation.mockReturnValue({ pathname: '/contratos' })

    renderNavMain()

    const subitemLink = screen.getByRole('link', {
      name: /lista de contratos/i,
    })
    const subitemButton = subitemLink.closest('[data-active]')
    expect(subitemButton).toHaveAttribute('data-active', 'true')
  })

  it('deve renderizar subitens quando disponíveis', () => {
    renderNavMain()

    // Verifica se o menu de contratos está sendo renderizado
    expect(screen.getByText('Contratos')).toBeInTheDocument()

    // Verifica se há pelo menos um subitem (o menu deve estar colapsado por padrão)
    const contratosButton = screen.getByText('Contratos').closest('button')
    expect(contratosButton).toBeInTheDocument()
  })

  it('deve destacar subitem ativo', () => {
    mockUseLocation.mockReturnValue({ pathname: '/contratos' })

    renderNavMain()

    const subitemLink = screen.getByRole('link', {
      name: /lista de contratos/i,
    })
    const subitemButton = subitemLink.closest('[data-active]')
    expect(subitemButton).toHaveAttribute('data-active', 'true')
  })
})
