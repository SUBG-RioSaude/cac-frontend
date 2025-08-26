import { create } from 'zustand'
import type {
  Contrato,
  FiltrosContrato,
  PaginacaoParams,
} from '@/modules/Contratos/types/contrato'
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
import { contratosMock } from '@/modules/Contratos/data/contratos-mock'

interface ContratosState {
  contratos: Contrato[]
  contratosFiltrados: Contrato[]
  termoPesquisa: string
  filtros: FiltrosContrato
  paginacao: PaginacaoParams
  contratosSelecionados: string[]

  // Alterações Contratuais
  alteracoesContratuais: Record<string, AlteracaoContratualState>

  // Chat
  chats: Record<string, ChatState>
  usersTyping: Record<string, TypingStatus[]>

  // Actions - Contratos
  setTermoPesquisa: (termo: string) => void
  setFiltros: (filtros: FiltrosContrato) => void
  limparFiltros: () => void
  setPaginacao: (paginacao: PaginacaoParams) => void
  selecionarContrato: (contratoId: string, selecionado: boolean) => void
  selecionarTodosContratos: (selecionado: boolean) => void
  filtrarContratos: () => void

  // Actions - Alterações Contratuais
  adicionarAlteracao: (contratoId: string, alteracao: AlteracaoContratualForm) => void
  atualizarAlteracao: (contratoId: string, alteracao: Partial<AlteracaoContratualForm>) => void
  removerAlteracao: (contratoId: string, alteracaoId: string) => void
  obterAlteracoes: (contratoId: string) => AlteracaoContratualForm[]

  // Actions - Chat
  adicionarMensagem: (contratoId: string, mensagem: ChatMessage) => void
  marcarMensagemComoLida: (contratoId: string, mensagemId: string) => void
  adicionarParticipante: (contratoId: string, participante: ChatParticipante) => void
  atualizarStatusParticipante: (contratoId: string, participanteId: string, status: ChatParticipante['status']) => void
  setUserTyping: (contratoId: string, userId: string, userName: string, isTyping: boolean) => void
  obterChat: (contratoId: string) => ChatState
  obterMensagensNaoLidas: (contratoId: string, userId: string) => number
}

