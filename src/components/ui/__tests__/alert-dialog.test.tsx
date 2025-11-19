import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog'

const renderDialogAberto = (extraClass = '') =>
  render(
    <AlertDialog open onOpenChange={() => undefined}>
      <AlertDialogTrigger>Excluir registro</AlertDialogTrigger>
      <AlertDialogContent className={extraClass}>
        <AlertDialogHeader className="cabecalho-personalizado">
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  )

describe('AlertDialog UI', () => {
  it('deve renderizar overlay, conteúdo e trigger com data-slots corretos', () => {
    renderDialogAberto()

    expect(
      document.querySelector('[data-slot="alert-dialog-overlay"]'),
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="alert-dialog-content"]'),
    ).toBeInTheDocument()
    expect(screen.getByText('Excluir registro')).toHaveAttribute(
      'data-slot',
      'alert-dialog-trigger',
    )
  })

  it('deve aplicar classes utilitárias padrão nos botões de ação', () => {
    renderDialogAberto()

    const botaoConfirmar = screen.getByRole('button', { name: 'Confirmar' })
    const botaoCancelar = screen.getByRole('button', { name: 'Cancelar' })

    expect(botaoConfirmar).toHaveClass('inline-flex', 'items-center', 'text-sm')
    expect(botaoCancelar).toHaveClass('border')
  })

  it('deve aceitar classes personalizadas nas seções estruturais', () => {
    renderDialogAberto('conteudo-extra')

    expect(
      document.querySelector('[data-slot="alert-dialog-content"]'),
    ).toHaveClass('conteudo-extra')
    expect(
      document.querySelector('[data-slot="alert-dialog-header"]'),
    ).toHaveClass('cabecalho-personalizado')
  })
})

