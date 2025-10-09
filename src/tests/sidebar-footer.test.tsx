import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import SidebarFooter from '@/components/sidebar-footer'
import { SidebarProvider } from '@/components/ui/sidebar'

vi.mock('@/components/nav-user', () => ({
  NavUser: () => <div data-testid="nav-user">Mock NavUser</div>,
}))

// Mock do sistema de versionamento
vi.mock('@/lib/versao', () => ({
  VERSAO_APP: '1.0.0',
  obterVersaoApp: () => '1.0.0',
  obterAnoAtual: () => 2024,
  obterMetadataVersao: () => ({
    versao: '1.0.0',
    commitSha: 'abc1234',
    buildNumber: '1',
    buildTimestamp: '2024-01-01',
    ambiente: 'development',
  }),
}))

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

    expect(
      screen.getByText('Desenvolvido pelo time de TI 2024'),
    ).toBeInTheDocument()
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('deve renderizar apenas a versão quando colapsada', () => {
    renderWithSidebarProvider(false)

    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
    // Não deve mostrar o texto do desenvolvedor quando colapsada
    expect(
      screen.queryByText('Desenvolvido pelo time de TI 2024'),
    ).not.toBeInTheDocument()
  })

  it('deve usar o ano atual na mensagem do desenvolvedor', () => {
    renderWithSidebarProvider(true)

    expect(
      screen.getByText('Desenvolvido pelo time de TI 2024'),
    ).toBeInTheDocument()
  })

  it('deve ter estilos corretos para o texto da versão', () => {
    renderWithSidebarProvider(true)

    const versaoElement = screen.getByText('v1.0.0')
    expect(versaoElement).toHaveClass('text-xs')
    expect(versaoElement).toHaveClass('font-mono')
  })

  it('deve renderizar com cores da sidebar', () => {
    renderWithSidebarProvider(true)

    const container = screen.getByText('v1.0.0').closest('div')
    expect(container).toHaveClass('text-sidebar-foreground/60')
    expect(container).toHaveClass('font-mono')
  })
})
