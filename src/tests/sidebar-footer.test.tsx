import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SidebarFooter from '@/components/sidebar-footer'
import { SidebarProvider } from '@/components/ui/sidebar'
import { VERSAO_APP } from '@/lib/versao'

// Mock do hook useIsMobile usado pelo SidebarProvider
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

const renderWithSidebarProvider = (defaultOpen = true) => {
  return render(
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarFooter />
    </SidebarProvider>,
  )
}

describe('SidebarFooter', () => {
  it('deve renderizar as informações do desenvolvedor quando expandida', () => {
    renderWithSidebarProvider(true)

    const anoAtual = new Date().getFullYear()
    expect(
      screen.getByText(`Desenvolvido pelo time de TI ${anoAtual}`),
    ).toBeInTheDocument()
    expect(screen.getByText(`v${VERSAO_APP}`)).toBeInTheDocument()
  })

  it('deve renderizar apenas a versão quando colapsada', () => {
    renderWithSidebarProvider(false)

    expect(screen.getByText(`v${VERSAO_APP}`)).toBeInTheDocument()
    // Não deve mostrar o texto do desenvolvedor quando colapsada
    const anoAtual = new Date().getFullYear()
    expect(
      screen.queryByText(`Desenvolvido pelo time de TI ${anoAtual}`),
    ).not.toBeInTheDocument()
  })

  it('deve usar o ano atual na mensagem do desenvolvedor', () => {
    renderWithSidebarProvider(true)

    const anoAtual = new Date().getFullYear()
    expect(
      screen.getByText(`Desenvolvido pelo time de TI ${anoAtual}`),
    ).toBeInTheDocument()
  })

  it('deve ter estilos corretos para o texto da versão', () => {
    renderWithSidebarProvider(true)

    const versaoElement = screen.getByText(`v${VERSAO_APP}`)
    expect(versaoElement).toHaveClass('text-xs')
    expect(versaoElement).toHaveClass('font-mono')
  })

  it('deve renderizar com cores da sidebar', () => {
    renderWithSidebarProvider(true)

    const container = screen.getByText(`v${VERSAO_APP}`).closest('div')
    expect(container).toHaveClass('bg-sidebar')
    expect(container).toHaveClass('text-sidebar-foreground')
  })
})