export const useContratosStore = create<ContratosState>((set, get) => ({
  contratos: contratosMock,
  contratosFiltrados: contratosMock,
  termoPesquisa: '',
  filtros: {},
  paginacao: {
    pagina: 1,
    itensPorPagina: 10,
    total: contratosMock.length,
  },
  contratosSelecionados: [],
  
  // Estados iniciais para alterações contratuais e chat
  alteracoesContratuais: {},
  chats: {},
  usersTyping: {},

  setTermoPesquisa: (termo) => {
    set({ termoPesquisa: termo })
    get().filtrarContratos()
  },

  setFiltros: (filtros) => {
    set({ filtros })
    get().filtrarContratos()
  },

  limparFiltros: () => {
    set({
      filtros: {},
      termoPesquisa: '',
      paginacao: { ...get().paginacao, pagina: 1 },
    })
    get().filtrarContratos()
  },

  setPaginacao: (paginacao) => {
    set({ paginacao })
  },

  selecionarContrato: (contratoId, selecionado) => {
    const { contratosSelecionados } = get()
    if (selecionado) {
      set({ contratosSelecionados: [...contratosSelecionados, contratoId] })
    } else {
      set({
        contratosSelecionados: contratosSelecionados.filter(
          (id) => id !== contratoId,
        ),
      })
    }
  },

  selecionarTodosContratos: (selecionado) => {
    const { contratosFiltrados } = get()
    if (selecionado) {
      set({ contratosSelecionados: contratosFiltrados.map((c) => c.id) })
    } else {
      set({ contratosSelecionados: [] })
    }
  },

  filtrarContratos: () => {
    const { contratos, termoPesquisa, filtros } = get()
    let resultado = contratos

    // Filtro por termo de pesquisa
    if (termoPesquisa) {
      const termo = termoPesquisa.toLowerCase()
      resultado = resultado.filter(
        (contrato) =>
          contrato.numeroContrato?.toLowerCase().includes(termo) ||
          contrato.numeroCCon?.toLowerCase().includes(termo) ||
          contrato.contratada?.razaoSocial.toLowerCase().includes(termo) ||
          contrato.contratada?.cnpj.includes(termo) ||
          contrato.unidade?.toLowerCase().includes(termo),
      )
    }

    // Filtros avançados
    if (filtros.status && filtros.status.length > 0) {
      resultado = resultado.filter((contrato) =>
        filtros.status!.includes(contrato.status || ''),
      )
    }

    if (filtros.unidade && filtros.unidade.length > 0) {
      resultado = resultado.filter((contrato) =>
        filtros.unidade!.includes(contrato.unidade || ''),
      )
    }

    if (filtros.dataInicialDe) {
      resultado = resultado.filter(
        (contrato) => (contrato.dataInicial || '') >= filtros.dataInicialDe!,
      )
    }

    if (filtros.dataInicialAte) {
      resultado = resultado.filter(
        (contrato) => (contrato.dataInicial || '') <= filtros.dataInicialAte!,
      )
    }

    if (filtros.dataFinalDe) {
      resultado = resultado.filter(
        (contrato) => (contrato.dataFinal || '') >= filtros.dataFinalDe!,
      )
    }

    if (filtros.dataFinalAte) {
      resultado = resultado.filter(
        (contrato) => (contrato.dataFinal || '') <= filtros.dataFinalAte!,
      )
    }

    if (filtros.valorMinimo) {
      resultado = resultado.filter(
        (contrato) => (contrato.valor || 0) >= filtros.valorMinimo!,
      )
    }

    if (filtros.valorMaximo) {
      resultado = resultado.filter(
        (contrato) => (contrato.valor || 0) <= filtros.valorMaximo!,
      )
    }

    set({
      contratosFiltrados: resultado,
      paginacao: { ...get().paginacao, total: resultado.length, pagina: 1 },
    })
  },

  // Actions - Alterações Contratuais
  adicionarAlteracao: (contratoId, alteracao) => {
    const { alteracoesContratuais } = get()
    const estadoContrato = alteracoesContratuais[contratoId] || {
      alteracoes: [],
      alteracaoAtual: null,
      etapaAtual: 0,
      isLoading: false,
      errors: {}
    }

    const novaAlteracao = {
      ...alteracao,
      id: alteracao.id || Date.now().toString(),
      criadoEm: alteracao.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    set({
      alteracoesContratuais: {
        ...alteracoesContratuais,
        [contratoId]: {
          ...estadoContrato,
          alteracoes: [...estadoContrato.alteracoes, novaAlteracao]
        }
      }
    })
  },

  atualizarAlteracao: (contratoId, alteracaoAtualizada) => {
    const { alteracoesContratuais } = get()
    const estadoContrato = alteracoesContratuais[contratoId]
    if (!estadoContrato || !alteracaoAtualizada.id) return

    const alteracoesAtualizadas = estadoContrato.alteracoes.map(alteracao =>
      alteracao.id === alteracaoAtualizada.id
        ? { ...alteracao, ...alteracaoAtualizada, atualizadoEm: new Date().toISOString() }
        : alteracao
    )

    set({
      alteracoesContratuais: {
        ...alteracoesContratuais,
        [contratoId]: {
          ...estadoContrato,
          alteracoes: alteracoesAtualizadas
        }
      }
    })
  },

  removerAlteracao: (contratoId, alteracaoId) => {
    const { alteracoesContratuais } = get()
    const estadoContrato = alteracoesContratuais[contratoId]
    if (!estadoContrato) return

    const alteracoesFiltradas = estadoContrato.alteracoes.filter(
      alteracao => alteracao.id !== alteracaoId
    )

    set({
      alteracoesContratuais: {
        ...alteracoesContratuais,
        [contratoId]: {
          ...estadoContrato,
          alteracoes: alteracoesFiltradas
        }
      }
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
      mensagensNaoLidas: 0
    }

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          mensagens: [...chatAtual.mensagens, mensagem]
        }
      }
    })
  },

  marcarMensagemComoLida: (contratoId, mensagemId) => {
    const { chats } = get()
    const chatAtual = chats[contratoId]
    if (!chatAtual) return

    const mensagensAtualizadas = chatAtual.mensagens.map((mensagem: ChatMessage) =>
      mensagem.id === mensagemId ? { ...mensagem } : mensagem
    )

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          mensagens: mensagensAtualizadas,
          mensagensNaoLidas: Math.max(0, chatAtual.mensagensNaoLidas - 1)
        }
      }
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
      mensagensNaoLidas: 0
    }

    const participanteExiste = chatAtual.participantes.some((p: ChatParticipante) => p.id === participante.id)
    if (participanteExiste) return

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          participantes: [...chatAtual.participantes, participante]
        }
      }
    })
  },

  atualizarStatusParticipante: (contratoId, participanteId, status) => {
    const { chats } = get()
    const chatAtual = chats[contratoId]
    if (!chatAtual) return

    const participantesAtualizados = chatAtual.participantes.map((participante: ChatParticipante) =>
      participante.id === participanteId
        ? { ...participante, status, ultimoAcesso: new Date().toISOString() }
        : participante
    )

    set({
      chats: {
        ...chats,
        [contratoId]: {
          ...chatAtual,
          participantes: participantesAtualizados
        }
      }
    })
  },

  setUserTyping: (contratoId, userId, userName, isTyping) => {
    const { usersTyping } = get()
    const typingAtual = usersTyping[contratoId] || []

    let novoTyping: TypingStatus[]
    if (isTyping) {
      // Adicionar usuário se não estiver digitando
      const existeUsuario = typingAtual.some(t => t.userId === userId)
      if (!existeUsuario) {
        novoTyping = [...typingAtual, {
          participanteId: userId,
          userId,
          userName,
          isTyping: true,
          timestamp: Date.now()
        }]
      } else {
        novoTyping = typingAtual
      }
    } else {
      // Remover usuário
      novoTyping = typingAtual.filter(t => t.userId !== userId)
    }

    set({
      usersTyping: {
        ...usersTyping,
        [contratoId]: novoTyping
      }
    })

    // Auto-remover após 3 segundos
    if (isTyping) {
      setTimeout(() => {
        const current = get().usersTyping[contratoId] || []
        const filtered = current.filter(t => 
          t.userId !== userId || Date.now() - t.timestamp < 3000
        )
        
        set({
          usersTyping: {
            ...get().usersTyping,
            [contratoId]: filtered
          }
        })
      }, 3000)
    }
  },

  obterChat: (contratoId) => {
    const { chats } = get()
    return chats[contratoId] || {
      mensagens: [],
      participantes: [],
      contratoId,
      isLoading: false,
      isTyping: [],
      mensagensNaoLidas: 0
    }
  },

  obterMensagensNaoLidas: (contratoId, userId) => {
    const { chats } = get()
    const chat = chats[contratoId]
    if (!chat) return 0

    return chat.mensagens.filter((m: ChatMessage) => 
      m.autorId !== userId
    ).length
  },
}))
