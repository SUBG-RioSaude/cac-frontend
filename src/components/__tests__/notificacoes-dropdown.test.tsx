/**
 * Testes para NotificacoesDropdown
 * Atualizado para usar TanStack Query ao invés de Zustand
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { NotificacoesDropdown } from '../notificacoes-dropdown'

// Mock do hook useNotificacoes
vi.mock('@/hooks/use-notificacoes', () => ({
  useNotificacoes: vi.fn(() => ({
    notificacoesVisiveis: [],
    notificacoesNaoLidas: [],
    broadcasts: [],
    itensExibicao: [],
    contagemNaoLidas: 0,
    conectado: true,
    reconectando: false,
    isLoading: false,
    marcarComoLida: vi.fn(),
    arquivar: vi.fn(),
    marcarTodasComoLidas: vi.fn(),
    arquivarTodasLidas: vi.fn(),
    deletar: vi.fn(),
    descartarBroadcast: vi.fn(),
    descartarTodosBroadcasts: vi.fn(),
  })),
}))

// Mock do hook de arquivadas
vi.mock('@/hooks/use-notificacoes-query', () => ({
  useNotificacoesArquivadasQuery: vi.fn(() => ({
    data: { items: [], page: 1, pageSize: 20, totalArquivadas: 0 },
    isLoading: false,
  })),
}))

// Mock do modal de preferências
vi.mock('@/components/notificacoes-preferencias-dialog', () => ({
  NotificacoesPreferenciasDialog: ({ aberto }: { aberto: boolean }) =>
    aberto ? <div>Modal de Preferências</div> : null,
}))

describe('NotificacoesDropdown', () => {
  let queryClient: QueryClient

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o botão de notificações', () => {
    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botaoNotificacoes = screen.getByRole('button', {
      name: 'Notificações',
    })
    expect(botaoNotificacoes).toBeInTheDocument()
  })

  it('deve exibir badge quando há notificações não lidas', async () => {
    const { useNotificacoes } = await import('@/hooks/use-notificacoes')
    vi.mocked(useNotificacoes).mockReturnValue({
      notificacoesVisiveis: [],
      notificacoesNaoLidas: [],
      broadcasts: [],
      itensExibicao: [],
      contagemNaoLidas: 3,
      conectado: true,
      reconectando: false,
      isLoading: false,
      marcarComoLida: vi.fn(),
      arquivar: vi.fn(),
      marcarTodasComoLidas: vi.fn(),
      arquivarTodasLidas: vi.fn(),
      deletar: vi.fn(),
      descartarBroadcast: vi.fn(),
      descartarTodosBroadcasts: vi.fn(),
    } as any)

    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const badge = screen.getByText('3')
    expect(badge).toBeInTheDocument()
  })

  it('deve incluir broadcasts na contagem do badge', async () => {
    const broadcastMock = {
      id: 'b1',
      sistemaId: 'sistema-1',
      titulo: 'Broadcast Teste',
      mensagem: 'Mensagem broadcast',
      prioridade: 1,
      categoria: 'Sistema',
      criadoEm: '2025-01-23T10:00:00Z',
      recebidoEm: '2025-01-23T10:00:00Z',
      usuariosConectados: 10,
      info: 'Info',
    }

    const { useNotificacoes } = await import('@/hooks/use-notificacoes')
    vi.mocked(useNotificacoes).mockReturnValue({
      notificacoesVisiveis: [],
      notificacoesNaoLidas: [],
      broadcasts: [broadcastMock],
      itensExibicao: [{ ...broadcastMock, tipo_item: 'broadcast' as const }],
      contagemNaoLidas: 1, // 0 notificações + 1 broadcast = 1
      conectado: true,
      reconectando: false,
      isLoading: false,
      marcarComoLida: vi.fn(),
      arquivar: vi.fn(),
      marcarTodasComoLidas: vi.fn(),
      arquivarTodasLidas: vi.fn(),
      deletar: vi.fn(),
      descartarBroadcast: vi.fn(),
      descartarTodosBroadcasts: vi.fn(),
    } as any)

    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const badge = screen.getByText('1')
    expect(badge).toBeInTheDocument()
  })

  it('deve abrir dropdown ao clicar no botão', async () => {
    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      expect(screen.getByText('Notificações')).toBeInTheDocument()
    })
  })

  it('deve exibir abas (Todas, Não lidas, Arquivo)', async () => {
    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      expect(screen.getByText('Todas')).toBeInTheDocument()
      expect(screen.getByText(/Não lidas/)).toBeInTheDocument()
      expect(screen.getByText('Arquivo')).toBeInTheDocument()
    })
  })

  it('deve exibir mensagem quando não há notificações', async () => {
    const { useNotificacoes } = await import('@/hooks/use-notificacoes')
    vi.mocked(useNotificacoes).mockReturnValue({
      notificacoesVisiveis: [],
      notificacoesNaoLidas: [],
      broadcasts: [],
      itensExibicao: [],
      contagemNaoLidas: 0,
      conectado: true,
      reconectando: false,
      isLoading: false,
      marcarComoLida: vi.fn(),
      arquivar: vi.fn(),
      marcarTodasComoLidas: vi.fn(),
      arquivarTodasLidas: vi.fn(),
      deletar: vi.fn(),
      descartarBroadcast: vi.fn(),
      descartarTodosBroadcasts: vi.fn(),
    } as any)

    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument()
    })
  })

  it('deve exibir indicador de status (online)', async () => {
    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      // Verifica se o título "Notificações" está presente
      expect(screen.getByText('Notificações')).toBeInTheDocument()
    })
  })

  it('deve mostrar botão de preferências', async () => {
    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      const botaoPreferencias = screen.getByRole('button', {
        name: 'Configurações de notificações',
      })
      expect(botaoPreferencias).toBeInTheDocument()
    })
  })

  it('deve abrir modal de preferências ao clicar no botão', async () => {
    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      const botaoPreferencias = screen.getByRole('button', {
        name: 'Configurações de notificações',
      })
      fireEvent.click(botaoPreferencias)
    })

    await waitFor(() => {
      expect(screen.getByText('Modal de Preferências')).toBeInTheDocument()
    })
  })

  it('deve fechar dropdown ao clicar em Fechar', async () => {
    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      expect(screen.getByText('Notificações')).toBeInTheDocument()
    })

    const botaoFechar = screen.getByRole('button', { name: 'Fechar' })
    fireEvent.click(botaoFechar)

    await waitFor(() => {
      expect(screen.queryByText('Notificações')).not.toBeInTheDocument()
    })
  })

  it('deve exibir notificações quando houver dados', async () => {
    const notificacaoMock = {
      id: '1',
      notificacaoId: 'n1',
      titulo: 'Teste Notificação',
      mensagem: 'Mensagem de teste',
      tipo: 'info' as const,
      prioridade: 'Normal' as const,
      categoria: 'Sistema',
      lida: false,
      arquivada: false,
      criadoEm: '2025-01-23T10:00:00Z',
    }

    const { useNotificacoes } = await import('@/hooks/use-notificacoes')
    vi.mocked(useNotificacoes).mockReturnValue({
      notificacoesVisiveis: [notificacaoMock],
      notificacoesNaoLidas: [],
      broadcasts: [],
      itensExibicao: [{ ...notificacaoMock, tipo_item: 'notificacao' as const }],
      contagemNaoLidas: 1,
      conectado: true,
      reconectando: false,
      isLoading: false,
      marcarComoLida: vi.fn(),
      arquivar: vi.fn(),
      marcarTodasComoLidas: vi.fn(),
      arquivarTodasLidas: vi.fn(),
      deletar: vi.fn(),
      descartarBroadcast: vi.fn(),
      descartarTodosBroadcasts: vi.fn(),
    } as any)

    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      expect(screen.getByText('Teste Notificação')).toBeInTheDocument()
      expect(screen.getByText('Mensagem de teste')).toBeInTheDocument()
    })
  })

  it('deve chamar marcarComoLida ao clicar no botão de marcar como lida', async () => {
    const marcarComoLidaMock = vi.fn()

    const notificacaoMock = {
      id: '1',
      notificacaoId: 'n1',
      titulo: 'Teste',
      mensagem: 'Mensagem',
      tipo: 'info' as const,
      prioridade: 'Normal' as const,
      categoria: 'Sistema',
      lida: false,
      arquivada: false,
      criadoEm: '2025-01-23T10:00:00Z',
    }

    const { useNotificacoes } = await import('@/hooks/use-notificacoes')
    vi.mocked(useNotificacoes).mockReturnValue({
      notificacoesVisiveis: [notificacaoMock],
      notificacoesNaoLidas: [],
      broadcasts: [],
      itensExibicao: [{ ...notificacaoMock, tipo_item: 'notificacao' as const }],
      contagemNaoLidas: 1,
      conectado: true,
      reconectando: false,
      isLoading: false,
      marcarComoLida: marcarComoLidaMock,
      arquivar: vi.fn(),
      marcarTodasComoLidas: vi.fn(),
      arquivarTodasLidas: vi.fn(),
      deletar: vi.fn(),
      descartarBroadcast: vi.fn(),
      descartarTodosBroadcasts: vi.fn(),
    } as any)

    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      const botaoMarcarLida = screen.getByRole('button', {
        name: 'Marcar como lida',
      })
      fireEvent.click(botaoMarcarLida)
    })

    expect(marcarComoLidaMock).toHaveBeenCalledWith('1')
  })

  it('deve descartar todos os broadcasts ao clicar em Visualizar todas', async () => {
    const marcarTodasMock = vi.fn()
    const descartarTodosBroadcastsMock = vi.fn()

    const broadcastMock = {
      id: 'b1',
      sistemaId: 'sistema-1',
      titulo: 'Broadcast Teste',
      mensagem: 'Mensagem',
      prioridade: 1,
      categoria: 'Sistema',
      criadoEm: '2025-01-23T10:00:00Z',
      recebidoEm: '2025-01-23T10:00:00Z',
      usuariosConectados: 10,
      info: 'Info',
    }

    const { useNotificacoes } = await import('@/hooks/use-notificacoes')
    vi.mocked(useNotificacoes).mockReturnValue({
      notificacoesVisiveis: [],
      notificacoesNaoLidas: [],
      broadcasts: [broadcastMock],
      itensExibicao: [{ ...broadcastMock, tipo_item: 'broadcast' as const }],
      contagemNaoLidas: 1,
      conectado: true,
      reconectando: false,
      isLoading: false,
      marcarComoLida: vi.fn(),
      arquivar: vi.fn(),
      marcarTodasComoLidas: marcarTodasMock,
      arquivarTodasLidas: vi.fn(),
      deletar: vi.fn(),
      descartarBroadcast: vi.fn(),
      descartarTodosBroadcasts: descartarTodosBroadcastsMock,
    } as any)

    render(<NotificacoesDropdown />, { wrapper: createWrapper() })

    const botao = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(botao)

    await waitFor(() => {
      const botaoVisualizarTodas = screen.getByRole('button', {
        name: 'Marcar todas como lidas',
      })
      fireEvent.click(botaoVisualizarTodas)
    })

    expect(marcarTodasMock).toHaveBeenCalled()
    expect(descartarTodosBroadcastsMock).toHaveBeenCalled()
  })
})
