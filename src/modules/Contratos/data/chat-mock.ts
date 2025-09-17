import type { ChatMessage, ChatParticipante } from '../types/timeline'

// Mock data para participantes do chat
export const PARTICIPANTES_MOCK: ChatParticipante[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@prefeitura.com',
    avatar: '/avatars/joao.jpg',
    tipo: 'fiscal',
    status: 'online',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@prefeitura.com',
    avatar: '/avatars/maria.jpg',
    tipo: 'gestor',
    status: 'online',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    email: 'pedro@fornecedor.com',
    avatar: '/avatars/pedro.jpg',
    tipo: 'usuario',
    status: 'ausente',
    ultimoAcesso: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 min atrás
  },
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana.costa@prefeitura.com',
    avatar: '/avatars/ana.jpg',
    tipo: 'usuario',
    status: 'offline',
    ultimoAcesso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2h atrás
  }
]

// Mock data para mensagens do chat
export const MENSAGENS_MOCK: ChatMessage[] = [
  {
    id: '1',
    contratoId: 'contract-1',
    remetente: {
      id: PARTICIPANTES_MOCK[0].id,
      nome: PARTICIPANTES_MOCK[0].nome,
      avatar: PARTICIPANTES_MOCK[0].avatar,
      tipo: PARTICIPANTES_MOCK[0].tipo
    },
    conteudo: 'Boa tarde pessoal! Iniciando o acompanhamento do contrato. Alguma pendência inicial?',
    tipo: 'texto',
    dataEnvio: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lida: true
  },
  {
    id: '2',
    contratoId: 'contract-1',
    remetente: {
      id: 'sistema',
      nome: 'Sistema',
      tipo: 'sistema'
    },
    conteudo: 'João Silva foi designado como fiscal administrativo do contrato',
    tipo: 'sistema',
    dataEnvio: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    lida: true
  },
  {
    id: '3',
    contratoId: 'contract-1',
    remetente: {
      id: PARTICIPANTES_MOCK[1].id,
      nome: PARTICIPANTES_MOCK[1].nome,
      avatar: PARTICIPANTES_MOCK[1].avatar,
      tipo: PARTICIPANTES_MOCK[1].tipo
    },
    conteudo: 'Tudo tranquilo por aqui. O fornecedor já enviou a documentação inicial.',
    tipo: 'texto',
    dataEnvio: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    lida: true
  },
  {
    id: '4',
    contratoId: 'contract-1',
    remetente: {
      id: PARTICIPANTES_MOCK[2].id,
      nome: PARTICIPANTES_MOCK[2].nome,
      avatar: PARTICIPANTES_MOCK[2].avatar,
      tipo: PARTICIPANTES_MOCK[2].tipo
    },
    conteudo: 'Confirmando recebimento das especificações. Vamos dar início aos trabalhos na próxima segunda-feira.',
    tipo: 'texto',
    dataEnvio: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    lida: true
  },
  {
    id: '5',
    contratoId: 'contract-1',
    remetente: {
      id: PARTICIPANTES_MOCK[0].id,
      nome: PARTICIPANTES_MOCK[0].nome,
      avatar: PARTICIPANTES_MOCK[0].avatar,
      tipo: PARTICIPANTES_MOCK[0].tipo
    },
    conteudo: 'Perfeito! Estarei acompanhando o cronograma. Qualquer dúvida, podem me contatar.',
    tipo: 'texto',
    dataEnvio: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    lida: true
  }
]