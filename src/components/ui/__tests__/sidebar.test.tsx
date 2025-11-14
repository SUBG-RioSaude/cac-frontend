import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

// Mock do next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light' })),
}))

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '../sidebar'

// Componente de teste para verificar o hook useSidebar
const TestSidebarHook = ({
  onSidebarData,
}: {
  onSidebarData: (data: ReturnType<typeof useSidebar>) => void
}) => {
  try {
    const sidebarData = useSidebar()
    onSidebarData(sidebarData)
    return <div data-testid="sidebar-hook-success">Hook funcionando</div>
  } catch (error) {
    return (
      <div data-testid="sidebar-hook-error">{(error as Error).message}</div>
    )
  }
}

describe('Sidebar Components', () => {
  describe('useSidebar hook', () => {
    it('deve lançar erro quando usado fora do SidebarProvider', () => {
      const onSidebarData = vi.fn()
      render(<TestSidebarHook onSidebarData={onSidebarData} />)

      expect(screen.getByTestId('sidebar-hook-error')).toBeInTheDocument()
      expect(
        screen.getByText('useSidebar must be used within a SidebarProvider.'),
      ).toBeInTheDocument()
    })

    it('deve retornar dados corretos quando usado dentro do SidebarProvider', () => {
      const onSidebarData = vi.fn()

      render(
        <SidebarProvider>
          <TestSidebarHook onSidebarData={onSidebarData} />
        </SidebarProvider>,
      )

      expect(screen.getByTestId('sidebar-hook-success')).toBeInTheDocument()
      expect(onSidebarData).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'expanded',
          open: true,
          setOpen: expect.any(Function),
          setOpenMobile: expect.any(Function),
          toggleSidebar: expect.any(Function),
        }),
      )
    })
  })

  describe('SidebarProvider', () => {
    it('deve renderizar com configurações padrão', () => {
      render(
        <SidebarProvider>
          <div data-testid="sidebar-content">Test content</div>
        </SidebarProvider>,
      )

      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass(
        'group/sidebar-wrapper',
        'flex',
        'h-svh',
        'w-full',
      )
    })

    it('deve aplicar configurações customizadas', () => {
      render(
        <SidebarProvider defaultOpen={false} className="custom-class">
          <div>Content</div>
        </SidebarProvider>,
      )

      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]')
      expect(wrapper).toHaveClass('custom-class')
    })

    it('deve definir variáveis CSS corretas', () => {
      render(
        <SidebarProvider>
          <div>Content</div>
        </SidebarProvider>,
      )

      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]')!
      expect(wrapper.style.getPropertyValue('--sidebar-width')).toBe('16rem')
      expect(wrapper.style.getPropertyValue('--sidebar-width-icon')).toBe(
        '3rem',
      )
    })
  })

  describe('Sidebar', () => {
    it('deve renderizar sidebar desktop', () => {
      render(
        <SidebarProvider>
          <Sidebar data-testid="sidebar">
            <div>Sidebar content</div>
          </Sidebar>
        </SidebarProvider>,
      )

      const sidebar = document.querySelector('[data-slot="sidebar"]')
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveAttribute('data-state', 'expanded')
      expect(sidebar).toHaveAttribute('data-variant', 'sidebar')
      expect(sidebar).toHaveAttribute('data-side', 'left')
    })

    it('deve aplicar configurações personalizadas', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right" variant="floating" collapsible="icon">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>,
      )

      const sidebar = document.querySelector('[data-slot="sidebar"]')
      expect(sidebar).toHaveAttribute('data-side', 'right')
      expect(sidebar).toHaveAttribute('data-variant', 'floating')
    })

    it('deve renderizar sidebar não colapsível', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none" data-testid="non-collapsible">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>,
      )

      const sidebar = screen.getByTestId('non-collapsible')
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveClass(
        'bg-sidebar',
        'text-sidebar-foreground',
        'flex',
        'h-full',
        'flex-col',
      )
    })
  })

  describe('SidebarTrigger', () => {
    it('deve renderizar botão trigger', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger data-testid="sidebar-trigger" />
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('sidebar-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-sidebar', 'trigger')
      expect(trigger).toHaveAttribute('data-slot', 'sidebar-trigger')
      expect(screen.getByText('Toggle Sidebar')).toBeInTheDocument()
    })

    it('deve alternar sidebar quando clicado', async () => {
      const user = userEvent.setup()
      const onSidebarData = vi.fn()

      render(
        <SidebarProvider>
          <SidebarTrigger data-testid="sidebar-trigger" />
          <TestSidebarHook onSidebarData={onSidebarData} />
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('sidebar-trigger')
      await user.click(trigger)

      expect(onSidebarData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: 'collapsed',
          open: false,
        }),
      )
    })

    it('deve chamar onClick personalizado quando fornecido', async () => {
      const user = userEvent.setup()
      const customClick = vi.fn()

      render(
        <SidebarProvider>
          <SidebarTrigger onClick={customClick} data-testid="custom-trigger" />
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('custom-trigger')
      await user.click(trigger)

      expect(customClick).toHaveBeenCalled()
    })
  })

  describe('SidebarInset', () => {
    it('deve renderizar como main element', () => {
      render(<SidebarInset data-testid="sidebar-inset">Content</SidebarInset>)

      const inset = screen.getByTestId('sidebar-inset')
      expect(inset.tagName).toBe('MAIN')
      expect(inset).toHaveAttribute('data-slot', 'sidebar-inset')
      expect(inset).toHaveClass(
        'bg-background',
        'relative',
        'flex',
        'w-full',
        'flex-1',
        'flex-col',
      )
    })

    it('deve aplicar className personalizada', () => {
      render(
        <SidebarInset className="custom-inset" data-testid="custom-inset">
          Content
        </SidebarInset>,
      )

      const inset = screen.getByTestId('custom-inset')
      expect(inset).toHaveClass('custom-inset')
    })
  })

  describe('Componentes de Conteúdo', () => {
    it('deve renderizar SidebarHeader', () => {
      render(<SidebarHeader data-testid="sidebar-header">Header</SidebarHeader>)

      const header = screen.getByTestId('sidebar-header')
      expect(header).toHaveAttribute('data-slot', 'sidebar-header')
      expect(header).toHaveAttribute('data-sidebar', 'header')
      expect(header).toHaveClass('flex', 'flex-col', 'gap-2', 'p-2')
    })

    it('deve renderizar SidebarContent', () => {
      render(
        <SidebarContent data-testid="sidebar-content">Content</SidebarContent>,
      )

      const content = screen.getByTestId('sidebar-content')
      expect(content).toHaveAttribute('data-slot', 'sidebar-content')
      expect(content).toHaveAttribute('data-sidebar', 'content')
      expect(content).toHaveClass(
        'flex',
        'min-h-0',
        'flex-1',
        'flex-col',
        'gap-2',
        'overflow-auto',
      )
    })

    it('deve renderizar SidebarFooter', () => {
      render(<SidebarFooter data-testid="sidebar-footer">Footer</SidebarFooter>)

      const footer = screen.getByTestId('sidebar-footer')
      expect(footer).toHaveAttribute('data-slot', 'sidebar-footer')
      expect(footer).toHaveAttribute('data-sidebar', 'footer')
      expect(footer).toHaveClass('flex', 'flex-col', 'gap-2', 'p-2')
    })
  })

  describe('Componentes de Menu', () => {
    it('deve renderizar estrutura de menu completa', () => {
      render(
        <SidebarProvider>
          <SidebarGroup data-testid="sidebar-group">
            <SidebarGroupLabel data-testid="group-label">
              Menu Label
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu data-testid="sidebar-menu">
                <SidebarMenuItem data-testid="menu-item">
                  <SidebarMenuButton data-testid="menu-button">
                    Menu Item
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarProvider>,
      )

      expect(screen.getByTestId('sidebar-group')).toHaveAttribute(
        'data-slot',
        'sidebar-group',
      )
      expect(screen.getByTestId('group-label')).toHaveAttribute(
        'data-slot',
        'sidebar-group-label',
      )
      expect(screen.getByTestId('sidebar-menu')).toHaveAttribute(
        'data-slot',
        'sidebar-menu',
      )
      expect(screen.getByTestId('menu-item')).toHaveAttribute(
        'data-slot',
        'sidebar-menu-item',
      )
      expect(screen.getByTestId('menu-button')).toHaveAttribute(
        'data-slot',
        'sidebar-menu-button',
      )
    })

    it('deve aplicar variantes do menu button', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton
            variant="outline"
            size="lg"
            isActive
            data-testid="menu-button"
          >
            Button
          </SidebarMenuButton>
        </SidebarProvider>,
      )

      const button = screen.getByTestId('menu-button')
      expect(button).toHaveAttribute('data-size', 'lg')
      expect(button).toHaveAttribute('data-active', 'true')
    })

    it('deve renderizar tooltip quando fornecido', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <SidebarMenuButton
            tooltip="Menu tooltip"
            data-testid="menu-with-tooltip"
          >
            Button
          </SidebarMenuButton>
        </SidebarProvider>,
      )

      expect(screen.getByTestId('menu-with-tooltip')).toBeInTheDocument()
    })
  })

  describe('Estados e Comportamento', () => {
    it('deve manter estado controlado quando props são fornecidas', () => {
      const onOpenChange = vi.fn()
      const { rerender } = render(
        <SidebarProvider open onOpenChange={onOpenChange}>
          <SidebarTrigger data-testid="controlled-trigger" />
        </SidebarProvider>,
      )

      fireEvent.click(screen.getByTestId('controlled-trigger'))
      expect(onOpenChange).toHaveBeenCalledWith(false)

      rerender(
        <SidebarProvider open={false} onOpenChange={onOpenChange}>
          <SidebarTrigger data-testid="controlled-trigger" />
        </SidebarProvider>,
      )

      fireEvent.click(screen.getByTestId('controlled-trigger'))
      expect(onOpenChange).toHaveBeenLastCalledWith(true)
    })

    it('deve definir cookies quando estado muda', () => {
      // Mock document.cookie
      let cookieValue = ''
      Object.defineProperty(document, 'cookie', {
        get: () => cookieValue,
        set: (value) => {
          cookieValue = value
        },
      })

      render(
        <SidebarProvider>
          <SidebarTrigger data-testid="cookie-trigger" />
        </SidebarProvider>,
      )

      fireEvent.click(screen.getByTestId('cookie-trigger'))
      expect(cookieValue).toContain('sidebar_state=false')
    })
  })
})
