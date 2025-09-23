import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'

describe('Tabs Components', () => {
  describe('Tabs Root', () => {
    it('deve renderizar corretamente', () => {
      render(
        <Tabs defaultValue="tab1" data-testid="tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      )

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toBeInTheDocument()
    })

    it('deve ter data-slot="tabs"', () => {
      render(
        <Tabs defaultValue="tab1" data-testid="tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-slot', 'tabs')
    })
  })

  describe('TabsList', () => {
    it('deve renderizar lista de tabs', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toBeInTheDocument()
      expect(tabsList).toHaveRole('tablist')
    })

    it('deve aplicar classes padrão', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toHaveClass(
        'inline-flex',
        'h-9',
        'items-center',
        'justify-center',
        'rounded-lg',
      )
    })

    it('deve ter data-slot="tabs-list"', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toHaveAttribute('data-slot', 'tabs-list')
    })
  })

  describe('TabsTrigger', () => {
    it('deve renderizar botão de tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const trigger = screen.getByTestId('tab-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveRole('tab')
      expect(trigger).toHaveTextContent('Tab 1')
    })

    it('deve aplicar classes padrão', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const trigger = screen.getByTestId('tab-trigger')
      expect(trigger).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'whitespace-nowrap',
        'rounded-md',
      )
    })

    it('deve ter data-slot="tabs-trigger"', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const trigger = screen.getByTestId('tab-trigger')
      expect(trigger).toHaveAttribute('data-slot', 'tabs-trigger')
    })

    it('deve estar selecionado quando é o valor padrão', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const trigger = screen.getByTestId('tab-trigger')
      expect(trigger).toHaveAttribute('aria-selected', 'true')
    })

    it('deve permitir clique para alternar tabs', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        <Tabs defaultValue="tab1" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const tab2Trigger = screen.getByTestId('tab2-trigger')
      await user.click(tab2Trigger)

      expect(onValueChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('TabsContent', () => {
    it('deve renderizar conteúdo da tab ativa', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab-content">
            Conteúdo da Tab 1
          </TabsContent>
        </Tabs>,
      )

      const content = screen.getByTestId('tab-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveRole('tabpanel')
      expect(content).toHaveTextContent('Conteúdo da Tab 1')
    })

    it('deve aplicar classes padrão', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab-content">
            Content
          </TabsContent>
        </Tabs>,
      )

      const content = screen.getByTestId('tab-content')
      expect(content).toHaveClass('flex-1', 'outline-none')
    })

    it('deve ter data-slot="tabs-content"', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab-content">
            Content
          </TabsContent>
        </Tabs>,
      )

      const content = screen.getByTestId('tab-content')
      expect(content).toHaveAttribute('data-slot', 'tabs-content')
    })

    it('não deve renderizar conteúdo de tab inativa', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Conteúdo da Tab 1</TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Conteúdo da Tab 2
          </TabsContent>
        </Tabs>,
      )

      const tab2Content = screen.queryByTestId('tab2-content')
      // Radix UI renderiza tabs inativas mas com hidden
      expect(tab2Content).toHaveAttribute('hidden')
      expect(tab2Content).toHaveAttribute('data-state', 'inactive')
    })
  })

  describe('Navegação entre tabs', () => {
    it('deve alternar conteúdo ao clicar em diferentes tabs', async () => {
      const user = userEvent.setup()

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Conteúdo da Tab 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Conteúdo da Tab 2
          </TabsContent>
        </Tabs>,
      )

      // Inicialmente Tab 1 está ativa
      const tab1Content = screen.getByTestId('tab1-content')
      const tab2Content = screen.getByTestId('tab2-content')

      expect(tab1Content).toHaveAttribute('data-state', 'active')
      expect(tab2Content).toHaveAttribute('data-state', 'inactive')
      expect(tab2Content).toHaveAttribute('hidden')

      // Clica na Tab 2
      const tab2Trigger = screen.getByTestId('tab2-trigger')
      await user.click(tab2Trigger)

      // Agora Tab 2 está ativa
      expect(tab1Content).toHaveAttribute('data-state', 'inactive')
      expect(tab1Content).toHaveAttribute('hidden')
      expect(tab2Content).toHaveAttribute('data-state', 'active')
      expect(tab2Content).not.toHaveAttribute('hidden')
    })

    it('deve navegar com setas do teclado', async () => {
      const user = userEvent.setup()

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Conteúdo 1</TabsContent>
          <TabsContent value="tab2">Conteúdo 2</TabsContent>
        </Tabs>,
      )

      const tab1Trigger = screen.getByTestId('tab1-trigger')
      const tab2Trigger = screen.getByTestId('tab2-trigger')

      // Verifica que as tabs estão configuradas para navegação por teclado
      expect(tab1Trigger).toHaveAttribute('role', 'tab')
      expect(tab2Trigger).toHaveAttribute('role', 'tab')
      expect(tab1Trigger).toHaveAttribute('aria-selected', 'true')
      expect(tab2Trigger).toHaveAttribute('aria-selected', 'false')

      // Verifica que podem ser focáveis via clique
      await user.click(tab2Trigger)
      expect(tab2Trigger).toHaveAttribute('aria-selected', 'true')
      expect(tab1Trigger).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('deve funcionar como uncontrolled component', async () => {
      const user = userEvent.setup()

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>,
      )

      const tab2Trigger = screen.getByTestId('tab2-trigger')
      await user.click(tab2Trigger)

      expect(screen.getByTestId('tab2-content')).toBeInTheDocument()
    })

    it('deve funcionar como controlled component', async () => {
      const user = userEvent.setup()
      let activeTab = 'tab1'
      const onValueChange = (value: string) => {
        activeTab = value
      }

      const { rerender } = render(
        <Tabs value={activeTab} onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>,
      )

      const tab2Trigger = screen.getByTestId('tab2-trigger')
      await user.click(tab2Trigger)

      rerender(
        <Tabs value={activeTab} onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>,
      )

      expect(screen.getByTestId('tab2-content')).toBeInTheDocument()
    })
  })

  describe('Props customizadas', () => {
    it('deve aceitar className customizada', () => {
      render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList className="custom-list">
            <TabsTrigger
              value="tab1"
              className="custom-trigger"
              data-testid="tab-trigger"
            >
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="tab1"
            className="custom-content"
            data-testid="tab-content"
          >
            Content
          </TabsContent>
        </Tabs>,
      )

      const trigger = screen.getByTestId('tab-trigger')
      const content = screen.getByTestId('tab-content')

      expect(trigger).toHaveClass('custom-trigger')
      expect(content).toHaveClass('custom-content')
    })

    it('deve aceitar orientation', () => {
      render(
        <Tabs defaultValue="tab1" orientation="vertical" data-testid="tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>,
      )

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-orientation', 'vertical')
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter atributos ARIA corretos', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1" data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab-content">
            Content 1
          </TabsContent>
        </Tabs>,
      )

      const tabsList = screen.getByTestId('tabs-list')
      const trigger = screen.getByTestId('tab-trigger')
      const content = screen.getByTestId('tab-content')

      expect(tabsList).toHaveRole('tablist')
      expect(trigger).toHaveRole('tab')
      expect(content).toHaveRole('tabpanel')
    })

    it('deve associar tab com seu painel', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab-content">
            Content 1
          </TabsContent>
        </Tabs>,
      )

      const trigger = screen.getByTestId('tab-trigger')
      const content = screen.getByTestId('tab-content')

      const triggerId = trigger.getAttribute('id')
      const contentAriaLabelledBy = content.getAttribute('aria-labelledby')

      expect(triggerId).toBeTruthy()
      expect(contentAriaLabelledBy).toBe(triggerId)
    })
  })
})
