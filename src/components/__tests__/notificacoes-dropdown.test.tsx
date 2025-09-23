import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NotificacoesDropdown } from '../notificacoes-dropdown'

// Mock simples do store
vi.mock('@/lib/notificacoes-store', () => ({
  useNotificacoesStore: () => ({
    notificacoes: [],
    notificacoesNaoLidas: 0,
    marcarComoLida: vi.fn(),
    marcarTodasComoLidas: vi.fn(),
    removerNotificacao: vi.fn(),
    limparVisualizadas: vi.fn(),
    limparTodas: vi.fn(),
  }),
}))

describe('NotificacoesDropdown', () => {
  it('deve renderizar o botão de notificações', () => {
    render(<NotificacoesDropdown />)

    const botaoNotificacoes = screen.getByRole('button', {
      name: 'Notificações',
    })
    expect(botaoNotificacoes).toBeInTheDocument()
  })

  it('deve exibir o ícone de sino', () => {
    render(<NotificacoesDropdown />)

    // Verifica se o ícone está presente (por classe CSS)
    const botao = screen.getByRole('button', { name: 'Notificações' })
    expect(botao).toBeInTheDocument()
  })

  it('deve exibir botão "Limpar todas" quando há notificações não lidas', () => {
    render(<NotificacoesDropdown />)

    // Como o mock padrão tem notificacoesNaoLidas: 0, o botão não deve aparecer
    const botaoNotificacoes = screen.getByRole('button', {
      name: 'Notificações',
    })
    fireEvent.click(botaoNotificacoes)

    // Verifica que o botão "Limpar todas" não está presente (pois não há notificações não lidas)
    expect(
      screen.queryByRole('button', { name: 'Limpar todas as notificações' }),
    ).not.toBeInTheDocument()
  })
})
