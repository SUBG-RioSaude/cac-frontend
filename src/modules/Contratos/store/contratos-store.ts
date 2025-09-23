import { create } from 'zustand'
import type {
  AlteracaoContratualForm,
  AlteracaoContratualState,
} from '@/modules/Contratos/types/alteracoes-contratuais'
import type {
  ChatMessage,
  ChatParticipante,
  ChatState,
  TypingStatus,
} from '../types/chat'

interface ContratosState {
  // Alterações Contratuais
  alteracoesContratuais: Record<string, AlteracaoContratualState>

  // Chat
  chats: Record<string, ChatState>
  usersTyping: Record<string, TypingStatus[]>

  // Actions - Alterações Contratuais
  adicionarAlteracao: (
    contratoId: string,
    alteracao: AlteracaoContratualForm,
  ) => void
  atualizarAlteracao: (
    contratoId: string,
    alteracao: Partial<AlteracaoContratualForm>,
  ) => void
  removerAlteracao: (contratoId: string, alteracaoId: string) => void
  obterAlteracoes: (contratoId: string) => AlteracaoContratualForm[]

  // Actions - Chat
  adicionarMensagem: (contratoId: string, mensagem: ChatMessage) => void
  marcarMensagemComoLida: (contratoId: string, mensagemId: string) => void
  adicionarParticipante: (
    contratoId: string,
    participante: ChatParticipante,
  ) => void
  atualizarStatusParticipante: (
    contratoId: string,
    participanteId: string,
    status: ChatParticipante['status'],
  ) => void
  setUserTyping: (
    contratoId: string,
    userId: string,
    userName: string,
    isTyping: boolean,
  ) => void
  obterChat: (contratoId: string) => ChatState
  obterMensagensNaoLidas: (contratoId: string, userId: string) => number
}

