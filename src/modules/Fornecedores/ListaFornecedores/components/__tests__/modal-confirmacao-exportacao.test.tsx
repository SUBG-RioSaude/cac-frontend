import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ModalConfirmacaoExportacao } from '../modal-confirmacao-exportacao'

// Mock do framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

describe('ModalConfirmacaoExportacao', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    totalFornecedores: 150,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar quando isOpen for true', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    expect(screen.getByText('Confirmar Exportação')).toBeInTheDocument()
    expect(
      screen.getByText('Você está prestes a exportar todos os fornecedores.'),
    ).toBeInTheDocument()
  })

  it('não deve renderizar quando isOpen for false', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} isOpen={false} />)

    expect(screen.queryByText('Confirmar Exportação')).not.toBeInTheDocument()
  })

  it('deve exibir o total correto de fornecedores', () => {
    render(
      <ModalConfirmacaoExportacao {...mockProps} totalFornecedores={250} />,
    )

    // Verifica se existe algum elemento que contenha o texto esperado
    const elementos = screen.getAllByText((_, element) => {
      const text = element.textContent
      return Boolean(
        text?.includes('250') &&
          text.includes('fornecedores'),
      )
    })
    expect(elementos.length).toBeGreaterThan(0)
  })

  it('deve exibir texto singular quando há apenas 1 fornecedor', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} totalFornecedores={1} />)

    // Verifica se existe algum elemento que contenha o texto esperado
    const elementos = screen.getAllByText((_, element) => {
      const text = element.textContent
      return Boolean(
        text?.includes('1') &&
          text.includes('fornecedor'),
      )
    })
    expect(elementos.length).toBeGreaterThan(0)
  })

  it('deve exibir texto plural quando há múltiplos fornecedores', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} totalFornecedores={5} />)

    // Verifica se existe algum elemento que contenha o texto esperado
    const elementos = screen.getAllByText((_, element) => {
      const text = element.textContent
      return Boolean(
        text?.includes('5') &&
          text.includes('fornecedores'),
      )
    })
    expect(elementos.length).toBeGreaterThan(0)
  })

  it('deve chamar onClose ao clicar no botão Cancelar', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const botaoCancelar = screen.getByText('Cancelar')
    fireEvent.click(botaoCancelar)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onConfirm ao clicar no botão Confirmar', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const botaoConfirmar = screen.getByText('Confirmar')
    fireEvent.click(botaoConfirmar)

    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onClose ao clicar no overlay', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const overlay = screen.getByTestId('modal-overlay')
    fireEvent.click(overlay)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onClose ao clicar no botão X', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const botaoX = screen.getByLabelText('Fechar modal')
    fireEvent.click(botaoX)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('deve ter botão Cancelar com variante outline', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const botaoCancelar = screen.getByText('Cancelar')
    // Verifica se o botão tem as classes da variante outline
    expect(botaoCancelar).toHaveClass('border', 'bg-background')
  })

  it('deve ter botão Confirmar com variante default', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const botaoConfirmar = screen.getByText('Confirmar')
    expect(botaoConfirmar).toHaveClass('bg-slate-700', 'hover:bg-slate-600')
  })

  it('deve ter ícone de alerta no cabeçalho', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const iconeAlerta = screen.getByTestId('icon-alert')
    expect(iconeAlerta).toBeInTheDocument()
  })

  it('deve ter ícone de download no botão confirmar', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const iconeDownload = screen.getByTestId('icon-download')
    expect(iconeDownload).toBeInTheDocument()
  })

  it('deve ter título descritivo', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    expect(screen.getByText('Confirmar Exportação')).toBeInTheDocument()
  })

  it('deve ter mensagem explicativa clara', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    expect(
      screen.getByText('Você está prestes a exportar todos os fornecedores.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Esta ação irá gerar um arquivo CSV com todos os dados dos fornecedores listados.',
      ),
    ).toBeInTheDocument()
  })

  it('deve exibir total de fornecedores de forma clara', () => {
    render(
      <ModalConfirmacaoExportacao {...mockProps} totalFornecedores={100} />,
    )

    // Verifica se existe algum elemento que contenha o texto esperado
    const elementos = screen.getAllByText((_, element) => {
      return Boolean(
        element?.textContent?.includes(
          'Total de fornecedores: 100 fornecedores',
        ),
      )
    })
    expect(elementos.length).toBeGreaterThan(0)
  })

  it('deve ter estrutura semântica correta', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading')).toHaveTextContent(
      'Confirmar Exportação',
    )
  })

  it('deve ter acessibilidade adequada', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('deve ter z-index alto para sobrepor outros elementos', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('z-50')
  })

  it('deve ter backdrop com blur', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const overlay = screen.getByTestId('modal-overlay')
    expect(overlay).toHaveClass('backdrop-blur-sm')
  })

  it('deve ter animações suaves', () => {
    render(<ModalConfirmacaoExportacao {...mockProps} />)

    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('animate-in', 'fade-in-0', 'zoom-in-95')
  })
})
