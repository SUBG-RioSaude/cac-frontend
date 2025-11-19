import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../accordion'

describe('Accordion UI component', () => {
  const renderAccordion = () =>
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger>Primeiro item</AccordionTrigger>
          <AccordionContent className="custom-content">
            Conteúdo inicial
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Segundo item</AccordionTrigger>
          <AccordionContent>Outro conteúdo</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

  it('deve renderizar estrutura básica com slots', () => {
    renderAccordion()

    expect(screen.getAllByRole('button').length).toBe(2)
    expect(
      document.querySelector('[data-slot="accordion"]'),
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="accordion-item"]'),
    ).toHaveClass('custom-item')
  })

  it('deve alternar conteúdo ao clicar no trigger', async () => {
    const user = userEvent.setup()
    renderAccordion()

    const trigger = screen.getByRole('button', { name: 'Segundo item' })
    await user.click(trigger)

    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(screen.getByText('Outro conteúdo')).toBeVisible()
  })

  it('deve aplicar classes customizadas ao conteúdo', () => {
    renderAccordion()
    const innerContent = screen.getByText('Conteúdo inicial')
    expect(innerContent).toHaveClass('custom-content')
    expect(innerContent).toHaveClass('pb-4')
  })
})