export const useContratosStore = create<ContratosState>((set, get) => ({
  // Estados iniciais para alterações contratuais e chat
  alteracoesContratuais: {},
  chats: {},
  usersTyping: {},

  // Actions - Alterações Contratuais
  adicionarAlteracao: (contratoId, alteracao) => {
    const { alteracoesContratuais } = get()
    const estadoContrato = alteracoesContratuais[contratoId] || {
      alteracoes: [],
      alteracaoAtual: null,
      etapaAtual: 0,
      isLoading: false,
      errors: {},
    }

    const novaAlteracao = {
      ...alteracao,
      id: alteracao.id || Date.now().toString(),
      criadoEm: alteracao.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }

    set({
      alteracoesContratuais: {
        ...alteracoesContratuais,
        [contratoId]: {
          ...estadoContrato,
          alteracoes: [...estadoContrato.alteracoes, novaAlteracao],
        },
      },
    })
  },

  atualizarAlteracao: (contratoId, alteracaoAtualizada) => {
    const { alteracoesContratuais } = get()
    const estadoContrato = alteracoesContratuais[contratoId]
    if (!estadoContrato || !alteracaoAtualizada.id) return

    const alteracoesAtualizadas = estadoContrato.alteracoes.map((alteracao) =>
      alteracao.id === alteracaoAtualizada.id
        ? {
            ...alteracao,
            ...alteracaoAtualizada,
            atualizadoEm: new Date().toISOString(),
          }
        : alteracao,
    )

    set({
      alteracoesContratuais: {
        ...alteracoesContratuais,
        [contratoId]: {
          ...estadoContrato,
          alteracoes: alteracoesAtualizadas,
        },
      },
    })
  },

  removerAlteracao: (contratoId, alteracaoId) => {
    const { alteracoesContratuais } = get()
    const estadoContrato = alteracoesContratuais[contratoId]
    if (!estadoContrato) return

    const alteracoesFiltradas = estadoContrato.alteracoes.filter(
      (alteracao) => alteracao.id !== alteracaoId,
    )

    set({
      alteracoesContratuais: {
        ...alteracoesContratuais,
        [contratoId]: {
          ...estadoContrato,
          alteracoes: alteracoesFiltradas,
        },
      },
    })
  },

  obterAlteracoes: (contratoId) => {
    const { alteracoesContratuais } = get()
    return alteracoesContratuais[contratoId]?.alteracoes || []
  },

  // Actions - Chat
  adicionarMensagem: (contratoId, mensagem) => {
    const { chats } = get()
    const chatAtual = chats[contratoId] || {
      mensagens: [],
      participantes: [],
      contratoId,
      isLoading: false,
      isTyping: [],
      mensagensNaoLidas: 0,
    }

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          mensagens: [...chatAtual.mensagens, mensagem],
        },
      },
    })
  },

  marcarMensagemComoLida: (contratoId, mensagemId) => {
    const { chats } = get()
    const chatAtual = chats[contratoId]
    if (!chatAtual) return

    const mensagensAtualizadas = chatAtual.mensagens.map(
      (mensagem: ChatMessage) =>
        mensagem.id === mensagemId ? { ...mensagem } : mensagem,
    )

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          mensagens: mensagensAtualizadas,
          mensagensNaoLidas: Math.max(0, chatAtual.mensagensNaoLidas - 1),
        },
      },
    })
  },

  adicionarParticipante: (contratoId, participante) => {
    const { chats } = get()
    const chatAtual = chats[contratoId] || {
      mensagens: [],
      participantes: [],
      contratoId,
      isLoading: false,
      isTyping: [],
      mensagensNaoLidas: 0,
    }

    const participanteExiste = chatAtual.participantes.some(
      (p: ChatParticipante) => p.id === participante.id,
    )
    if (participanteExiste) return

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          participantes: [...chatAtual.participantes, participante],
        },
      },
    })
  },

  atualizarStatusParticipante: (contratoId, participanteId, status) => {
    const { chats } = get()
    const chatAtual = chats[contratoId]
    if (!chatAtual) return

    const participantesAtualizados = chatAtual.participantes.map(
      (participante: ChatParticipante) =>
        participante.id === participanteId
          ? { ...participante, status, ultimoAcesso: new Date().toISOString() }
          : participante,
    )

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          participantes: participantesAtualizados,
        },
      },
    })
  },

  setUserTyping: (contratoId, userId, userName, isTyping) => {
    const { usersTyping } = get()
    const typingAtual = usersTyping[contratoId] || []

    let novoTyping: TypingStatus[]
    if (isTyping) {
      // Adicionar usuário se não estiver digitando
      const existeUsuario = typingAtual.some((t) => t.userId === userId)
      if (!existeUsuario) {
        novoTyping = [
          ...typingAtual,
          {
            participanteId: userId,
            userId,
            userName,
            isTyping: true,
            timestamp: Date.now(),
          },
        ]
      } else {
        novoTyping = typingAtual
      }
    } else {
      // Remover usuário
      novoTyping = typingAtual.filter((t) => t.userId !== userId)
    }

    set({
      usersTyping: {
        ...usersTyping,
        [contratoId]: novoTyping,
      },
    })

    // Auto-remover após 3 segundos
    if (isTyping) {
      setTimeout(() => {
        const current = get().usersTyping[contratoId] || []
        const filtered = current.filter(
          (t) => t.userId !== userId || Date.now() - t.timestamp < 3000,
        )

        set({
          usersTyping: {
            ...get().usersTyping,
            [contratoId]: filtered,
          },
        })
      }, 3000)
    }
  },

  obterChat: (contratoId) => {
    const { chats } = get()
    return (
      chats[contratoId] || {
        mensagens: [],
        participantes: [],
        contratoId,
        isLoading: false,
        isTyping: [],
        mensagensNaoLidas: 0,
      }
    )
  },

  obterMensagensNaoLidas: (contratoId, userId) => {
    const { chats } = get()
    const chat = chats[contratoId]
    if (!chat) return 0

    return chat.mensagens.filter((m: ChatMessage) => m.autorId !== userId)
      .length
  },
}))
