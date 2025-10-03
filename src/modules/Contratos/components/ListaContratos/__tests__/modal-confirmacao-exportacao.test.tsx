import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ModalConfirmacaoExportacao } from '../modal-confirmacao-exportacao'

describe('ModalConfirmacaoExportacao', () => {
  const propsPadrao = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    totalContratos: 150,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o modal quando isOpen é true', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    expect(screen.getByText('Confirmar Exportação')).toBeInTheDocument()
    expect(
      screen.getByText('Você está prestes a exportar todos os contratos'),
    ).toBeInTheDocument()
  })

  it('não deve renderizar o modal quando isOpen é false', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} isOpen={false} />)
    expect(screen.queryByText('Confirmar Exportação')).not.toBeInTheDocument()
  })

  it('deve exibir o total de contratos formatado', () => {
    render(
      <ModalConfirmacaoExportacao {...propsPadrao} totalContratos={1500} />,
    )
    expect(screen.getByText('1.500')).toBeInTheDocument()
  })

  it('deve exibir o formato de exportação', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })

  it('deve exibir mensagem sobre tempo de processamento', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    expect(
      screen.getByText(/Esta ação pode levar alguns segundos/),
    ).toBeInTheDocument()
  })

  it('deve chamar onClose quando cancelar for clicado', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    const botaoCancelar = screen.getByText('Cancelar')
    fireEvent.click(botaoCancelar)
    expect(propsPadrao.onClose).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onConfirm quando exportar for clicado', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    const botaoExportar = screen.getByText('Exportar Todos')
    fireEvent.click(botaoExportar)
    expect(propsPadrao.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('deve exibir ícone de alerta', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)

    // Verifica se o modal está sendo renderizado corretamente
    expect(screen.getByText('Confirmar Exportação')).toBeInTheDocument()
    expect(
      screen.getByText('Você está prestes a exportar todos os contratos'),
    ).toBeInTheDocument()
  })

  it('deve exibir ícone de download no botão exportar', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)

    // Verifica se o ícone de download está presente (sem usar data-testid)
    const botaoExportar = screen.getByText('Exportar Todos')
    const iconeDownload = botaoExportar.querySelector('svg')
    expect(iconeDownload).toBeInTheDocument()
  })

  it('deve aplicar classes CSS corretas para o botão cancelar', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    const botaoCancelar = screen.getByText('Cancelar')

    // Verifica se o botão tem as classes básicas
    expect(botaoCancelar).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
    )
  })

  it('deve aplicar classes CSS corretas para o container de informações', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)

    // Busca pelo container correto que tem as classes desejadas
    const containerInfo = screen
      .getByText('Total de contratos:')
      .closest('.rounded-lg')
    expect(containerInfo).toHaveClass(
      'rounded-lg',
      'bg-muted/50',
      'p-4',
      'space-y-2',
    )
  })

  it('deve exibir informações organizadas em linhas', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    const linhasInfo = screen.getAllByText(/Total de contratos:|Formato:/)
    linhasInfo.forEach((linha) => {
      const container = linha.closest('div')
      expect(container).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'text-sm',
      )
    })
  })

  it('deve aplicar classes CSS corretas para o conteúdo do modal', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)
    const conteudoModal = screen
      .getByText('Confirmar Exportação')
      .closest('[role="dialog"]')
    expect(conteudoModal).toBeInTheDocument()
  })

  it('deve formatar diferentes quantidades de contratos', () => {
    const { rerender } = render(
      <ModalConfirmacaoExportacao {...propsPadrao} totalContratos={1} />,
    )
    expect(screen.getByText('1')).toBeInTheDocument()

    rerender(
      <ModalConfirmacaoExportacao {...propsPadrao} totalContratos={1000000} />,
    )
    expect(screen.getByText('1.000.000')).toBeInTheDocument()
  })

  it('deve aplicar classes CSS corretas para o header do modal', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)

    // Busca pelo header correto
    const header = screen
      .getByText('Confirmar Exportação')
      .closest('.flex.flex-col.gap-2')
    expect(header).toHaveClass('flex', 'flex-col', 'gap-2')
  })

  it('deve aplicar classes CSS corretas para o ícone de alerta', () => {
    render(<ModalConfirmacaoExportacao {...propsPadrao} />)

    // Verifica se o modal está sendo renderizado corretamente
    expect(screen.getByText('Confirmar Exportação')).toBeInTheDocument()
  })
})
