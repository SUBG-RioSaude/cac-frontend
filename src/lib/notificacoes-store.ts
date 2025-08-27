import { create } from 'zustand'

export interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro'
  data: Date
  lida: boolean
}

interface NotificacoesState {
  notificacoes: Notificacao[]
  notificacoesNaoLidas: number
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'data' | 'lida'>) => void
  marcarComoLida: (id: string) => void
  marcarTodasComoLidas: () => void
  removerNotificacao: (id: string) => void
  limparVisualizadas: () => void
  limparTodas: () => void
}

export const useNotificacoesStore = create<NotificacoesState>((set) => ({
  notificacoes: [
    // Notificações placeholder para demonstração
    {
      id: '1',
      titulo: 'Novo contrato cadastrado',
      mensagem: 'O contrato #12345 foi cadastrado com sucesso no sistema.',
      tipo: 'sucesso',
      data: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      lida: false,
    },
    {
      id: '2',
      titulo: 'Fornecedor atualizado',
      mensagem: 'Os dados do fornecedor ABC Ltda foram atualizados.',
      tipo: 'info',
      data: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
      lida: false,
    },
    {
      id: '3',
      titulo: 'Relatório gerado',
      mensagem: 'O relatório mensal de contratos foi gerado e está disponível para download.',
      tipo: 'info',
      data: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
      lida: true,
    },
  ],
  notificacoesNaoLidas: 2,

  adicionarNotificacao: (notificacao) => {
    const novaNotificacao: Notificacao = {
      ...notificacao,
      id: Date.now().toString(),
      data: new Date(),
      lida: false,
    }

    set((state) => ({
      notificacoes: [novaNotificacao, ...state.notificacoes],
      notificacoesNaoLidas: state.notificacoesNaoLidas + 1,
    }))
  },

  marcarComoLida: (id) => {
    set((state) => {
      const notificacao = state.notificacoes.find((n) => n.id === id)
      if (!notificacao || notificacao.lida) return state

      return {
        notificacoes: state.notificacoes.map((n) =>
          n.id === id ? { ...n, lida: true } : n
        ),
        notificacoesNaoLidas: Math.max(0, state.notificacoesNaoLidas - 1),
      }
    })
  },

  marcarTodasComoLidas: () => {
    set((state) => ({
      notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true })),
      notificacoesNaoLidas: 0,
    }))
  },

  removerNotificacao: (id) => {
    set((state) => {
      const notificacao = state.notificacoes.find((n) => n.id === id)
      if (!notificacao) return state

      return {
        notificacoes: state.notificacoes.filter((n) => n.id !== id),
        notificacoesNaoLidas: notificacao.lida 
          ? state.notificacoesNaoLidas 
          : Math.max(0, state.notificacoesNaoLidas - 1),
      }
    })
  },

  limparVisualizadas: () => {
    set((state) => ({
      notificacoes: state.notificacoes.filter((n) => !n.lida),
      notificacoesNaoLidas: state.notificacoesNaoLidas,
    }))
  },

  limparTodas: () => {
    set({
      notificacoes: [],
      notificacoesNaoLidas: 0,
    })
  },
}))
